<a name="Anzu"></a>
## Anzu
**Kind**: global class  

* [Anzu](#Anzu)
    * [new Anzu(rolse, [params])](#new_Anzu_new)
    * [.start(channelId, token, [constraints])](#Anzu+start)
    * [.disconnect()](#Anzu+disconnect)
    * [.onError(コールバック)](#Anzu+onError)
    * [.onDisconnect(コールバック)](#Anzu+onDisconnect)

<a name="new_Anzu_new"></a>
### new Anzu(rolse, [params])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| rolse | <code>string</code> |  | ロール (upstram or downstream) |
| [params] | <code>object</code> | <code>{anzuUrl: null, signalingUrl: null}</code> | URL 設定 |

<a name="Anzu+start"></a>
### anzu.start(channelId, token, [constraints])
Anzu を開始する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| channelId | <code>string</code> |  | チャンネルID |
| token | <code>string</code> |  | アクセストークン |
| [constraints] | <code>object</code> | <code>{video: true, audio: true}</code> | LocalMediaStream オブジェクトがサポートするメディアタイプ |

<a name="Anzu+disconnect"></a>
### anzu.disconnect()
切断する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  
<a name="Anzu+onError"></a>
### anzu.onError(コールバック)
エラー時のコールバックを登録する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type |
| --- | --- |
| コールバック | <code>function</code> | 

<a name="Anzu+onDisconnect"></a>
### anzu.onDisconnect(コールバック)
切断時のコールバックを登録する

**Kind**: instance method of <code>[Anzu](#Anzu)</code>  

| Param | Type |
| --- | --- |
| コールバック | <code>function</code> | 

