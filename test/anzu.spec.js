/* global describe:true it:true before:true */
import assert from "power-assert";
import Anzu from "../anzu";

let channelId = "7N3fsMHob";
let upstreamToken = "PG9A6RXgYqiqWKOVO";


// Karma が起動する Chrome でカメラアクセスを許可しないとテストは成功しない
describe("Anzu", () => {
  describe("startUpstream", () => {
    before(() => {
      document.body.innerHTML = window.__html__["test/fixtures/localvideo.html"];
    });
    it("Success startUpstream", (done) => {
      let anzu = new Anzu();
      anzu.startUpstream(
        channelId,
        upstreamToken,
        {video: true},
        document.getElementById("local-video"),
        () => {
          done();
        },
        (e) => {
          assert(false, e);
        },
        (e) => {
          assert(false, e);
        }
      );
    });
  });
});
