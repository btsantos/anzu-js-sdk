import Sora from "sora.js";
import request from "superagent";


let RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
let RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;

class Anzu {
  constructor() {
    // TODO(yuito): url を修正する
    this.url = "http://localhost:8081/";
    this.sora = new Sora("ws://127.0.0.1:5000/signaling");
  }
  startUpstream(channelId, upstreamToken, videoElement, onSuccess, onError, onClose) {
    let connection = this.sora.connection(
      () => {
        navigator.getUserMedia({video: true}, function(stream) {
          videoElement.src = window.URL.createObjectURL(stream);
          videoElement.play();
          connection.connect({role: "upstream", channelId: channelId, accessToken: upstreamToken}, (message) => {
            let config = {
              "iceServers": [{"urls": "stun:stun.l.google.com:19302"}]
            };
            let pc = new RTCPeerConnection(config);
            pc.addStream(stream);
            pc.setRemoteDescription(new RTCSessionDescription(message), function() {
              pc.createAnswer(function(answer) {
                pc.setLocalDescription(answer, function() {
                  connection.answer(answer.sdp);
                  pc.onicecandidate = function(event) {
                    if (event.candidate !== null) {
                      connection.candidate(event.candidate);
                    }
                  };
                }, onError);
              }, onError);
            }, onError);
          }, onError);
          onSuccess();
        }, onError);
      },
      onError,
      (e) => {
        videoElement.pause();
        videoElement.src = "";
        connection = null;
        onClose(e);
      }
    );
  }
  startDownstream(channelId, downstreamToken, videoElement, onSuccess, onError, onClose) {
    let connection = this.sora.connection(
      () => {
        connection.connect({role: "downstream", channelId: channelId, accessToken: downstreamToken}, (message) => {
          let config = {
            "iceServers": [{"urls": "stun:stun.l.google.com:19302"}]
          };
          let pc = new RTCPeerConnection(config);
          pc.setRemoteDescription(new RTCSessionDescription(message), () => {
            pc.createAnswer((answer) => {
              pc.setLocalDescription(answer, () => {
                connection.answer(answer.sdp);
                pc.onicecandidate = (event) => {
                  if (event.candidate !== null) {
                    connection.candidate(event.candidate);
                  }
                };
              }, onError);
            }, onError);
          }, onError);
          pc.onaddstream = (event) => {
            videoElement.src = window.URL.createObjectURL(event.stream);
            videoElement.play();
          };
        }, onError);
        onSuccess();
      },
      onError,
      (e) => {
        videoElement.pause();
        videoElement.src = "";
        onClose(e);
      }
    );
  }
  getDownstreamToken(channelId, apiKey, date, signature, onEnd) {
    request
      .post(this.url)
      .set("x-anzu-target", "AnzuAPI_20151216.GetDownstreamToken")
      .set("x-anzu-apikey", apiKey)
      .set("x-anzu-date", date)
      .set("x-anzu-signature", signature)
      .send({channelId: channelId})
      .end((e, res) => {
        onEnd(e, res);
      });
  }
}

module.exports = Anzu;
