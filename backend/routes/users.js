const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mySqlConnection = require('../db/db');
let rowLength;
let loginRowLength;

let user;

router.get('/register', (req, res) => {
  if (!req.session.user)
  res.render('register');
  else res.redirect('/dashboard?logout+for+that');
});

router.post('/register', (req, res) => {
  // console.log("hi",req.body);
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
    res.redirect('login?UserRegSuccess');
  }
});

router.get('/login', (req, res) => {
  if (!req.session.user)
    res.render('login');
  else res.redirect('/dashboard?logout+for+that');
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  mySqlConnection.query('SELECT * FROM users WHERE email = ?', [email], (err, rows, fields) => {
    if (err) throw new err;
    loginRowLength = rows.length;
    user = rows[0];
    if (loginRowLength) {
      req.session.user = user;
      req.session.opp = 1;
      res.redirect('/dashboard');
    }
  });

});

router.get('/logout', (req, res, next) => {
  if (req.session.user) {
    console.log('session exists');
      req.session.destroy(() => {
          res.redirect('/users/login?logout+success');
      });
  }
});

module.exports = router;
