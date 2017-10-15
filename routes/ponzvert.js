const router = require('express').Router();
const { isLoggedIn } = require('../middleware');
const { users } = require('../controllers');

router.get('/', isLoggedIn, users.viewPonzvert);

router.get('/:shortid', (req, res) => {
	req.session.shortid = req.params.shortid;
	return res.redirect('/register');
});

module.exports = router;
