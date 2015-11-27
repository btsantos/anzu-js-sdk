/* global describe:true it:true before:true */
import assert from "power-assert";
import Anzu from "../anzu";

describe("Anzu", () => {
  describe("startUpstream", () => {
    before(() => {
      document.body.innerHTML = window.__html__["test/fixtures/localvideo.html"];
    });
    it("startUpstream", (done) => {
      let anzu = new Anzu();
      anzu.startUpstream(
        "sora",
        "",
        {video: true},
        document.getElementById("local-video"),
        function() {
          done();
        },
        function(_e) {
          done();
        },
        function(_e) {
          done();
        }
      );
    });
  });
});
