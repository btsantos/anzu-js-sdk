/**
 * anzu-js-sdk
 * anzu-js-sdk
 * @version 0.1.0
 * @author Shiguredo Inc.
 * @license MIT
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Anzu = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _soraJsSdk = require("sora-js-sdk");

var _soraJsSdk2 = _interopRequireDefault(_soraJsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

/**
@class Anzu
*/

var Anzu = (function () {
  /**
   * @constructor
   */

  function Anzu() {
    var params = arguments.length <= 0 || arguments[0] === undefined ? { anzuUrl: null, soraUrl: null } : arguments[0];

    _classCallCheck(this, Anzu);

    this.url = params.anzuUrl === null ? "https://anzu.shiguredo.jp/api/" : params.anzuUrl;
    this.sora = new _soraJsSdk2.default(params.soraUrl === null ? "wss://anzu.shiguredo.jp/signaling" : params.soraUrl);
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

  _createClass(Anzu, [{
    key: "startUpstream",
    value: function startUpstream(channelId, upstreamToken, constraints, videoElement, onSuccess, onError, onClose) {
      var _this = this;

      var _getUserMedia = function _getUserMedia(constraints) {
        return new Promise(function (resolve, reject) {
          if (navigator.getUserMedia) {
            navigator.getUserMedia(constraints, function (stream) {
              resolve(stream);
            }, function (err) {
              reject(err);
            });
          } else {
            reject(message);
          }
        });
      };
      var _createPeerConnection = function _createPeerConnection(params) {
        _this.sdplog("Upstream Offer", params.offer);
        var offer = params.offer;
        var stream = params.stream;
        return new Promise(function (resolve, reject) {
          var pc = new RTCPeerConnection({ iceServers: offer.iceServers });
          pc.addStream(stream);
          resolve({ pc: pc, offer: offer });
        });
      };
      var _createAnswer = function _createAnswer(params) {
        var pc = params.pc;
        var offer = params.offer;
        return new Promise(function (resolve, reject) {
          pc.setRemoteDescription(new RTCSessionDescription(offer), function () {
            pc.createAnswer(function (answer) {
              _this.sdplog("Upstream answer", params.offer);
              resolve({ pc: pc, answer: answer, offer: offer });
            }, function (error) {
              reject(error);
            });
          }, function (error) {
            reject(error);
          });
        });
      };
      var connection = this.sora.connection(function () {
        _getUserMedia(constraints).then(function (stream) {
          return new Promise(function (resolve, reject) {
            videoElement.src = window.URL.createObjectURL(stream);
            videoElement.play();
            var params = { role: "upstream", channelId: channelId, accessToken: upstreamToken };
            connection.connect(params, function (offer) {
              resolve({ offer: offer, stream: stream });
            }, function (error) {
              reject(error);
            });
          });
        }).then(_createPeerConnection).then(_createAnswer).then(function (params) {
          return new Promise(function (resolve, reject) {
            var pc = params.pc;
            var answer = params.answer;
            var offer = params.offer;
            pc.setLocalDescription(answer, function () {
              connection.answer(answer.sdp);
              _this.upstreamPc = pc;
              resolve(params.offer.clientId);
              pc.onicecandidate = function (event) {
                if (event.candidate !== null) {
                  console.info("====== candidate ======");
                  console.info(event.candidate);
                  connection.candidate(event.candidate);
                }
              };
            }, function (error) {
              reject(error);
            });
          });
        }).then(function (clientId) {
          onSuccess(clientId);
        }).catch(function (error) {
          onError(error);
        });
      }, onError, function (e) {
        videoElement.pause();
        videoElement.src = "";
        connection = null;
        _this.upstreamPc = null;
        onClose(e);
      });
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

  }, {
    key: "startDownstream",
    value: function startDownstream(channelId, downstreamToken, videoElement, onSuccess, onError, onClose) {
      var _this2 = this;

      var _createPeerConnection = function _createPeerConnection(params) {
        _this2.sdplog("Downstream offer", params.offer);
        return new Promise(function (resolve, reject) {
          var offer = params.offer;
          var pc = new RTCPeerConnection({ iceServers: offer.iceServers });
          resolve({ pc: pc, offer: offer });
        });
      };
      var _createAnswer = function _createAnswer(params) {
        var pc = params.pc;
        var offer = params.offer;
        return new Promise(function (resolve, reject) {
          pc.setRemoteDescription(new RTCSessionDescription(offer), function () {
            pc.createAnswer(function (answer) {
              _this2.sdplog("Downstream answer", params.offer);
              resolve({ pc: pc, offer: offer, answer: answer });
            }, function (error) {
              reject(error);
            });
          }, function (error) {
            reject(error);
          });
          pc.onaddstream = function (event) {
            videoElement.src = window.URL.createObjectURL(event.stream);
            videoElement.play();
          };
        });
      };
      var connection = this.sora.connection(function () {
        new Promise(function (resolve, reject) {
          var params = { role: "downstream", channelId: channelId, accessToken: downstreamToken };
          connection.connect(params, function (offer) {
            resolve({ offer: offer });
          }, function (error) {
            reject(error);
          });
        }).then(_createPeerConnection).then(_createAnswer).then(function (params) {
          return new Promise(function (resolve, reject) {
            var pc = params.pc;
            var answer = params.answer;
            var clientId = params.offer.clientId;
            pc.setLocalDescription(answer, function () {
              connection.answer(answer.sdp);
              _this2.downstreamPc[clientId] = pc;
              resolve(clientId);
              pc.onicecandidate = function (event) {
                if (event.candidate !== null) {
                  console.info("====== candidate ======");
                  console.info(event.candidate);
                  connection.candidate(event.candidate);
                }
              };
            }, onError);
          });
        }).then(function (clientId) {
          onSuccess(clientId);
        }).catch(function (error) {
          onError(error);
        });
      }, onError, function (e) {
        videoElement.pause();
        videoElement.src = "";
        onClose(e);
      });
    }
  }, {
    key: "sdplog",
    value: function sdplog(title, target) {
      console.info("========== " + title + " ==========");
      for (var i in target) {
        console.info(i + ":");
        console.info(target[i]);
      }
    }
  }]);

  return Anzu;
})();

module.exports = Anzu;

},{"sora-js-sdk":2}],2:[function(require,module,exports){
(function (global){

/*!
 * sora-js-sdk
 * WebRTC SFU Sora Signaling Library
 * @version 0.1.0
 * @author Shiguredo Inc.
 * @license MIT
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sora = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sora = (function () {
  function Sora(url) {
    _classCallCheck(this, Sora);

    this.url = url || "";
  }

  _createClass(Sora, [{
    key: "connection",
    value: function connection(onSuccess) {
      var onError = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
      var onClose = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

      return new SoraConnection(this.url, onSuccess, onError, onClose);
    }
  }]);

  return Sora;
})();

var SoraConnection = (function () {
  function SoraConnection(url, onSuccess, onError, onClose) {
    _classCallCheck(this, SoraConnection);

    this._ws = new WebSocket(url);
    this._onClose = onClose;
    this._ws.onopen = function () {
      onSuccess();
    };
    this._ws.onerror = function (e) {
      onError(e);
    };
    this._ws.onclose = function (e) {
      onClose(e);
    };
  }

  _createClass(SoraConnection, [{
    key: "connect",
    value: function connect(params, onOffer, onError) {
      var _this = this;

      var self = this;
      this._ws.onclose = function (e) {
        if (e.code === 4401) {
          onError(e);
        } else {
          _this._onClose(e);
        }
        self._ws = null;
      };
      this._ws.onmessage = function (event) {
        var data = JSON.parse(event.data);
        if (data.type == "offer") {
          onOffer(data);
        } else if (data.type == "ping") {
          self._ws.send(JSON.stringify({ type: "pong" }));
        }
      };
      var message = JSON.stringify({
        type: "connect",
        role: params.role,
        channelId: params.channelId,
        accessToken: params.accessToken
      });
      this._ws.send(message);
    }
  }, {
    key: "answer",
    value: function answer(sdp) {
      this._ws.send(JSON.stringify({ type: "answer", sdp: sdp }));
    }
  }, {
    key: "candidate",
    value: function candidate(_candidate) {
      var message = _candidate.toJSON();
      message.type = "candidate";
      this._ws.send(JSON.stringify(message));
    }
  }]);

  return SoraConnection;
})();

module.exports = Sora;

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});