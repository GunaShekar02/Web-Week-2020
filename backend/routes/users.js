const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const mySqlConnection = require("../db/db")

let user

router.get("/register", (req, res) => {
  if (!req.session.user) {
    res.statusCode = 200
    res.send('register form will be here')
  } else res.send("Not possible as you are logged in already")
})

router.post("/register", (req, res) => {
  const { name, email, password, password2, phone } = req.body
  let errors = []

  if (!name || !email || !password || !password2 || !phone) {
    errors.push({ msg: "Please enter all fields" })
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" })
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" })
  }
  mySqlConnection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) res.status(500).send(err)
      if (rows.length) errors.push({ msg: "Email already exists" })
      if (errors.length > 0) {
        res.statusCode = 400
        res.send(errors)
      } else {
        pwdHash = bcrypt.hashSync(password, 10)
        var sql = `INSERT INTO users (name, email, phone, pwdHash) VALUES ?`
        const values = [[name, email, phone, pwdHash]]

        mySqlConnection.query(sql, [values], function(err) {
          if (err) res.status(500).send(err)
        })
        res.send("successfully registered")
      }
    },
  )
})

router.get("/login", (req, res) => {
  if (!req.session.user)
    res.render("login")
  else res.status(401).send("nope, logout")
})

router.post("/login", (req, res) => {
  const { email, password } = req.body
  mySqlConnection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) res.status(500).send(err)
      user = rows[0]
      if (user) {
        const result = bcrypt.compareSync(password, user.pwdHash)
        if (result) {
          req.session.user = user
          res.status(200).send(user)
        } else {
          res.status(400).send("pwd incorrect")
        }
      } else {
        res.status(400).send("email doesnot exist")
      }
    },
  )
})

router.get("/logout", (req, res, next) => {
  if (req.session.user) {
    req.session.destroy(() => {
      res.status(200).send("logout success")
    })
  } else {
    res.status(400).send("you are not logged in")
  }
})


router.post("/contacts", (req, res) => {
  if (req.session.user) {
    const { name, phone, relationship, email } = req.body
    let errors = []
    if (!name || (!phone && !relationship))
      errors.push({ msg: "name or both phone numbers cannot be empty" })
    else {
      var sql = `INSERT INTO contacts (name, email, phone, relationship, userID) VALUES ?`
      const values = [
        [name, email, phone, relationship, req.session.user.userID],
      ]

      mySqlConnection.query(sql, [values], err => {
        if (err) res.status(500).send(err)
        res.send("contact saved")
      })
    }
  } else res.send("login to post")
})

router.get("/contacts", (req, res) => {
  if (req.session.user) {
    mySqlConnection.query(
      "SELECT * FROM contacts WHERE userID = ?",
      [req.session.user.userID],
      (err, rows) => {
        if (err) res.status(500).send(err)
        req.session.contacts = rows
        res.status(200).send(rows)
      },
    )
  } else res.status(401).send("login to view")
})

router.get("/contacts/:contactID", (req, res) => {
  if (req.session.user) {
    mySqlConnection.query(
      "SELECT * FROM contacts WHERE contactID = ? AND userID = ?",
      [req.params.contactID, req.session.user.userID],
      (err, rows) => {
        if (err) res.status(500).send(err)
        if (rows.length) res.status(200).send(rows[0])
        else res.status(404).send("contact not found")
      },
    )
  } else {
    res.send("login karo")
  }
})

router.post("/contacts/:contactID", (req, res) => {
  if (req.session.user) {
    const { name, phone, relationship, email } = req.body
    mySqlConnection.query(
      "SELECT * FROM contacts WHERE contactID = ? AND userID = ?",
      [req.params.contactID, req.session.user.userID],
      (err, rows) => {
        if (err) res.status(500).send(err)
        if (!rows.length) res.status(401).send("you don't have this contact")
        else {
          mySqlConnection.query(
            "UPDATE contacts SET name=?, phone=?, relationship=?, email=? WHERE contactID = ?",
            [name, phone, relationship, email, req.params.contactID],
            err => {
              if (err) res.status(500).send(err)
              res.status(200).send("updated")
            },
          )
        }
      },
    )
  } else res.status(401).send("login to update")
})
router.get("/contacts/delete/:contactID", (req, res) => {
  if (req.session.user) {
    mySqlConnection.query(
      "SELECT * FROM contacts WHERE contactID = ? AND userID = ?",
      [req.params.contactID, req.session.user.userID],
      (err, rows) => {
        if (err) res.status(500).send(err)
        else if (!rows.length) res.status(401).send("you don't have this contact")
        else {
          mySqlConnection.query(
            "DELETE FROM contacts WHERE contactID = ?",
            [req.params.contactID],
            (err, rows) => {
              if (err) res.status(500).send(err)
              res.status(200).send(`deleted successfully`)
            },
          )
        }
      },
    )
  } else {
    res.send("login karo")
  }
})
router.post("/update", (req, res) => {
  if (req.session.user) {
    const { name, phone } = req.body
    mySqlConnection.query(
      "UPDATE users SET name=?, phone=? WHERE userID = ?",
      [name, phone, req.session.user.userID],
      (err, rows) => {
        if (err) throw err
        req.session.user = { ...req.session.user, ...req.body }
        res.send(req.session.user)
      },
    )
  } else res.send("please login")
})

module.exports = router
