const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.status(200).send('home'));

router.get('/dashboard', (req, res) => {
  if (req.session.user)
    res.status(200).send(req.session.user)
  else
    res.status(401).send('login for this');
});

module.exports = router;
