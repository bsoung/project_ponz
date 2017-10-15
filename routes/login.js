const router = require('express').Router();

router.get('/', (req, res) => {
	res.render('login/index');
})

module.exports = router;