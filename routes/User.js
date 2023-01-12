const express = require('express');

const userController = require('../controller/userController');

const router = express.Router();

router.post('/register', userController.registerUser);

router.post('/login',userController.loginUser);

router.post('/autologin',userController.autoLoginUser);

router.post('/refresh',userController.refreshToken);

router.post('/logout',userController.logoutUser);


module.exports = router