const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  subject: String,
  body: String,
  seen: Boolean,
  senderName: String,
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

var Message = mongoose.model('Message', messageSchema);
module.exports = Message;
