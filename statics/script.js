const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
//get username and room

const{username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});


const socket = io();

socket.emit('joinRoom',{username,room});

socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
})

socket.on('message',message =>{
    console.log(message);
    outputMessage(message);
    //scrolldown
    chatMessages.scrollTop = chatMessages.scrollHeight;


});

chatForm.addEventListener('submit',(ev)=>{
    ev.preventDefault();
    const msg = ev.target.elements.msg.value;
    
    socket.emit('chatMessage',msg);

    //clear input
    ev.target.elements.msg.value = '';
    ev.target.elements.msg.focus();
})

const outputMessage = (message)=>{
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.txt}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

const outputRoomName = (room)=>{
    roomName.innerText = room;
}
const outputUsers = (users)=>{
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}