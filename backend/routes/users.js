const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mySqlConnection = require('../db/db');
let rowLength;

let user;

router.get('/register', (req, res) => {
  if (!req.session.user)
  res.render('register');
  else res.redirect('/dashboard?logout+for+that');
});


router.post('/register', (req, res) => {
  const { name, email, password, password2, city, phone } = req.body;
  console.log(req.body);
  let errors = [];

  if (!name || !email || !password || !password2 || !city || !phone) {
    errors.push({ msg: 'Please enter all fields' });
  }
  
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }
  mySqlConnection.query('SELECT * FROM users WHERE email = ?', [email], (err, rows, fields) => {
    if (err) throw new err;
    rowLength = rows.length;
  });
  
  if (!rowLength) errors.push({ msg: 'Email already exists' });

  if (errors.length > 0) {
    console.log('errors', errors);
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
      city,
      phone
    });

  } else {
    pwdHash = bcrypt.hashSync(password,10);
    var sql = `INSERT INTO users (name, email, city, phone, pwdHash) VALUES ?`;
    const values = [[name, email, city, phone, pwdHash]];

    mySqlConnection.query(sql, [values], function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
    res.redirect('/users/login?UserRegSuccess');
  }
});

router.get('/login', (req, res) => {
  if (!req.session.user)
    res.render('login');
  else res.redirect('/dashboard?logout+for+that');
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  mySqlConnection.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) throw new err;
    user = rows[0];
    if (user) {
      const result = bcrypt.compareSync(password, user.pwdHash);
      if (result) {
        req.session.user = user;

        mySqlConnection.query('SELECT * FROM contacts WHERE userID = ?', [user.userID], (err, contacts) => {
          if (err) throw err;
          req.session.contacts = contacts;
          res.redirect('/dashboard');
        });
      }
      else res.redirect('/users/login?Pwds+donot+match');
    }
    else {
      res.redirect('/users/login?email+does+not+exist');
    }
  });
});


router.get('/logout', (req, res, next) => {
  if (req.session.user) {
    // console.log('session exists');
      req.session.destroy(function() {
          res.redirect('/users/login?logout+success');
      });
  }
});

router.get('/contacts', (req, res) => {
  if (req.session.user) {
      res.render('contacts', { title: "Create new Contact", contact: false });
  }
  else res.redirect('/users/login?login+to+view');
});

router.post('/contacts', (req, res) => {
  if (req.session.user) {
    const { contactID, name, phone1, phone2, email } = req.body;
    let errors = [];
    if (!name || (!phone1 && !phone2)) errors.push({ msg: 'name or both phone numbers cannot be empty' });
    else {
      var sql = `INSERT INTO contacts (name, email, phone1, phone2, userID) VALUES ?`;
      const values = [[name, email, phone1, phone2, req.session.user.userID]];

      mySqlConnection.query(sql, [values], (err) => {
        if (err) throw err;
        console.log('recorded inserted');
      });
      res.redirect('/dashboard?contact+added');
    }
  }
  else res.redirect('/users/login?login to post');
});
// router.get('/view', (req, res) => {
//   res.render('view', { title: "Hi bro" });
// });

router.get('/view', (req, res) => {
  if (req.session.user) {
    // contacts: req.session.contacts
      mySqlConnection.query('SELECT * FROM contacts WHERE userID = ?', [req.session.user.userID], (err, rows) => {
        if (err) throw err;
        res.render('view', {title: 'Contacts list', contacts: rows});
      });
  } else res.redirect('/users/login?login to post');
});

router.get('/contacts/:contactID', (req, res) => {
  mySqlConnection.query('SELECT * FROM contacts WHERE contactID = ?', [req.params.contactID], (err, rows) => {
    if (err) throw err;
    res.render('contacts', {title: 'Edit Contact', contact: rows[0]})
          });
});

router.post('/contacts/:contactID', (req, res) => {
  const { name, phone1, phone2, email } = req.body;
  console.log(req.body);
  mySqlConnection.query('UPDATE contacts SET name=?, phone1=?, phone2=?, email=? WHERE contactID = ?', [name, phone1, phone2,email,req.params.contactID], (err, rows) => {
    if (err) throw err;
    res.redirect('/dashboard');
  });
});
router.get('/contacts/delete/:contactID', (req, res) => {
  console.log('okat');
  mySqlConnection.query('DELETE FROM contacts WHERE contactID = ?', [req.params.contactID], (err, rows) => {
    if (err) throw err;
    res.redirect('/dashboard?delete successful');
  });
});
router.post('/update', (req, res) => {
  if (req.session.user) {
    const { name, phone } = req.body;
    console.log(req.body);
    mySqlConnection.query('UPDATE users SET name=?, phone=? WHERE userID = ?', [name, phone, req.session.user.userID], (err, rows) => {
      if (err) throw err;
      req.session.user = {...req.session.user, ...req.body}
    res.redirect('/dashboard');
  });
  }
});

module.exports = router;
