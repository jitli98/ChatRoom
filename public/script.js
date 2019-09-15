$(document).ready(() => {
    const socket = io();
    let userName = "";

    // handles functionality to populate chat with messages stored in database
    socket.on('populate chat', (messages) => {
        console.log(messages);
        messages.forEach((msg) => sendMessage(`<li><b>${msg.author}</b>: ${msg.message} <sub>${msg.time}</sub></li>`));
    })

    // handles functionality when users signs in to the chat room
    $('#sign-in form').submit((e) => {
        console.log('test');
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
        sendMessage(`<li><b>${msg.author}</b>: ${msg.message} <sub>${msg.time}</sub></li>`);
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