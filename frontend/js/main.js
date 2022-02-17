const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get params from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true 
});

const socket = io();

//Join room
socket.emit('joinRoom', { username, room })

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
    fetchRoomName(room);
    fetchUsers(users);
})

//Message from server
socket.on('message', message => {
    displayMessage(message);

    //auto scrolling on new msg
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Sending message(submitting form)
chatForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const msg = evt.target.elements.msg.value;

    //sending message to server
    socket.emit('chatMessage', msg);

    //clear textarea
    evt.target.elements.msg.value = '';
    evt.target.elements.msg.focus();
})

//display message function
function displayMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.txt}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room to HTML
function fetchRoomName(room){
    roomName.innerText = room;
}

function fetchUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}