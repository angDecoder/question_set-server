const router = require('express').Router();
const solutionController = require('../controller/solutionController.js');
const authorizeUser = require('../middleware/authorizeUser');
const checkOwner = require('../middleware/checkOwner');

router.use(authorizeUser);
router.use(checkOwner);
router.get('/:id',solutionController.getSolution);
router.put('/:id',solutionController.updateSolution);

module.exports = router;