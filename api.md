## Classes
<dl>
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
  * [.generateDownstreamToken(channelId, apiKey, date, signature)](#Anzu+generateDownstreamToken)
  * [.disconnect(channelId, clientId, apiKey, date, signature)](#Anzu+disconnect)
  * [.listConnection(channelId, apiKey, date, signature)](#Anzu+listConnection)

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
  function() {
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
  function() {
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
<a name="Anzu+generateDownstreamToken"></a>
### anzu.generateDownstreamToken(channelId, apiKey, date, signature)
ダウンストリームトークンを取得する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| apiKey | <code>string</code> | APIキー |
| date | <code>string</code> | 日時 |
| signature | <code>string</code> | シグネチャー |

**Example**  
```js
var anzu = new Anzu();
anzu.generatetDownstreamToken("channelId", "apiKey", "2015-01-01T00:00:00.000000", "signature")
    .then(function(response) {
      console.log(response.downstreamToken);
    });
```
<a name="Anzu+disconnect"></a>
### anzu.disconnect(channelId, clientId, apiKey, date, signature)
特定の接続を切断する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| clientId | <code>string</code> | クライアントID |
| apiKey | <code>string</code> | APIキー |
| date | <code>string</code> | 日時 |
| signature | <code>string</code> | シグネチャー |

**Example**  
```js
var anzu = new Anzu();
anzu.removeConnection("channelId", "clientId", "apiKey", "2015-01-01T00:00:00.000000" "signature")
    .then(function(response) { });
```
<a name="Anzu+listConnection"></a>
### anzu.listConnection(channelId, apiKey, date, signature)
接続の一覧を取得する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| apiKey | <code>string</code> | APIキー |
| date | <code>string</code> | 日時 |
| signature | <code>string</code> | シグネチャー |

**Example**  
```js
var anzu = new Anzu();
anzu.removeConnection("channelId", "apiKey", "2015-01-01T00:00:00.000000" "signature")
    .then(function(response) { });
```
<a name="Anzu"></a>
## Anzu
**Kind**: global class  

* [Anzu](#Anzu)
  * [.startUpstream(channelId, upstreamToken, constraints, videoElement, onSuccess, onError, onClose)](#Anzu+startUpstream)
  * [.startDownstream(channelId, downstreamToken, videoElement, onSuccess, onError, onClose)](#Anzu+startDownstream)
  * [.generateDownstreamToken(channelId, apiKey, date, signature)](#Anzu+generateDownstreamToken)
  * [.disconnect(channelId, clientId, apiKey, date, signature)](#Anzu+disconnect)
  * [.listConnection(channelId, apiKey, date, signature)](#Anzu+listConnection)

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
  function() {
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
  function() {
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
<a name="Anzu+generateDownstreamToken"></a>
### anzu.generateDownstreamToken(channelId, apiKey, date, signature)
ダウンストリームトークンを取得する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| apiKey | <code>string</code> | APIキー |
| date | <code>string</code> | 日時 |
| signature | <code>string</code> | シグネチャー |

**Example**  
```js
var anzu = new Anzu();
anzu.generatetDownstreamToken("channelId", "apiKey", "2015-01-01T00:00:00.000000", "signature")
    .then(function(response) {
      console.log(response.downstreamToken);
    });
```
<a name="Anzu+disconnect"></a>
### anzu.disconnect(channelId, clientId, apiKey, date, signature)
特定の接続を切断する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| clientId | <code>string</code> | クライアントID |
| apiKey | <code>string</code> | APIキー |
| date | <code>string</code> | 日時 |
| signature | <code>string</code> | シグネチャー |

**Example**  
```js
var anzu = new Anzu();
anzu.removeConnection("channelId", "clientId", "apiKey", "2015-01-01T00:00:00.000000" "signature")
    .then(function(response) { });
```
<a name="Anzu+listConnection"></a>
### anzu.listConnection(channelId, apiKey, date, signature)
接続の一覧を取得する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channelId | <code>string</code> | チャンネルID |
| apiKey | <code>string</code> | APIキー |
| date | <code>string</code> | 日時 |
| signature | <code>string</code> | シグネチャー |

**Example**  
```js
var anzu = new Anzu();
anzu.removeConnection("channelId", "apiKey", "2015-01-01T00:00:00.000000" "signature")
    .then(function(response) { });
```
