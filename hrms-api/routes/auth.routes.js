const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/me', authenticate(), (req, res) => {
  const { _id, username, email, role, lastLogin } = req.user;
  res.json({ _id, username, email, role, lastLogin });
});


router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
