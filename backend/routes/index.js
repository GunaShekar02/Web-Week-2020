const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('welcome'));
router.get('/home', (req, res) => res.send('welcome'));

router.get('/dashboard', (req, res) => {
  if (req.session.user)
    res.render('dashboard', {
      user: req.session.user,
    })
  else
    res.redirect('/users/login?login+to+view');
});

module.exports = router;
