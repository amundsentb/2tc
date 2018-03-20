const passport = require('passport');
const User = require('../models/User');
const Message = require('../models/Message');

exports.sendMessage = (req,res) => {
  Message.create({
    subject: req.body.subject,
    body: req.body.messageBody,
    seen: false,
    senderName: req.body.senderName,
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

exports.getUnreadNumber = (req, res) => {
  Message.count({
    recipient: req.user._id,
    seen: false,
  }, function(err, count) {
    if (err) {console.log(err); next();}
    res.json(count);
  })
}

exports.putMessageSeen = (req, res) => {
  Message.findByIdAndUpdate(req.params.id, {seen: req.params.seenBool}, {new:true},
  function(err, message) {
    if (err) return res.status(500).send("There was a problem updating message.");
    res.status(200).send(message);
  });
}
