import Sora from "sora-js-sdk";

let RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
let RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;

class Anzu {
  /**
   * @constructor
   * @param {string} rolse - ロール (upstram or downstream)
   * @param {?object} [params={anzuUrl: null, signalingUrl: null}] - URL 設定
   */
  constructor(role, params={ anzuUrl: null, signalingUrl: null }) {
    this.anzuUrl = params.anzuUrl === null ? "https://anzu.shiguredo.jp/api/" : params.anzuUrl;
    this.signalingUrl = params.signalingUrl === null ? "wss://anzu.shiguredo.jp/signaling" : params.signalingUrl;
    if (role !== "upstream" && role !== "downstream") {
      let error = new Error("Role " + role + " is not defined");
      throw error;
    }
    this.role = role;
    this._onError = function() {};
    this._onDisconnect = function() {};
  }
  /**
   * Anzu を開始する
   * @param {string} channelId - チャンネルID
   * @param {string} token - アクセストークン
   * @param {object} [constraints={video: true, audio: true}] - LocalMediaStream オブジェクトがサポートするメディアタイプ
   */
  start(channelId, token, constraints=null, codecType="VP8", multistream=false) {
    if (this.role === "upstream") {
      let c = constraints === null ? { video: true, audio: true } : constraints;
      return this._startUpstream(channelId, token, c, codecType, multistream);
    }
    else if (this.role === "downstream") {
      return this._startDownstream(channelId, token, codecType, multistream);
    }
  }
  /**
   * アップストリームを開始する
   * @private
   * @param {string} channelId - チャンネルID
   * @param {string} upstreamToken - アップストリームトークン
   * @param {object} constraints - LocalMediaStream オブジェクトがサポートするメディアタイプ
   * )
   */
  _startUpstream(channelId, upstreamToken, constraints, codecType, multistream) {
    let getUserMedia = (constraints) => {
      return new Promise((resolve, reject) => {
        if (navigator.getUserMedia) {
          navigator.getUserMedia(constraints, (stream) => {
            this.trace("Upstream getUserMedia constraints", constraints);
            this.stream = stream;
            resolve({ stream: stream });
          }, (err) => { reject(err); });
        } else {
          reject();
        }
      });
    };
    let createOffer = () => {
      this.sora = new Sora(this.signalingUrl).connection();
      this.sora.onError(this._onError);
      this.sora.onDisconnect(this._onDisconnect);
      return this.sora.connect({
        role: "upstream",
        channelId: channelId,
        accessToken: upstreamToken,
        codecType: codecType,
        multistream: multistream
      });
    };
    let createPeerConnection = (offer) => {
      this.trace("Upstream Offer sdp", offer.sdp);
      this.trace("Upstream Offer clientId", offer.clientId);
      this.trace("Upstream Offer iceServers", offer.metadata.iceServers);
      return new Promise((resolve, _reject) => {
        this.clientId = offer.clientId;
        this.pc = new RTCPeerConnection({ iceServers: offer.metadata.iceServers });
        this.pc.addStream(this.stream);
        resolve(offer);
      });
    };
    let createAnswer = (offer) => {
      return new Promise((resolve, reject) => {
        this.pc.oniceconnectionstatechange = (event) => {
          this.trace("Upstream oniceconnectionstatechange", {
            iceConnectionState: this.pc.iceConnectionState,
            iceGatheringState: this.pc.iceGatheringState
          });
          switch (this.pc.iceConnectionState) {
            case "connected":
            case "completed":
              resolve({ clientId: this.clientId, stream: this.stream });
              break;
            case "failed":
              reject(event);
              break;
          }
        };
        this.pc.onicecandidate = (event) => {
          this.trace("Upstream onicecandidate", {
            candidate: event.candidate,
            iceConnectionState: this.pc.iceConnectionState,
            iceGatheringState: this.pc.iceGatheringState
          });
          if (event.candidate !== null) {
            this.sora.candidate(event.candidate);
          }
        };
        this.pc.setRemoteDescription(new RTCSessionDescription(offer), () => {
          this.pc.createAnswer((answer) => {
            this.trace("Upstream answer sdp", answer.sdp);
            this.pc.setLocalDescription(answer, () => {
              this.sora.answer(answer.sdp);
            }, (error) => { reject(error); });
          }, (error) => { reject(error); });
        }, (error) => { reject(error); });
      });
    };
    return getUserMedia(constraints)
      .then(createOffer)
      .then(createPeerConnection)
      .then(createAnswer)
      .catch(e => {
        this.disconnect();
        return Promise.reject(e);
      });
  }
  /**
   * ダウンストリームを開始する
   * @private
   * @param {string} channelId - チャンネルID
   * @param {string} downstreamToken - ダウンストリームトークン
   */
  _startDownstream(channelId, downstreamToken, codecType, multistream) {
    let createOffer = () => {
      this.sora = new Sora(this.signalingUrl).connection();
      this.sora.onError(this._onError);
      this.sora.onDisconnect(this._onDisconnect);
      return this.sora.connect({
        role: "downstream",
        channelId: channelId,
        accessToken: downstreamToken,
        codecType: codecType,
        multistream: multistream
      });
    };
    let createPeerConnection = (offer) => {
      this.trace("Downstream offer sdp", offer.sdp);
      this.trace("Downstream offer clientId", offer.clientId);
      this.trace("Downstream offer iceServers", offer.metadata.iceServers);
      return new Promise((resolve, _reject) => {
        this.clientId = offer.clientId;
        this.pc = new RTCPeerConnection({ iceServers: offer.metadata.iceServers });
        resolve(offer);
      });
    };
    let createAnswer = (offer) => {
      // firefox と chrome のタイミング問題判定用 flag
      this.icecandidateConnected = false;
      this.addstreamCompleted = false;
      return new Promise((resolve, reject) => {
        this.pc.onaddstream = (event) => {
          this.addstreamCompleted = true;
          this.stream = event.stream;
          this.trace("Downstream onaddstream", event.stream.id);
          if (this.icecandidateConnected) {
            resolve({ clientId: this.clientId, stream: this.stream });
          }
        };
        this.pc.oniceconnectionstatechange = (event) => {
          this.trace("Downstream oniceconnectionstatechange", {
            iceConnectionState: this.pc.iceConnectionState,
            iceGatheringState: this.pc.iceGatheringState
          });
          switch (this.pc.iceConnectionState) {
            case "connected":
            case "completed":
              this.icecandidateConnected = true;
              if (this.addstreamCompleted) {
                resolve({ clientId: this.clientId, stream: this.stream });
              }
              break;
            case "failed":
              reject(event);
              break;
          }
        };
        this.pc.onicecandidate = (event) => {
          this.trace("Downstream onicecandidate", {
            candidate: event.candidate,
            iceConnectionState: this.pc.iceConnectionState,
            iceGatheringState: this.pc.iceGatheringState
          });
          if (event.candidate !== null) {
            this.sora.candidate(event.candidate);
          }
        };
        this.pc.setRemoteDescription(new RTCSessionDescription(offer), () => {
          this.pc.createAnswer((answer) => {
            this.trace("Downstream answer sdp", answer.sdp);
            this.pc.setLocalDescription(answer, () => {
              this.sora.answer(answer.sdp);
            }, (error) => { reject(error); });
          }, (error) => { reject(error); });
        }, (error) => { reject(error); });
      });
    };
    return createOffer()
      .then(createPeerConnection)
      .then(createAnswer)
      .catch(e => {
        this.disconnect();
        return Promise.reject(e);
      });
  }
  /**
   * コンソールログを出力する
   * @private
   * @param {string} text - タイトル
   * @param {string|object} value - 値
   */
  trace(text, value) {
    let now = "";
    if (window.performance) {
      now = (window.performance.now() / 1000).toFixed(3) + ": ";
    }

    if (typeof value === "object" && value !== null) {
      console.info(now + text + "\n" + JSON.stringify(value, null, 2)); // eslint-disable-line
    }
    else {
      console.info(now + text + "\n" + value); // eslint-disable-line
    }
  }
  /**
   * 切断する
   */
  disconnect() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => {
        t.stop();
      });
    }
    this.stream = null;
    if (this.sora) {
      this.sora.disconnect();
    }
    this.sora = null;
    if (this.pc && (this.pc.signalingState !== "closed")) {
      this.pc.oniceconnectionstatechange = null;
      this.pc.close();
    }
    this.pc = null;
  }
  /**
   * エラー時のコールバックを登録する
   * @param {function} コールバック
   */
  onError(f) {
    this._onError = f;
    if (this.sora) {
      this.sora.onError(f);
    }
  }
  /**
   * 切断時のコールバックを登録する
   * @param {function} コールバック
   */
  onDisconnect(f) {
    this._onDisconnect = f;
    if (this.sora) {
      this.sora.onDisconnect(f);
    }

  }
}

module.exports = Anzu;
