var AWS = require('aws-sdk');
var _ = require('lodash');
var async = require('async');
var fetchImages = require('./lib/fetch-images');
var fs = require('fs-extra');
var path = require('path');
var status = require('./.status');
var stringify = require('json-stable-stringify');


module.exports.initialize = function(condensationCb) {

  var currentEpoch = Math.floor( Date.now() / 1000 );

  if (!status.lastFetch || (currentEpoch - status.lastFetch > 86400)) {

    var ec2 = new AWS.EC2({region:'us-east-1'});

    var imageMap = {};

    console.log("particles-amazon-ami: Fetching official Amazon Images. This could take some time.");
    var f = fetchImages.start();

    f.on('image', function(image) {
      imageMap[image.Name] = imageMap[image.Name] || {};
      imageMap[image.Name][image.regionName] = {};
      imageMap[image.Name][image.regionName].ami = image.ImageId;
    });


    f.on('end', function() {
      async.each(
        _.keys(imageMap),
        function(name,cb) {
          fs.outputFile(
            path.join(__dirname,'particles','partials','amazon-image-regions',name),
            stringify(imageMap[name]),
            cb
          );
        },
        function(err) {
          if (err) return condensationCb(err);

          console.log("particles-amazon-ami: Finished loading images");
          status.lastFetch = currentEpoch;
          fs.outputFile(
            path.join(__dirname,'.status.json'),
            stringify(status),
            condensationCb
          );
        }
      );
    });
  }
  else {
    condensationCb();
  }
};
