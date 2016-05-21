var AWS = require('aws-sdk');
var _ = require('lodash');
var async = require('async');
var fetchImages = require('./lib/fetch-images');
var fs = require('fs-extra');
var path = require('path');
var stringify = require('json-stable-stringify');

module.exports.initialize = function(condensationCb) {

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
          path.join('particles','partials','amazon-image-regions',name),
          stringify(imageMap[name]),
          cb
        );
      },
      function(err) {
        console.log("particles-amazon-ami: Finished loading images");
        condensationCb(err);
      }
    );
  });
};
