$(document).ready(() => {
    const socket = io();
    let userName = "";

    // handles functionality to populate chat with messages stored in database
    socket.on('populate chat', (messages) => {
        for (msg of messages) {
            console.log(msg);
            let time = new Date(msg.time);
            sendMessage(`<li><b>${msg.author}</b>: ${msg.message} <sub>${formatTime(time)}</sub></li>`);
        }
    })

    // handles functionality when users signs in to the chat room
    $('#sign-in form').submit((e) => {
        e.preventDefault();
        $('#sign-in').addClass('hide');
        $('#chat-room').removeClass('hide');
        userName = $('#chat-name').val().trim();
        socket.emit('new user', userName); 
    })
    socket.on('new user', (msg) => {
        sendMessage(`<li>${msg} has entered the chat.</li>`);
    });
    
    // handles functionality when user sends a message
    $('#chat-room form').submit((e) => {
        e.preventDefault(); // prevents the page from refreshing when submitting forms
        socket.emit('chat message', $('#message').val());
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

// TODO: 
// Arrange the messages by date
formatTime = (date) => {
    let addZero = (i) => i < 10 ? "0" + i : i; 
    let h = addZero(date.getHours());
    let m = addZero(date.getMinutes());
    let s = addZero(date.getSeconds());
    return `${h}:${m}:${s}`;
}