const passport = require('passport');
const User = require('../models/User');
const Message = require('../models/Message');

exports.sendMessage = (req,res) => {
  console.log(req.body);
  Message.create({
    subject: req.body.subject,
    body: req.body.messageBody,
    seen: false,
    sender: req.body.senderID,
    recipient: req.body.recipientID
  }, function(err, message) {
    if (err) {
      return next(err);
    }
    req.flash('success', { msg: 'msg sent.' });
    res.redirect('/users/' + req.body.recipientID);
  });

}
exports.getInbox = (req,res) => {
  Message.find({
    recipient: req.user._id
  }).
  exec(function(err, messages) {
    console.log(messages);
    res.render('inbox', {
      messages: messages

    });
  });
}

exports.getUserAndMessages = (req, res) => {
  Message.find({
    recipient: req.user._id
  }).
  exec(function(err, messages) {
    res.json([req.user, messages]);
  });

}
