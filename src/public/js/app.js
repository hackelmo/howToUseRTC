const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

let myStream;
let myPeerConnection;
let muted = true;
let roomName;
let cameraOff = false;
call.hidden = true;

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
    muteBtn.innerText = "Mute";
    muted = false;
  } else {
    muteBtn.innerText = "Unmute";
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
});

////// 이걸로  호영=> 태현 바꾸기
async function startGame() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

//브레이브
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
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
    // console.log("peer스트림", data.stream);
    // console.log("myStreamsdfm", myStream);
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
