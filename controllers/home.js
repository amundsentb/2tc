const User = require('../models/User');


/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  User.find({email: /example/i}, 'profile', function(err, users) {
    res.render('home', {
      title: 'Home',
      users: users,
    });
  })
// load the index.pug file
};
