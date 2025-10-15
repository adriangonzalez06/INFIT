// routes/user.js
const express = require('express');
const router = express.Router();
const firebaseAuth = require('../middleware/firebaseAuth');

router.get('/me', firebaseAuth, async (req, res) => {
  const { uid, name, email } = req.user;

  res.json({    
    uid,
    name,
    email
  });
});

module.exports = router;