########
変更履歴
########

UPDATE
    下位互換がある変更
ADD
    下位互換がある追加
CHANGE
    下位互換のない変更
FIX
    バグ修正


0.4.x
=====

0.4.8
-----

- [FIX] Chrome の場合にシグナリングに成功しているのに Promise.resolve を返さない場合があったので修正する

0.4.7
-----

- [UPDATE] iceConnectionState が failed なった場合のみ Promise.reject を返すようにして、独自の timeout 実装を削除する

0.4.6
-----

- [UPDATE] sora-js-sdk を 0.3.2 にアップデートする
- [UPDATE] eslint に対応するための修正をする

0.4.5
-----

- [UPDATE] iceConnectionState が connected になったら ICE が成功したとして扱うようにする

0.4.4
-----

- [UPDATE] シグナリングに失敗した場合の後処理を追加する

0.4.3
-----

- [UPDATE] sora-js-sdk を 0.3.1 にアップデートする

0.4.2
-----

- [FIX] callback の変数名が _onerror になっていたのを _onError に修正する

0.4.1
-----

- [FIX] callback の変数名が _onerror になっていたのを _onError に修正する

0.4.0
-----

- [UPDATE] iceGatheringState が complete を返すまで Promise.resolve を返さないようにする
- [ADD] disconnect を追加する
- [ADD] onError を追加する
- [ADD] onDisconnect を追加する

0.3.0
=====

- [CHANGE] soraUrl を signalingUrl に変更する

0.2.0
=====

- [CHANGE] Anzu の constructor で role を受け取るようにする
- [CHANGE] startUpstream, startDownstream を start に統一する

0.1.0
=====

**0.1.0 リリース**

