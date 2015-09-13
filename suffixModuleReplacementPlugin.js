var fs = require('fs');
var path = require('path');

function SuffixModuleReplacementPlugin (options) {
  this.exclude = options.exclude;
  this.suffix = options.suffix;
}

SuffixModuleReplacementPlugin.prototype.apply = function (compiler) {
  var self = this;
  compiler.plugin('compilation', function (compilation) {
    compilation.addModule = function (module, cacheGroup) {
      if (self.exclude && self.exclude.some(function (pattern) {
          return pattern.test(module.resource);
        })) {
        return compilation.__proto__.addModule.call(compilation, module, cacheGroup);
      }
      if (module.resource) {
        var dir = path.dirname(module.resource);
        var fileName = path.basename(module.resource);
        var additionalModuleResource = path.join(dir, fileName.replace(/(.*)\.(es6|js)$/, '$1' + self.suffix + '.$2'));
        var additionalModuleRequest = module.request.replace(module.resource, additionalModuleResource);
        if (fs.existsSync(additionalModuleResource) && module.issuer !== additionalModuleRequest) {
          module.request = additionalModuleRequest;
          module.resource = additionalModuleResource;
          module.userRequest = additionalModuleResource;
        }
      }
      return compilation.__proto__.addModule.call(compilation, module, cacheGroup);
    };
  });
}

module.exports = SuffixModuleReplacementPlugin;
