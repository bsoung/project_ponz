const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { User } = require('../models');

module.exports = passport => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use(
        'local-login',
        new LocalStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            (req, username, password, done) => {
                User.findOne({ username: username }, (err, user) => {
                    if (err) return done(err);

                    if (!user) {
                        return done(null, false);
                    }

                    if (!bcrypt.compareSync(password, user.password)) {
                        return done(null, false);
                    }

                    return done(null, user);
                });
            }
        )
    );
};
