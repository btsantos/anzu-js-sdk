/**
 * anzu-js-sdk
 * anzu-js-sdk
 * @version 0.0.0
 * @author Shiguredo Inc.
 * @license MIT
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Anzu = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _soraJsSdk = require("sora-js-sdk");

var _soraJsSdk2 = _interopRequireDefault(_soraJsSdk);

var _isomorphicFetch = require("isomorphic-fetch");

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

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
              resolve({ pc: pc, answer: answer });
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
            pc.setLocalDescription(answer, function () {
              connection.answer(answer.sdp);
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
            _this.upstreamPc = pc;
          });
        }).then(function () {
          onSuccess();
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
              pc.onicecandidate = function (event) {
                if (event.candidate !== null) {
                  console.info("====== candidate ======");
                  console.info(event.candidate);
                  connection.candidate(event.candidate);
                }
              };
            }, onError);
            _this2.downstreamPc[clientId] = pc;
          });
        }).then(function () {
          onSuccess();
        }).catch(function (error) {
          onError(error);
        });
      }, onError, function (e) {
        videoElement.pause();
        videoElement.src = "";
        onClose(e);
      });
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

  }, {
    key: "generateDownstreamToken",
    value: function generateDownstreamToken(channelId, apiKey, date, signature) {
      return (0, _isomorphicFetch2.default)(this.url, {
        method: "POST",
        headers: {
          "x-anzu-target": "AnzuAPI_20151216.GenerateDownstreamToken",
          "x-anzu-apikey": apiKey,
          "x-anzu-date": date,
          "x-anzu-signature": signature
        },
        body: JSON.stringify({ channelId: channelId })
      }).then(function (response) {
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

  }, {
    key: "disconnect",
    value: function disconnect(channelId, clientId, apiKey, date, signature) {
      return (0, _isomorphicFetch2.default)(this.url, {
        method: "POST",
        headers: {
          "x-anzu-target": "AnzuAPI_20151216.Disconnect",
          "x-anzu-apikey": apiKey,
          "x-anzu-date": date,
          "x-anzu-signature": signature
        },
        body: JSON.stringify({ channelId: channelId, clientId: clientId })
      }).then(function (response) {
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

  }, {
    key: "listConnection",
    value: function listConnection(channelId, apiKey, date, signature) {
      return (0, _isomorphicFetch2.default)(this.url, {
        method: "POST",
        headers: {
          "x-anzu-target": "AnzuAPI_20151216.ListConnections",
          "x-anzu-apikey": apiKey,
          "x-anzu-date": date,
          "x-anzu-signature": signature
        },
        body: JSON.stringify({ channelId: channelId })
      }).then(function (response) {
        if (response.status !== 200) {
          throw new Error(response.statusText);
        }
        return response.json();
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

},{"isomorphic-fetch":2,"sora-js-sdk":3}],2:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":4}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
(function() {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this._initBody(bodyInit)
    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})();

},{}]},{},[1])(1)
});