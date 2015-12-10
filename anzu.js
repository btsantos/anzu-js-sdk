import Sora from "sora-js-sdk";
import fetch from "isomorphic-fetch";


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
   *   function() {
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
      console.log("====== offer ======");
      console.log(params.offer);
      console.log("====== offer sdp ======");
      console.log(params.offer.sdp);
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
            console.log("====== answer ======");
            console.log(answer);
            console.log("====== answer sdp ======");
            console.log(answer.sdp);
            resolve({pc: pc, answer: answer});
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
              pc.setLocalDescription(answer, () => {
                connection.answer(answer.sdp);
                pc.onicecandidate = (event) => {
                  if (event.candidate !== null) {
                    console.log("====== candidate ======");
                    console.log(event.candidate);
                    connection.candidate(event.candidate);
                  }
                };
              }, (error) => { reject(error); });
              this.upstreamPc = pc;
            });
          })
          .then(() => {
            onSuccess();
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
   *   function() {
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
      console.log("====== offer ======");
      console.log(params.offer);
      console.log("====== offer sdp ======");
      console.log(params.offer.sdp);
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
            console.log("====== answer ======");
            console.log(answer);
            console.log("====== answer sdp ======");
            console.log(answer.sdp);
            resolve({pc: pc, offer: offer, answer: answer});
          }, (error) => { reject(error); });
        }, (error) => { reject(error); });
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
              pc.onicecandidate = (event) => {
                if (event.candidate !== null) {
                  console.log("====== candidate ======");
                  console.log(event.candidate);
                  connection.candidate(event.candidate);
                }
              };
            }, onError);
            pc.onaddstream = (event) => {
              videoElement.src = window.URL.createObjectURL(event.stream);
              videoElement.play();
            };
            this.downstreamPc[clientId] = pc;
          });
        })
        .then(() => {
          onSuccess();
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
  /**
   * ダウンストリームトークンを取得する
   * @param {string} channelId - チャンネルID
   * @param {string} apiKey - APIキー
   * @param {string} date - 日時
   * @param {string} signature - シグネチャー
   * @example
   * var anzu = new Anzu();
   * anzu.generatetDownstreamToken("channelId", "apiKey", "2015-01-01T00:00:00.000000", "signature")
   *     .then(function(response) {
   *       console.log(response.downstreamToken);
   *     });
   */
  generateDownstreamToken(channelId, apiKey, date, signature) {
    return fetch(this.url, {
      method: "POST",
      headers: {
        "x-anzu-target": "AnzuAPI_20151216.GenerateDownstreamToken",
        "x-anzu-apikey": apiKey,
        "x-anzu-date": date,
        "x-anzu-signature": signature
      },
      body: JSON.stringify({channelId: channelId})
    }).then((response) => {
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      return response.json();
    });
  }
  /**
   * 特定の接続を切断する
   * @param {string} channelId - チャンネルID
   * @param {string} clientId - クライアントID
   * @param {string} apiKey - APIキー
   * @param {string} date - 日時
   * @param {string} signature - シグネチャー
   * @example
   * var anzu = new Anzu();
   * anzu.removeConnection("channelId", "clientId", "apiKey", "2015-01-01T00:00:00.000000" "signature")
   *     .then(function(response) { });
   */
  disconnect(channelId, clientId, apiKey, date, signature) {
    return fetch(this.url, {
      method: "POST",
      headers: {
        "x-anzu-target": "AnzuAPI_20151216.Disconnect",
        "x-anzu-apikey": apiKey,
        "x-anzu-date": date,
        "x-anzu-signature": signature
      },
      body: JSON.stringify({channelId: channelId, clientId: clientId})
    }).then((response) => {
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      return response.json();
    });
  }
  /**
   * 接続の一覧を取得する
   * @param {string} channelId - チャンネルID
   * @param {string} apiKey - APIキー
   * @param {string} date - 日時
   * @param {string} signature - シグネチャー
   * @example
   * var anzu = new Anzu();
   * anzu.removeConnection("channelId", "apiKey", "2015-01-01T00:00:00.000000" "signature")
   *     .then(function(response) { });
   */
  listConnection(channelId, apiKey, date, signature) {
    return fetch(this.url, {
      method: "POST",
      headers: {
        "x-anzu-target": "AnzuAPI_20151216.ListConnections",
        "x-anzu-apikey": apiKey,
        "x-anzu-date": date,
        "x-anzu-signature": signature
      },
      body: JSON.stringify({channelId: channelId})
    }).then((response) => {
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      return response.json();
    });
  }
}

module.exports = Anzu;
