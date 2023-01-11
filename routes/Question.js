const router = require('express').Router();
const questionsController = require('../controller/questionsController');
const authorizeUser = require('../middleware/authorizeUser');
const checkOwner = require('../middleware/checkOwner');

router.use(authorizeUser);
router.use(checkOwner);
router.get('/',questionsController.getAllQuestions);
router.post('/',questionsController.addNewQuestion);
router.put('/:id',questionsController.updateQuestion);
router.delete('/:id',questionsController.deleteQuestion);

module.exports = router;