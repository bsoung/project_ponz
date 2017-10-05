const { User } = require('../models');
const shortid = require('shortid');
const moment = require('moment');

module.exports = {
	index: async (req, res) => {
		try {
			const users = await User.findAll({ order: ['id'] });

			return res.json({
				confirmation: 'success',
				result: users
			});
		} catch (e) {
			return res.json({
				confirmation: 'fail',
				message: e.message
			});
		}
	},

	view: async (req, res) => {
		const id = req.params.id;

		try {
			const user = await User.findById(id);

			return res.json({
				confirmation: 'success',
				result: user
			});
		} catch (e) {
			return res.json({
				confirmation: 'fail',
				message: e.message
			});
		}
	},

	viewPonzvert: async (req, res) => {
		let id = req.user._id || req.session.user._id;

		let referralLink;

		try {
			const user = await User.findById(id)
				.populate('children')
				.populate('parent');

			const mapUser = user => {
				return {
					name: user.username,
					parent: user.parent ? user.parent.username : 'null',
					children: user.children.map(mapUser)
				};
			};

			if (process.env.NODE_ENV === 'production') {
				referralLink = `https://project-ponz.herokuapp.com/ponzvert/${user.shortid}`;
			} else {
				referralLink = `http://localhost:3000/ponzvert/${user.shortid}`;
			}

			return res.render('ponzvert/index', {
				user,
				referralLink,
				tree: [mapUser(user)]
			});
		} catch (e) {
			return res.json({
				confirmation: 'fail',
				message: e.message
			});
		}
	},

	createUser: async (req, res, next) => {
		// check if user exists
		let existingUser;
		try {
			existingUser = await User.findOne({
				username: req.body.username
			});

			if (existingUser) {
				return res.redirect('/');
			}
		} catch (e) {
			return res.json({
				confirmation: 'fail',
				message: e.message
			});
		}

		// create our user with random id
		try {
			// registering for another user
			if (req.session.shortid) {
				createChildUser(req, res);
				return;
			}

			const id = shortid.generate();
			req.body.shortid = id;

			const user = await User.create(req.body);

			req.flash(
				'success',
				'You have successfully signed up! Please log in to begin.'
			);

			return res.redirect('/');
		} catch (e) {
			console.error(e.stack);
			return res.json({
				confirmation: 'fail',
				message: e.message
			});
		}
	}
};

async function createChildUser(req, res) {
	let parentUser;
	try {
		parentUser = await User.findOne({ shortid: req.session.shortid });
		const id = shortid.generate();

		req.body.shortid = id;
		req.body.parent = parentUser._id;

		const childUser = await User.create(req.body);

		parentUser = await User.findByIdAndUpdate(
			parentUser._id,
			{ $push: { children: childUser._id } },
			{ new: true, upsert: true }
		);

		updatePoints(parentUser, 40);

		return res.redirect('/ponzvert');
	} catch (e) {
		return res.json({
			confirmation: 'fail',
			message: e.message
		});
	}
}

async function updatePoints(parentUser, points) {
	let newParentUser;
	try {
		if (!parentUser) return;
		await User.findByIdAndUpdate(parentUser._id, { $inc: { points: points } });
		newParentUser = await User.findById(parentUser.parent);

		if (points > 1) {
			points /= 2;
			points = Math.floor(points);
		}

		console.log(points, 'what is points?');
	} catch (err) {
		console.error(err);
	}
	return updatePoints(newParentUser, points);
}
