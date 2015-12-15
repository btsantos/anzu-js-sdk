###################
Anzu JavaScript SDK
###################

Anzu をブラウザから簡単に使うための仕組みです。

サンプル
========

:URL:

**視聴者の制限をなしで試してください**

チャネル ID と配信用トークンを Anzu から事前に取得しておきます。

examples/updown_test.html の channelId と upstreamToken を指定します。

あとは、配信がを確認してください

::

    var channelId = "";
    var upstreamToken = "";

    // Upstream を開始する
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

    // Downstream を開始する
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


注意
----

視聴者の制限をしている場合は視聴用トークンを Anzu API から取得する必要があります。

この SDK は **Anzu API から視聴用トークンを取得する** 仕組みは入っていません。


視聴者の制限を有効にした場合
============================

視聴者の制限を有効にした場合は Anzu API で視聴トークンを取得し、
anzuDownstream.start(channelId, downstreamToken) の引数に渡してください。

::

  anzuDownstream.start(channelId, "")
    .then(function(params) {
      var videoElement = document.getElementById("remote-video");
      videoElement.src = window.URL.createObjectURL(params.stream);
      videoElement.play();
    })
    .catch(function(error) {
      console.error(error);
    });

