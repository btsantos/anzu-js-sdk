## Classes

<dl>
<dt><a href="#Anzu">Anzu</a></dt>
<dd></dd>
<dt><a href="#Anzu">Anzu</a></dt>
<dd></dd>
<dt><a href="#Anzu">Anzu</a></dt>
<dd></dd>
</dl>

<a name="Anzu"></a>
## Anzu
**Kind**: global class  

* [Anzu](#Anzu)
    * [.startUpstream(channelId, upstreamToken, constraints, videoElement, onSuccess, onError, onClose)](#Anzu+startUpstream)
    * [.startDownstream(channelId, downstreamToken, videoElement, onSuccess, onError, onClose)](#Anzu+startDownstream)

<a name="Anzu+startUpstream"></a>
### anzu.startUpstream(channelId, upstreamToken, constraints, videoElement, onSuccess, onError, onClose)
アップストリームを開始する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| upstreamToken | <code>string</code> | アップストリームトークン |
| constraints | <code>object</code> | LocalMediaStream オブジェクトがサポートするメディアタイプ |
| videoElement | <code>object</code> | ストリームをプレイするビデオエレメント |
| onSuccess | <code>onSuccessCallback</code> | 接続成功時のコールバック |
| onError | <code>onErrorCallback</code> | エラー時のコールバック |
| onClose | <code>onCloseCallback</code> | 接続切断時のコールバック |

**Example**  
```js
var anzu = new Anzu();
anzu.startUpstream(
  "channelId",
  "token",
  {video: true},
  document.getElementById("local-video"),
  function(clientId) {
    // success
  },
  function(error) {
    // error
  },
  function(error) {
    // close
  }
)
```
<a name="Anzu+startDownstream"></a>
### anzu.startDownstream(channelId, downstreamToken, videoElement, onSuccess, onError, onClose)
ダウンストリームを開始する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| downstreamToken | <code>string</code> | ダウンストリームトークン |
| videoElement | <code>object</code> | ストリームをプレイするビデオエレメント |
| onSuccess | <code>onSuccessCallback</code> | 接続成功時のコールバック |
| onError | <code>onErrorCallback</code> | エラー時のコールバック |
| onClose | <code>onCloseCallback</code> | 接続切断時のコールバック |

**Example**  
```js
var anzu = new Anzu();
anzu.startDownstream(
  "channelId",
  "token",
  document.getElementById("remote-video"),
  function(clientId) {
    // success
  },
  function(error) {
    // error
  },
  function(error) {
    // close
  }
)
```
<a name="Anzu"></a>
## Anzu
**Kind**: global class  

* [Anzu](#Anzu)
    * [.startUpstream(channelId, upstreamToken, constraints, videoElement, onSuccess, onError, onClose)](#Anzu+startUpstream)
    * [.startDownstream(channelId, downstreamToken, videoElement, onSuccess, onError, onClose)](#Anzu+startDownstream)

<a name="Anzu+startUpstream"></a>
### anzu.startUpstream(channelId, upstreamToken, constraints, videoElement, onSuccess, onError, onClose)
アップストリームを開始する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| upstreamToken | <code>string</code> | アップストリームトークン |
| constraints | <code>object</code> | LocalMediaStream オブジェクトがサポートするメディアタイプ |
| videoElement | <code>object</code> | ストリームをプレイするビデオエレメント |
| onSuccess | <code>onSuccessCallback</code> | 接続成功時のコールバック |
| onError | <code>onErrorCallback</code> | エラー時のコールバック |
| onClose | <code>onCloseCallback</code> | 接続切断時のコールバック |

**Example**  
```js
var anzu = new Anzu();
anzu.startUpstream(
  "channelId",
  "token",
  {video: true},
  document.getElementById("local-video"),
  function(clientId) {
    // success
  },
  function(error) {
    // error
  },
  function(error) {
    // close
  }
)
```
<a name="Anzu+startDownstream"></a>
### anzu.startDownstream(channelId, downstreamToken, videoElement, onSuccess, onError, onClose)
ダウンストリームを開始する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| downstreamToken | <code>string</code> | ダウンストリームトークン |
| videoElement | <code>object</code> | ストリームをプレイするビデオエレメント |
| onSuccess | <code>onSuccessCallback</code> | 接続成功時のコールバック |
| onError | <code>onErrorCallback</code> | エラー時のコールバック |
| onClose | <code>onCloseCallback</code> | 接続切断時のコールバック |

**Example**  
```js
var anzu = new Anzu();
anzu.startDownstream(
  "channelId",
  "token",
  document.getElementById("remote-video"),
  function(clientId) {
    // success
  },
  function(error) {
    // error
  },
  function(error) {
    // close
  }
)
```
<a name="Anzu"></a>
## Anzu
**Kind**: global class  

* [Anzu](#Anzu)
    * [.startUpstream(channelId, upstreamToken, constraints, videoElement, onSuccess, onError, onClose)](#Anzu+startUpstream)
    * [.startDownstream(channelId, downstreamToken, videoElement, onSuccess, onError, onClose)](#Anzu+startDownstream)

<a name="Anzu+startUpstream"></a>
### anzu.startUpstream(channelId, upstreamToken, constraints, videoElement, onSuccess, onError, onClose)
アップストリームを開始する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| upstreamToken | <code>string</code> | アップストリームトークン |
| constraints | <code>object</code> | LocalMediaStream オブジェクトがサポートするメディアタイプ |
| videoElement | <code>object</code> | ストリームをプレイするビデオエレメント |
| onSuccess | <code>onSuccessCallback</code> | 接続成功時のコールバック |
| onError | <code>onErrorCallback</code> | エラー時のコールバック |
| onClose | <code>onCloseCallback</code> | 接続切断時のコールバック |

**Example**  
```js
var anzu = new Anzu();
anzu.startUpstream(
  "channelId",
  "token",
  {video: true},
  document.getElementById("local-video"),
  function(clientId) {
    // success
  },
  function(error) {
    // error
  },
  function(error) {
    // close
  }
)
```
<a name="Anzu+startDownstream"></a>
### anzu.startDownstream(channelId, downstreamToken, videoElement, onSuccess, onError, onClose)
ダウンストリームを開始する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| downstreamToken | <code>string</code> | ダウンストリームトークン |
| videoElement | <code>object</code> | ストリームをプレイするビデオエレメント |
| onSuccess | <code>onSuccessCallback</code> | 接続成功時のコールバック |
| onError | <code>onErrorCallback</code> | エラー時のコールバック |
| onClose | <code>onCloseCallback</code> | 接続切断時のコールバック |

**Example**  
```js
var anzu = new Anzu();
anzu.startDownstream(
  "channelId",
  "token",
  document.getElementById("remote-video"),
  function(clientId) {
    // success
  },
  function(error) {
    // error
  },
  function(error) {
    // close
  }
)
```
