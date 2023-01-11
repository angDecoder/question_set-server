const express = require('express');
const pool = require('../db/index');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const userController = require('../controller/userController');

const router = express.Router();

router.post('/register', userController.registerUser);

router.post('/login',userController.loginUser);

router.post('/refresh',userController.refreshToken)


module.exports = router