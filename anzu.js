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
   * @param {?object} [params={anzuUrl: null, soraUrl: null}] - URL 設定
   */
  constructor(role, params={anzuUrl: null, soraUrl: null}) {
    this.anzuUrl = params.anzuUrl === null ? "https://anzu.shiguredo.jp/api/" : params.anzuUrl;
    this.soraUrl = params.soraUrl === null ? "wss://anzu.shiguredo.jp/signaling" : params.soraUrl;
    if (role !== "upstream" && role !== "downstream") {
      let error = new Error("Role " + role + " is not defined");
      throw error;
    }
    this.role = role;
  }
  /**
   * Anzu を開始する
   * @param {string} channelId - チャンネルID
   * @param {string} token - アクセストークン
   * @param {object} [constraints={video: true, audio: true}] - LocalMediaStream オブジェクトがサポートするメディアタイプ
   */
  start(channelId, token, constraints=null) {
    if (this.role === "upstream") {
      let c = constraints === null ? { video: true, audio: true } : constraints;
      return this._startUpstream(channelId, token, c);
    }
    else if (this.role === "downstream") {
      return this._startDownstream(channelId, token);
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
  _startUpstream(channelId, upstreamToken, constraints) {
    let getUserMedia = (constraints) => {
      return new Promise((resolve, reject) => {
        if (navigator.getUserMedia) {
          navigator.getUserMedia(constraints, (stream) => {
            this.stream = stream;
            resolve({stream: stream});
          }, (err) => { reject(err); });
        } else {
          reject(message);
        }
      });
    };
    let createOffer = () => {
      this.sora = new Sora(this.soraUrl).connection();
      return this.sora.connect({
        role: "upstream",
        channelId: channelId,
        accessToken: upstreamToken
      });
    };
    let createPeerConnection = (offer) => {
      this.sdplog("Upstream Offer", offer);
      return new Promise((resolve, reject) => {
        this.clientId = offer.clientId;
        this.pc = new RTCPeerConnection({iceServers: offer.iceServers});
        this.pc.addStream(this.stream);
        resolve(offer);
      });
    };
    let createAnswer = (offer) => {
      return new Promise((resolve, reject) => {
        this.pc.setRemoteDescription(new RTCSessionDescription(offer), () => {
          this.pc.createAnswer((answer) => {
            this.sdplog("Upstream answer", offer);
            this.pc.setLocalDescription(answer, () => {
              this.sora.answer(answer.sdp);
              this.pc.onicecandidate = (event) => {
                if (event.candidate !== null) {
                  console.info("====== candidate ======");
                  console.info(event.candidate);
                  this.sora.candidate(event.candidate);
                }
              };
              resolve({clientId: this.clientId, stream: this.stream});
            }, (error) => { reject(error); });
          }, (error) => { reject(error); });
        }, (error) => { reject(error); });
      });
    };
    return getUserMedia(constraints)
      .then(createOffer)
      .then(createPeerConnection)
      .then(createAnswer);
  }
  /**
   * ダウンストリームを開始する
   * @private
   * @param {string} channelId - チャンネルID
   * @param {string} downstreamToken - ダウンストリームトークン
   */
  _startDownstream(channelId, downstreamToken) {
    let createOffer = () => {
      this.sora = new Sora(this.soraUrl).connection();
      console.log("-- DOWNSTREAM OFFER --");
      return this.sora.connect({
        role: "downstream",
        channelId: channelId,
        accessToken: downstreamToken
      });
    };
    let createPeerConnection = (offer) => {
      this.sdplog("Downstream offer", offer);
      return new Promise((resolve, reject) => {
        this.clientId = offer.clientId;
        this.pc = new RTCPeerConnection({iceServers: offer.iceServers});
        resolve(offer);
      });
    };
    let createAnswer = (offer) => {
      // firefox と chrome のタイミング問題判定用 flag
      let is_ff = navigator.mozGetUserMedia !== undefined;
      return new Promise((resolve, reject) => {
        if (!is_ff) {
          this.pc.onaddstream = (event) => {
            this.stream = event.stream;
          };
        }
        this.pc.setRemoteDescription(new RTCSessionDescription(offer), () => {
          this.pc.createAnswer((answer) => {
            this.sdplog("Downstream answer", offer);
            this.pc.setLocalDescription(answer, () => {
              this.sora.answer(answer.sdp);
              this.sendanswer = true;
              if (is_ff) {
                this.pc.onaddstream = (event) => {
                  this.stream = event.stream;
                  resolve({clientId: this.clientId, stream: this.stream});
                };
              }
              else {
                resolve({clientId: this.clientId, stream: this.stream});
              }
              this.pc.onicecandidate = (event) => {
                if (event.candidate !== null) {
                  console.info(event.candidate);
                  this.sora.candidate(event.candidate);
                }
              };
            }, (error) => { reject(error); });
          }, (error) => { reject(error); });
        }, (error) => { reject(error); });
      });
    };
    return createOffer()
      .then(createPeerConnection)
      .then(createAnswer);
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
