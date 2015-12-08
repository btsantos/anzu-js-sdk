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
    // TODO(yuito): url を修正する
    this.url = params.anzuUrl === null ? "http://localhost:8000/" : params.anzuUrl;
    this.sora = new Sora(params.soraUrl === null ? "ws://127.0.0.1:8000/signaling" : params.soraUrl);
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
    let connection = this.sora.connection(
      () => {
        navigator.getUserMedia(constraints, function(stream) {
          videoElement.src = window.URL.createObjectURL(stream);
          videoElement.play();
          connection.connect({role: "upstream", channelId: channelId, accessToken: upstreamToken}, (message) => {
            console.log("====== offer ======");
            console.log(message);
            console.log("====== offer sdp ======");
            console.log(message.sdp);
            console.log("====== iceServers ======");
            console.log(message.iceServers);
            let pc = new RTCPeerConnection(message.iceServers);
            pc.addStream(stream);
            pc.setRemoteDescription(new RTCSessionDescription(message), function() {
              pc.createAnswer(function(answer) {
                console.log("====== answer ======");
                console.log(answer);
                console.log("====== answer sdp ======");
                console.log(answer.sdp);
                pc.setLocalDescription(answer, function() {
                  connection.answer(answer.sdp);
                  onSuccess();
                  pc.onicecandidate = function(event) {
                    if (event.candidate !== null) {
                      console.log("====== candidate ======");
                      console.log(event.candidate);
                      connection.candidate(event.candidate);
                    }
                  };
                }, onError);
              }, onError);
            }, onError);
          }, onError);
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
    let connection = this.sora.connection(
      () => {
        connection.connect({role: "downstream", channelId: channelId, accessToken: downstreamToken}, (message) => {
          console.log("====== offer ======");
          console.log(message);
          console.log("====== offer sdp ======");
          console.log(message.sdp);
          console.log("====== iceServers ======");
          console.log(message.iceServers);
          let pc = new RTCPeerConnection(message.iceServers);
          pc.setRemoteDescription(new RTCSessionDescription(message), () => {
            pc.createAnswer((answer) => {
              console.log("====== answer ======");
              console.log(answer);
              console.log("====== answer sdp ======");
              console.log(answer.sdp);
              pc.setLocalDescription(answer, () => {
                connection.answer(answer.sdp);
                onSuccess();
                pc.onicecandidate = (event) => {
                  if (event.candidate !== null) {
                    console.log("====== candidate ======");
                    console.log(event.candidate);
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
