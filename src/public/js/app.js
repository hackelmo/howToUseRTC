const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");
const room = document.getElementById("room");
const myChat = document.getElementById("myChat");

let myStream;
let myPeerConnection;
let muted = true;
let roomName;
let cameraOff = false;
call.hidden = true;

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

myChat.querySelector("button").addEventListener("click", () => {
  const input = myChat.querySelector("input");
  const value = input.value;

  socket.emit("new_message", value, roomName, () => {
    //내가받는거
    addMessage(`You: ${value}`);
  });
  //벨류없애면 없는값이간다
  input.value = "";
});

//남들이받는거
socket.on("new_message", (msg) => {
  console.log("들어옴");
  addMessage(msg);
});

///////

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: "user" },
    });

    myFace.srcObject = myStream;
  } catch (err) {
    console.log(err);
  }
}

muteBtn.addEventListener("click", () => {
  myStream.getAudioTracks().forEach((element) => {
    element.enabled = !element.enabled;
  });

  if (muted) {
    muteBtn.innerText = "Unmute";
    muted = false;
  } else {
    muteBtn.innerText = "Mute";
    muted = true;
  }
});

cameraBtn.addEventListener("click", () => {
  myStream.getVideoTracks().forEach((element) => {
    element.enabled = !element.enabled;
  });
  if (cameraOff) {
    cameraBtn.innerText = "CameraOff";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "CameraOn";
    cameraOff = true;
  }
});

camerasSelect.addEventListener("input", () => {
  console.log();
});

// getMedia();
getCameras();

const welcomeForm = welcome.querySelector("form");

welcomeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = welcomeForm.querySelector("input");
  await startGame();
  socket.emit("join_room", input.value);

  roomName = input.value;
  input.value = "";
  const h3 = call.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
});

////// 이걸로  호영=> 태현 바꾸기
async function startGame() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

//브레이브
socket.on("welcome", async (data, roomNum) => {
  const h3 = call.querySelector("h3");
  h3.innerText = `Room ${roomName} (${roomNum})`;
  addMessage(`${data} : 입장`);
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});

socket.on("room_change", console.log);

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("bye", (data, roomNum) => {
  const h3 = call.querySelector("h3");
  h3.innerText = `Room : ${roomNum}`;
  addMessage(`${data} : 퇴장`);
});

//파폭
socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  //이게뭐야?
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

///RTC code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", (e) => {
    console.log("sent candidate");
    socket.emit("ice", e.candidate, roomName);
  });
  myPeerConnection.addEventListener("addstream", (data) => {
    const peersStream = document.getElementById("peersStream");
    peersStream.srcObject = data.stream;
  });
  myStream.getTracks().forEach((track) => {
    myPeerConnection.addTrack(track, myStream);
  });
}

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});
