/*
 * @Description:
 * @Author: didadida262
 * @Date: 2024-08-14 17:21:17
 * @LastEditors: didadida262
 * @LastEditTime: 2024-08-14 17:23:44
 */
const peer = new Peer(
  `${Math.floor(Math.random() * 2 ** 18)
    .toString(36)
    .padStart(4, 0)}`,
  {
    host: location.hostname,
    debug: 1,
    path: "/project_webrtc",
  },
);

window.peer = peer;

function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      window.localStream = stream; // A
      window.localAudio.srcObject = stream; // B
      window.localAudio.autoplay = true; // C
    })
    .catch((err) => {
      console.error(`you got an error: ${err}`);
    });
}
getLocalStream();

peer.on("open", () => {
  window.caststatus.textContent = `Your device ID is: ${peer.id}`;
});
