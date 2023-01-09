const { remote } = require('electron');

const { writeFile } = require('fs');

const { dialog } = remote;

// Global state
let mediaRecorder;
let recordedChunks = [];
let reocrdList = [];
let audioURL;
let itemId = -1;

// Accessing functional buttons
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const saveBtn = document.getElementById('saveBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Accessing Saved Audio HTML Element
const listTag = document.querySelector('ul');

pauseBtn.disabled = true;
saveBtn.disabled = true;
downloadBtn.disabled = true;

startBtn.onclick = e => {
  document.getElementById('audio').innerHTML = '';
  setupSourceAndStartRecording();
  startBtn.classList.add('is-warning');
  startBtn.innerText = 'Recording...';
  startBtn.disabled = true;
  pauseBtn.disabled = false;
};

pauseBtn.onclick = e => {
  pauseBtn.classList.add('is-warning');

  if (pauseBtn.innerText == 'Paused') {
    pauseBtn.innerText = 'Pause'
    startBtn.innerText = "Recording..."
    mediaRecorder.resume();
  }
  else { 
    pauseBtn.innerText = 'Paused';
    startBtn.innerText = "Recording paused"
    mediaRecorder.pause();
  }

  startBtn.classList.add('is-green');
};

stopBtn.onclick = e => {
  startBtn.disabled = false;

  mediaRecorder.stop();
  pauseBtn.innerText = 'Pause';

  startBtn.classList.remove('is-warning');
  startBtn.innerText = 'Start';

  saveBtn.disabled = false;
  downloadBtn.disabled = false;

  pauseBtn.disabled = true;
};

saveBtn.onclick = e => {
  storeAudioToList();
}

downloadBtn.onclick = e => {
  downloadAudio();
}

function setupSourceAndStartRecording() {

  const constraints = {
    audio: true
  };

  // Create a Stream
  const devices = navigator.mediaDevices
    .getUserMedia(constraints);

  // Create the Media Recorder
  const options = { type: 'audio/ogg; codecs=opus' };
  devices.then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => {
      recordedChunks.push(e.data);
      if (mediaRecorder.state == 'inactive') {
        let blob = new Blob(recordedChunks, options);
        createAudioPlayer(blob);
        document.getElementById('current-player').src = audioURL;
      }
    }
    mediaRecorder.start();
  });
}

function createAudioPlayer(blob) {
  let audio = document.getElementById('audio');
  let mainAudio = document.createElement('audio');
  mainAudio.setAttribute('controls', 'controls');
  mainAudio.setAttribute('id', 'current-player');
  audio.appendChild(mainAudio);
  audioURL = URL.createObjectURL(blob);
}

function downloadAudio() {
  const downloadLink = document.createElement('a')
  downloadLink.href = audioURL
  downloadLink.setAttribute('download', 'audio')
  downloadLink.click()
}

function storeAudioToList(time) {

  itemId += 1;
  reocrdList[itemId] = audioURL;
  let audioListItem = document.createElement('li');
  audioListItem.setAttribute('controls', 'controls');
  audioListItem.setAttribute('id', 'list-item-'+itemId);
  audioListItem.innerText = `Audio: ${itemId + 1}`;
  audioListItem.style = {
    marginLeft: '0px',
  }
  
  let audioTag = document.createElement('audio');
  audioTag.setAttribute('controls', 'controls');
  audioTag.setAttribute('id', 'audio-list-item-'+itemId);
  audioTag.src = reocrdList[itemId];
  audioTag.style = {
    marginTop: '20px',
  }
  

  audioListItem.appendChild(audioTag);

  listTag.appendChild(audioListItem);
}
