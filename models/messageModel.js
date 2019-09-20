const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    author: {
        type: String,
        required: [true, 'Message requires an author.']
    },
    message: {
        type: String,
        required: [true, "Message requires some text."]
    },
    time: {
        type: Date,
        required: [true, "Message requires time delivered."]
    }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;