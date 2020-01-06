const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const mySqlConnection = require("../db/db")

let user

router.get("/register", (req, res) => {
  if (!req.session.user) {
    res.statusCode = 200
    // res.setHeader('Content-Type', 'application/json');
    // res.send('Register page would be rendered in browser!');
    res.render("register")
  } else res.send("Not possible as you are logged in already")
  // else res.redirect('/dashboard?logout+for+that');
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
      // console.log(JSON.stringify(rows));
      // rowLength = rows.length;
      if (rows.length) errors.push({ msg: "Email already exists" })
      if (errors.length > 0) {
        res.statusCode = 400
        res.send(errors)
        // console.log('errors', errors);
        // res.render('register', {
        //   errors,
        //   name,
        //   email,
        //   password,
        //   password2,
        //   city,
        //   phone
        // });
      } else {
        pwdHash = bcrypt.hashSync(password, 10)
        var sql = `INSERT INTO users (name, email, phone, pwdHash) VALUES ?`
        const values = [[name, email, phone, pwdHash]]

        mySqlConnection.query(sql, [values], function(err) {
          if (err) res.status(500).send(err)
        })
        res.send("successfully registered")
        // res.redirect('/users/login?UserRegSuccess');
      }
    },
  )
})

router.get("/login", (req, res) => {
  if (!req.session.user)
    // res.send('success');
    res.render("login")
  else res.status(401).send("nope, logout")
  // else res.redirect('/dashboard?logout+for+that');
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
          // res.send(`<script>alert('success')</script>`);
          // res.redirect('/dashboard');
        } else {
          res.status(400).send("pwd incorrect")
        }
        // else res.redirect('/users/login?Pwds+donot+match');
      } else {
        res.status(400).send("email doesnot exist")
        // res.redirect('/users/login?email+does+not+exist');
      }
    },
  )
})

router.get("/logout", (req, res, next) => {
  if (req.session.user) {
    req.session.destroy(() => {
      res.status(200).send("logout success")
      // res.redirect('/users/login?logout+success');
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
      // res.redirect('/dashboard?contact+added');
    }
  } else res.send("login to post")
  // else res.redirect('/users/login?login to post');
})

router.get("/contacts", (req, res) => {
  if (req.session.user) {
    // res.send(req.session.contacts);
    mySqlConnection.query(
      "SELECT * FROM contacts WHERE userID = ?",
      [req.session.user.userID],
      (err, rows) => {
        if (err) res.status(500).send(err)
        req.session.contacts = rows
        res.status(200).send(rows)
        // res.render('view', {title: 'Contacts list', contacts: rows});
      },
    )
  } else res.status(401).send("login to view")
  // } else res.redirect('/users/login?login to view');
})

router.get("/contacts/:contactID", (req, res) => {
  if (req.session.user) {
    // res.render('contacts', {title: 'Edit Contact', contact: found});
    mySqlConnection.query(
      "SELECT * FROM contacts WHERE contactID = ? AND userID = ?",
      [req.params.contactID, req.session.user.userID],
      (err, rows) => {
        if (err) res.status(500).send(err)
        if (rows.length) res.status(200).send(rows[0])
        else res.status(404).send("contact not found")
        // res.render('contacts', {title: 'Edit Contact', contact: rows[0]});
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
              // res.redirect('/dashboard');
            },
          )
        }
        // res.render('contacts', {title: 'Edit Contact', contact: rows[0]});
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
              // res.redirect('/dashboard?delete successful');
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
    console.log(req.body)
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
  // else res.redirect('/users/login');
})

module.exports = router
