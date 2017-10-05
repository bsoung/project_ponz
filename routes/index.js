const router = require('express').Router();
const { users } = require('../controllers');

router.get('/', (req, res) => {
	if (req.isAuthenticated()) {
		return res.redirect('/ponzvert');
	}
	let shortid = req.session.shortid;

	// console.log(req.flash('success')[0], 'flash');
	let successMessage = req.flash('success')[0];

	console.log(successMessage, 'successMessage');

	return res.render('landing/index', {
		shortid,
		successMessage
	});
});

router.get('/clear', (req, res) => {
	req.session.shortid = null;
	res.redirect('/');
});

// router.get("/scheme", (req, res) => {
//  res.render("scheme/index");
// });

module.exports = router;
