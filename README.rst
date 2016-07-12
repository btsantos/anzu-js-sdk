###################
Anzu JavaScript SDK
###################

:バージョン: 0.6.1

`WebRTC SFU as a Service Anzu <https://anzu.shiguredo.jp>`_ をブラウザから扱うための SDK です。

:anzu.js: https://github.com/shiguredo/anzu-js-sdk/blob/master/dist/anzu.js
:anzu.min.js: https://github.com/shiguredo/anzu-js-sdk/blob/master/dist/anzu.min.js


========
サンプル
========

:URL: https://github.com/shiguredo/anzu-js-sdk/blob/master/example/updown_test.html

**視聴者の制限をなしで試してください**

チャネル ID と配信用トークンを Anzu から事前に取得しておきます。

examples/updown_test.html の channelId と upstreamToken を指定します。

あとは、実際に動作させてみて動かしてみてください。

::

    var channelId = "";
    var upstreamToken = "";

    // 配信を開始する
    var anzuUpstream = new Anzu("upstream");
    anzuUpstream.start(channelId, upstreamToken, {video: true, audio: true})
      .then(function(params) {
        var videoElement = document.getElementById("local-video");
        videoElement.src = window.URL.createObjectURL(params.stream);
        videoElement.play();
      })
      .catch(function(error) {
        console.error(error);
      });

    // 視聴を開始する
    var anzuDownstream = new Anzu("downstream");
    anzuDownstream.start(channelId, "")
      .then(function(params) {
        var videoElement = document.getElementById("remote-video");
        videoElement.src = window.URL.createObjectURL(params.stream);
        videoElement.play();
      })
      .catch(function(error) {
        console.error(error);
      });

`anzu.js <https://github.com/shiguredo/anzu-js-sdk/blob/develop/dist/anzu.js>`_ を使うことでこれくらいの行数で配信や受信を実現できるようになります。

注意
====

視聴者の制限をしている場合は視聴用トークンを Anzu API から取得する必要があります。

この SDK は **Anzu API から視聴用トークンを取得する** 仕組みは入っていません。


============================
視聴者の制限を有効にした場合
============================

視聴者の制限を有効にした場合は Anzu API で視聴トークンを取得し、
anzuDownstream.start(channelId, downstreamToken) の引数に渡してください。

::

  var downstreamToken = "";

  anzuDownstream.start(channelId, downstreamToken)
    .then(function(params) {
      var videoElement = document.getElementById("remote-video");
      videoElement.src = window.URL.createObjectURL(params.stream);
      videoElement.play();
    })
    .catch(function(error) {
      console.error(error);
    });


========
API 一覧
========

Anzu
====

new Anzu(role)
--------------

+-------+--------+----------+-----------------------------+
| Param | Type   | Default  | Description                 |
+=======+========+==========+=============================+
| role  | string |          | ロール(upstream/downstream) |
+-------+--------+----------+-----------------------------+

example::

  var anzu = new Anzu("upstream");


start(channelId, accessToken, constraints, codecType)
-----------------------------------------------------
配信/視聴を開始する

+-------------+--------+------------------------------+-------------------------------+
| Param       | Type   | Default                      | Description                   |
+=============+========+==============================+===============================+
| channelId   | string |                              | チャネルID                    |
+-------------+--------+------------------------------+-------------------------------+
| accessToken | string |                              | アクセストークン              |
+-------------+--------+------------------------------+-------------------------------+
| constraints | object | { video: true, audio: true } | navigator.getUserMedia の引数 |
+-------------+--------+------------------------------+-------------------------------+
| codecType   | string | VP8                          | ビデオコーデック(VP8/H264)    |
+-------------+--------+------------------------------+-------------------------------+

example::

  anzu.start("Sora", "Token", {video: true, audio: true}, "VP8")
    .then(function(data) {
      var videoElement = document.getElementById("video");
      videoElement.src = window.URL.createObjectURL(data.stream);
    })
    .catch(function(error) {
      console.error(error);
    });


onError(callback)
-----------------
エラー時の callback を登録する

+----------+----------+----------+--------------+
| Param    | Type     | Default  | Description  |
+==========+==========+==========+==============+
| callback | function |          | コールバック |
+----------+----------+----------+--------------+

example::

  anzu.onError(function(e) {
    console.log(e);
  });


onDisconnect(callback)
----------------------
切断時の callback を登録する

+----------+----------+----------+--------------+
| Param    | Type     | Default  | Description  |
+==========+==========+==========+==============+
| callback | function |          | コールバック |
+----------+----------+----------+--------------+

example::

  anzu.onDisconnect(function(e) {
    console.log(e);
  });


disconnect()
------------
切断する

example::

  anzu.disconnect();
