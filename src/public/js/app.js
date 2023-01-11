const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    console.log(cameras);
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

getCameras();

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
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
  console.log(camerasSelect.value);
  console.log();
});

getMedia();
