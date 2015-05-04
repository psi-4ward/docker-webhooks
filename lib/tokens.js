var tokens = {};
var fs = require('fs');
var yaml = require('js-yaml');
var async = require('async');
var path = require('path');
var _ = require('lodash');
var tokenDir = path.resolve(__dirname, '..', 'tokens');

if(!fs.existsSync(tokenDir)) fs.mkdirSync(tokenDir);

function loadTokens(cb) {
  console.log('Loading tokens');
  var newtokens = [];
  fs.readdir(tokenDir, function(err, files) {
    files = files
      .filter(function(file) {
        return file.match(/\.yml$/)
      })
      .map(function(file) {
        return tokenDir + '/' + file;
      });
    async.eachLimit(files, 5, function(file, next) {
      fs.readFile(file, function(err, yamlData) {
        if(err) {
          console.log(err);
          return next();
        }
        try {
          var doc = yaml.safeLoad(yamlData);
          tokens[doc.token] = doc;
          newtokens.push(doc.token);
        }
        catch(e) {
          console.log(e.name, 'in', path.basename(file), 'Line', e.mark.line + ':' + e.mark.column, e.reason);
        }

        next();
      });
    }, function(err) {
      _.difference(_.keys(tokens), newtokens).forEach(function(obsoleteToken) {
        delete tokens[obsoleteToken];
      });
      cb(err);
    });
  });
}

fs.watch(tokenDir, _.debounce(loadTokens, 500).bind(this, _.noop));

module.exports = {
  loadTokens: loadTokens,
  get: function(token) {
    return tokens[token];
  }
};