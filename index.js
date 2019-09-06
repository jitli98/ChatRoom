const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

io.on('connect', (socket) => {
    // Broadcast message to all users when a new user enters the chat
    socket.on('new user', (msg) => {
        socket.username = msg;
        io.emit('new user', socket.username);
    })

    // Handles messages in the chatroom
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);   
    });

    // Broadcast message to all users when someone leaves the chat
    socket.on('disconnect', () => {
        socket.broadcast.emit('leave room', socket.username);
    });
});

const port = 3000;
http.listen(port, () => {
    console.log(`App is running on port ${port}......`);
})