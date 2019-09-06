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
        // socket.broadcast.to(id).emit('my message', msg);
        const now = new Date();
        const formattedTime = formatTime(now);
        const time = formattedTime.hour + ":" + formattedTime.minute + ":" + formattedTime.second;
        io.emit('chat message', {
            message: msg,
            author: socket.username,
            time: time
        });   
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

  