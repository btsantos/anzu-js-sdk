import Sora from "sora-js-sdk";

let RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
let RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;

/**
@class Anzu
*/
class Anzu {
  /**
   * @constructor
   */
  constructor(params={anzuUrl: null, soraUrl: null}) {
    this.url = params.anzuUrl === null ? "https://anzu.shiguredo.jp/api/" : params.anzuUrl;
    this.sora = new Sora(params.soraUrl === null ? "wss://anzu.shiguredo.jp/signaling" : params.soraUrl);
    this.upstreamPc;
    this.downstreamPc = {};
  }
  /**
   * アップストリームを開始する
   * @param {string} channelId - チャンネルID
   * @param {string} upstreamToken - アップストリームトークン
   * @param {object} constraints - LocalMediaStream オブジェクトがサポートするメディアタイプ
   * @param {object} videoElement - ストリームをプレイするビデオエレメント
   * @param {onSuccessCallback} onSuccess - 接続成功時のコールバック
   * @param {onErrorCallback} onError - エラー時のコールバック
   * @param {onCloseCallback} onClose - 接続切断時のコールバック
   * @example
   * var anzu = new Anzu();
   * anzu.startUpstream(
   *   "channelId",
   *   "token",
   *   {video: true},
   *   document.getElementById("local-video"),
   *   function(clientId) {
   *     // success
   *   },
   *   function(error) {
   *     // error
   *   },
   *   function(error) {
   *     // close
   *   }
   * )
   */
  startUpstream(channelId, upstreamToken, constraints, videoElement, onSuccess, onError, onClose) {
    let _getUserMedia = (constraints) => {
      return new Promise((resolve, reject) => {
        if (navigator.getUserMedia) {
          navigator.getUserMedia(constraints,
            (stream) => {
              resolve(stream);
            },
            (err) => {
              reject(err);
            }
          );
        } else {
          reject(message);
        }
      });
    };
    let _createPeerConnection = (params) => {
      this.sdplog("Upstream Offer", params.offer);
      let offer = params.offer;
      let stream = params.stream;
      return new Promise((resolve, reject) => {
        let pc = new RTCPeerConnection({iceServers: offer.iceServers});
        pc.addStream(stream);
        resolve({pc: pc, offer: offer});
      });
    };
    let _createAnswer = (params) => {
      let pc = params.pc;
      let offer = params.offer;
      return new Promise((resolve, reject) => {
        pc.setRemoteDescription(new RTCSessionDescription(offer), () => {
          pc.createAnswer((answer) => {
            this.sdplog("Upstream answer", params.offer);
            resolve({pc: pc, answer: answer, offer: offer});
          }, (error) => { reject(error); });
        }, (error) => { reject(error); });
      });
    };
    let connection = this.sora.connection(
      () => {
        _getUserMedia(constraints)
          .then((stream) => {
            return new Promise((resolve, reject) => {
              videoElement.src = window.URL.createObjectURL(stream);
              videoElement.play();
              let params = {role: "upstream", channelId: channelId, accessToken: upstreamToken};
              connection.connect(
                params,
                (offer) => { resolve({offer: offer, stream: stream}); },
                (error) => { reject(error); }
              );
            });
          })
          .then(_createPeerConnection)
          .then(_createAnswer)
          .then((params) => {
            return new Promise((resolve, reject) => {
              let pc = params.pc;
              let answer = params.answer;
              let offer = params.offer;
              pc.setLocalDescription(answer, () => {
                connection.answer(answer.sdp);
                this.upstreamPc = pc;
                resolve(params.offer.clientId)
                pc.onicecandidate = (event) => {
                  if (event.candidate !== null) {
                    console.info("====== candidate ======");
                    console.info(event.candidate);
                    connection.candidate(event.candidate);
                  }
                };
              }, (error) => { reject(error); });
            });
          })
          .then((clientId) => {
            onSuccess(clientId);
          })
          .catch((error) => {
            onError(error);
          });
      },
      onError,
      (e) => {
        videoElement.pause();
        videoElement.src = "";
        connection = null;
        this.upstreamPc = null;
        onClose(e);
      }
    );
  }
  /**
   * ダウンストリームを開始する
   * @param {string} channelId - チャンネルID
   * @param {string} downstreamToken - ダウンストリームトークン
   * @param {object} videoElement - ストリームをプレイするビデオエレメント
   * @param {onSuccessCallback} onSuccess - 接続成功時のコールバック
   * @param {onErrorCallback} onError - エラー時のコールバック
   * @param {onCloseCallback} onClose - 接続切断時のコールバック
   * @example
   * var anzu = new Anzu();
   * anzu.startDownstream(
   *   "channelId",
   *   "token",
   *   document.getElementById("remote-video"),
   *   function(clientId) {
   *     // success
   *   },
   *   function(error) {
   *     // error
   *   },
   *   function(error) {
   *     // close
   *   }
   * )
   */
  startDownstream(channelId, downstreamToken, videoElement, onSuccess, onError, onClose) {
    let _createPeerConnection = (params) => {
      this.sdplog("Downstream offer", params.offer);
      return new Promise((resolve, reject) => {
        let offer = params.offer;
        let pc = new RTCPeerConnection({iceServers: offer.iceServers});
        resolve({pc: pc, offer: offer});
      });
    };
    let _createAnswer = (params) => {
      let pc = params.pc;
      let offer = params.offer;
      return new Promise((resolve, reject) => {
        pc.setRemoteDescription(new RTCSessionDescription(offer), () => {
          pc.createAnswer((answer) => {
            this.sdplog("Downstream answer", params.offer);
            resolve({pc: pc, offer: offer, answer: answer});
          }, (error) => { reject(error); });
        }, (error) => { reject(error); });
        pc.onaddstream = (event) => {
          videoElement.src = window.URL.createObjectURL(event.stream);
          videoElement.play();
        };
      });
    };
    let connection = this.sora.connection(
      () => {
        new Promise((resolve, reject) => {
          let params = {role: "downstream", channelId: channelId, accessToken: downstreamToken};
          connection.connect(
            params,
            (offer) => { resolve({offer: offer}); },
            (error) => { reject(error); }
          );
        })
        .then(_createPeerConnection)
        .then(_createAnswer)
        .then((params) => {
          return new Promise((resolve, reject) => {
            let pc = params.pc;
            let answer = params.answer;
            let clientId = params.offer.clientId;
            pc.setLocalDescription(answer, () => {
              connection.answer(answer.sdp);
              this.downstreamPc[clientId] = pc;
              resolve(clientId)
              pc.onicecandidate = (event) => {
                if (event.candidate !== null) {
                  console.info("====== candidate ======");
                  console.info(event.candidate);
                  connection.candidate(event.candidate);
                }
              };
            }, onError);
          });
        })
        .then((clientId) => {
          onSuccess(clientId);
        })
        .catch((error) => {
          onError(error);
        });
      },
      onError,
      (e) => {
        videoElement.pause();
        videoElement.src = "";
        onClose(e);
      }
    );
  }
  sdplog(title, target) {
    console.info("========== " + title + " ==========");
    for (let i in target) {
      console.info(i + ":");
      console.info(target[i]);
    }
  }
}

module.exports = Anzu;
