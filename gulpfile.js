'use strict';

var gulp = require('gulp'),
    bb   = require('bitballoon'),
    env  = require('dotenv').config();

gulp.task('build', [], function() {
  // Your build task
});

gulp.task('deploy', ['build'], function() {
  bb.deploy({
    access_token: process.env.BB_ACCESS_TOKEN,
    site_id: "gatekeeper-tiger-33613.bitballoon.com",
    dir: "app"
  }, function(err, deploy) {
    if (err) { throw(err) }
  });
});
