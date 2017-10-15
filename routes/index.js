const router = require('express').Router();

router.get('/', (req, res) => {
	res.render('landing/index');
});

router.get('/clear', (req, res) => {
	req.session.shortid = null;
	res.redirect('/register');
});

module.exports = router;
