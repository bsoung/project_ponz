const router = require("express").Router();

router.get("/", (req, res) => {
	// if (req.isAuthenticated()) {
	// 	return res.redirect('/ponzvert');
	// }

	let shortid = req.session.shortid;
	let successMessage = req.flash("success")[0];

	res.render("register/index", {
		shortid,
		successMessage
	});
});

module.exports = router;
