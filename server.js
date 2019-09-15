const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const Message = require('./models/messageModel');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});


/********* MIDDLEWARE **********/
app.use(express.static(`${__dirname}/public`)); // for allowing access to static files in public directory

/******** ROUTEHANDLERS ********/
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

/********* SOCKET.IO  **********/
io.on('connect', (socket) => {
    // Populates chat wih past messages stored in the database
    populateChat();

    // Broadcast message to all users when a new user enters the chat
    socket.on('new user', (msg) => {
        socket.username = msg;
        io.emit('new user', socket.username);
    });

    // Handles messages in the chatroom
    // Saves message to the database
    socket.on('chat message', (msg) => {
        // socket.broadcast.to(id).emit('my message', msg);
        const now = new Date();
        const formattedTime = formatTime(now);
        const time = formattedTime.hour + ":" + formattedTime.minute + ":" + formattedTime.second;
        const messageObject = {
            message: msg,
            author: socket.username,
            time: time
        };
        Message.create(messageObject, (err, data) => {
            if (err) throw new Error('Failed to save message in Database');
            console.log(data);
        });
        io.emit('chat message', messageObject);   
    });

    // Broadcast message to all users when someone leaves the chat
    socket.on('disconnect', () => {
        socket.broadcast.emit('leave room', {
            author: socket.username
        });
    });

});

/********* CONNECTS TO DATABASE *********/
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB connection is successful!');
})


/********* SERVER *********/
const port = 3000;
http.listen(port, () => {
    console.log(`App is running on port ${port}......`);
})

/**** Helper Functions ****/
formatTime = (date) => {
    let addZero = (i) => i < 10 ? "0" + i : i; 
    let h = addZero(date.getHours());
    let m = addZero(date.getMinutes());
    let s = addZero(date.getSeconds());
    return {
        hour: h,
        minute: m,
        second: s
    }
}

populateChat = async () => {
    try {
        const messages = await Message.find();
        io.emit('populate chat', messages); // messages is an array
    } catch(err) {
        throw new Error(err);
    }
}


//TODO: Include functionality that populates the webpage with existing messages fron the database if there are any.
  
//TODO: Write a method that checks the database if there are more than 50 words
// If there are, remove the earliest message sent and add the current message to the database.