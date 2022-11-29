const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
//get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// join chat room
socket.emit("joinRoom", { username, room });

//get users and room info
socket.on("roomUsers", ({ room, users }) => {
  console.log(users);
  displayInfo(room, users);
});

//Message from server
socket.on("message", (message) => {
  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // get msg text
  const msg = e.target.elements.msg.value;

  //emitting msg to the server
  socket.emit("chatMessage", msg);

  //clear input and focus
  e.target.elements.msg.value = "";

  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
						<p class="text">
            ${message.text}
						</p>`;

  document.querySelector(".chat-messages").appendChild(div);
}

function displayInfo(room, users) {
  const RoomName = document.getElementById("room-name");
  RoomName.innerHTML = `${room}`;
  const usersList = document.getElementById("users");
  usersList.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
  console.log(usersList);
}
