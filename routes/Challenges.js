const router = require('express').Router();
const authorizeUser = require('../middleware/authorizeUser');
const challengeController = require('../controller/challengeController');

router.use(authorizeUser);
router.get('/' ,challengeController.getAllChallenges);
router.post('/add',challengeController.addNewChallenge);
router.put('/:id',async (req,res)=>{
    const id = req.params.id;
});

module.exports = router;