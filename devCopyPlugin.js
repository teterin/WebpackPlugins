var fs = require('fs');
var async = require('async');

function DevCopyPlugin (options) {
  this.options = options || {};
}

DevCopyPlugin.prototype.apply = function (compiler) {
  var self = this;
  compiler.plugin('after-emit', function (compilation, callback) {
    var jobs = [];
    self.options.assets.forEach(function (item) {
      jobs.push(function (callback) {
        fs.writeFile(item.fileName, compilation.assets[item.asset].source(), callback);
      });
    });
    async.parallel(jobs, function (err) {
      if (!err) {
        callback();
      }
    });
  });
};

module.exports = DevCopyPlugin;