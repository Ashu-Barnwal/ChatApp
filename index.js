const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const { format } = require('path');
const formatMsg = require('./modules/message');
const { 
    userJoin, 
    getCurrentUser,
    userDisconnect,
    getRoomUsers
} = require('./modules/users');

const app = express();
const index = http.createServer(app);
const io = socketio(index);

const botName = 'Chat App BOT'

//Static folder for html
app.use(express.static(path.join(__dirname, 'frontend')));

//When client connects
io.on('connection', socket => {
    //join room
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //Welcome current user
        socket.emit('message', formatMsg(botName, 'Welcome to the chat App'));

        //Broadcast when user connects
        socket.broadcast.to(user.room).emit('message', formatMsg(botName, `${user.username} joined`));

        //retrieve users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    //Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMsg(user.username, msg));
    });

    //On disconnecting user
    socket.on('disconnect', () => {
        const user = userDisconnect(socket.id)
        if(user){
            io.to(user.room).emit('message', formatMsg(botName, `${user.username} left`));

            //retrieve users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });
})

const PORT = 3000

index.listen(PORT, () => console.log(`server running on port ${PORT}`));