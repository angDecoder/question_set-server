const router = require('express').Router();
const authorizeUser = require('../middleware/authorizeUser');
const challengeController = require('../controller/challengeController');
// const checkOwner = require('../middleware/checkOwner');

router.use(authorizeUser);
router.get('/' ,challengeController.getAllChallenges);
router.post('/add',challengeController.addNewChallenge);
router.put('/:id',challengeController.updateChallenge);
router.delete('/:id',challengeController.deleteChallenge);
// router.put('/:id/updatetags')

module.exports = router;