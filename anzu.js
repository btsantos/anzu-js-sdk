import Sora from "sora-js-sdk";
import request from "superagent";


let RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
let RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;

/** Class anzu-js-sdk */
class Anzu {
  /**
   * @constructor
   */
  constructor() {
    // TODO(yuito): url を修正する
    this.url = "http://localhost:8000/";
    this.sora = new Sora("ws://127.0.0.1:5000/signaling");
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
  /**
   * ダウンストリームトークンを取得する
   * @param {string} channelId - チャンネルID
   * @param {string} apiKey - APIキー
   * @param {string} date - 日時
   * @param {string} signature - シグネチャー
   * @param {onEndCallback} onEnd - レスポンスハンドラーコールバック
   * @example
   * var anzu = new Anzu();
   * anzu.getDownstreamToken(
   *   "channelId",
   *   "apiKey",
   *   "2015-01-01T00:00:00.000000"
   *   "signature"
   *   function(error, response) {
   *     // response handler
   *   },
   * )
   */
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
  /**
   * 特定の接続を切断する
   * @param {string} channelId - チャンネルID
   * @param {string} clientId - クライアントID
   * @param {string} apiKey - APIキー
   * @param {string} date - 日時
   * @param {string} signature - シグネチャー
   * @param {onEndCallback} onEnd - レスポンスハンドラーコールバック
   * @example
   * var anzu = new Anzu();
   * anzu.removeConnection(
   *   "channelId",
   *   "clientId",
   *   "apiKey",
   *   "2015-01-01T00:00:00.000000"
   *   "signature"
   *   function(error, response) {
   *     // response handler
   *   },
   * )
   */
  disconnect(channelId, clientId, apiKey, date, signature, onEnd) {
    request
      .post(this.url)
      .set("x-anzu-target", "AnzuAPI_20151216.Disconnect")
      .set("x-anzu-apikey", apiKey)
      .set("x-anzu-date", date)
      .set("x-anzu-signature", signature)
      .send({channelId: channelId, clientId: clientId})
      .end((e, res) => {
        onEnd(e, res);
      });
  }
  /**
   * 接続の一覧を取得する
   * @param {string} channelId - チャンネルID
   * @param {string} apiKey - APIキー
   * @param {string} date - 日時
   * @param {string} signature - シグネチャー
   * @param {onEndCallback} onEnd - レスポンスハンドラーコールバック
   * @example
   * var anzu = new Anzu();
   * anzu.listConnection(
   *   "channelId",
   *   "apiKey",
   *   "2015-01-01T00:00:00.000000"
   *   "signature"
   *   function(error, response) {
   *     // response handler
   *   },
   * )
   */
  listConnection(channelId, apiKey, date, signature, onEnd) {
    request
      .post(this.url)
      .set("x-anzu-target", "AnzuAPI_20151216.ListConnections")
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

/**
 * @callback onEndCallback
 * @param {object} error
 * @param {object} response
 */
/**
 * @callback onSuccessCallback
 */
/**
 * @callback onErrorCallback
 * @param {object} error
 */
/**
 * @callback onCloseCallback
 * @param {object} Error
 */
