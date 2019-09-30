$(document).ready(() => {
    const socket = io();
    let userName = "";

    // handles functionality to populate chat with messages stored in database
    socket.on('populate chat', (messages) => {
        for (msg of messages) {
            let time = new Date(msg.time);
            sendMessage(`<li><b>${msg.author}</b>: ${msg.message} <sub>${formatTime(time)}</sub></li>`);
        }
    })

    // handles functionality when users signs in to the chat room
    socket.on('new user', () => {
        socket.emit('new user', localStorage.username);
        sendMessage(`<li>${localStorage.username} has entered the chat.</li>`);
    });
    
    // handles functionality when user sends a message
    $('#chat-room form').submit((e) => {
        e.preventDefault(); // prevents the page from refreshing when submitting forms
        if (!($('#message').val() === '')) {
            socket.emit('chat message', $('#message').val());
        }
        $('#message').val('');
    });
    socket.on('chat message', (msg) => {
        let time = new Date(msg.time);
        sendMessage(`<li><b>${msg.author}</b>: ${msg.message} <sub>${formatTime(time)}</sub></li>`);
    });

    // handles functionality when user exits the chat room
    socket.on('leave room', (msg) => {
        sendMessage(`<li>${msg.author} left the chat.</li>`)
    });

});

// Helper Functions
function sendMessage(msg) {
    const element = document.getElementById('messages');
    const shouldScroll = element.scrollHeight - element.scrollTop === element.clientHeight
    
    // append message to chat
    $('#messages').append(msg);

    if (!shouldScroll) {
        // Scroll to bottom
        messages.scrollTop = messages.scrollHeight;
    }
}

formatTime = (date) => {
    let addZero = (i) => i < 10 ? "0" + i : i; 
    let h = addZero(date.getHours());
    let m = addZero(date.getMinutes());
    let s = addZero(date.getSeconds());
    return `${h}:${m}:${s}`;
}