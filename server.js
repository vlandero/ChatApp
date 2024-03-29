const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const moment = require('moment');

let users = [];
const userJoin = (id,username,room)=>{
    const user = {id,username,room};
    users.push(user);
    console.log(users);
    return user;
}
const getCurrentUser = (id)=>{
    return users.find(user=>user.id === id);
}
const userLeave = (id)=>{
    const index = users.findIndex(user=>user.id === id);

    if(index !==-1){
        return users.splice(index,1)[0];
    }
}
const getRoomUsers = (room)=>{
    return users.filter(user=>user.room === room);
}
formatMessage = (username,txt)=>{
    return{
        username,
        txt,
        time: moment().format('h:mm a')
    }
}
let botName = "ChatCord Bot";
const app = express();

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(__dirname + '/statics'));

io.on('connection',socket =>{
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room);
        
        socket.join(user.room);

        socket.emit('message',formatMessage(botName,'Welcome to ChatCord'));
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        })
    });
    

    //listen for chat msgs
    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id);
        console.log(user);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        if(user)
            {
                io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
                io.to(user.room).emit('roomUsers',{
                    room:user.room,
                    users:getRoomUsers(user.room)
                });
            }
        
    });
});

server.listen(80);