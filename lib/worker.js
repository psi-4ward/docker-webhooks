var Docker = require('dockerode');
var _ = require('lodash');
var async = require('async');

var docker = new Docker();

function getVal(path, obj) {
  var fields = path.split('.');
  var result = obj;
  for(var i = 0, n = fields.length; i < n && result !== undefined; i++) {
    result = result[fields[i]];
    if(i === n - 1) {
      return result;
    }
  }
}

function validate(conditions, data) {
  if(!conditions || !_.isArray(conditions)) return true;
  return conditions.every(function(cond) {
    var k = _.keys(cond)[0];
    var v = cond[k];
    var val = getVal(k, data);
    if(val != v) {
      console.log('validation failed: "' + k + '" should be "' + v + '" but is "' + val + '"');
      return false;
    }
    return true;
  });
}

module.exports = {
  exec: function exec(token, data) {
    console.log(token.container, 'triggered');
    async.eachSeries(token.tasks, function(task, nextTask) {
      if(!validate(task.conditions, data)) return nextTask();

      async.eachSeries(task.exec, function(cmd, nextExec) {
        var container = docker.getContainer(token.container);
        if(!_.isArray(cmd)) cmd = [cmd];
        console.log(token.container, 'EXEC', cmd.join(' '));
        container.exec({
          AttachStdout: task.showStdout || false,
          AttachStderr: true,
          Tty: false,
          Cmd: cmd
        }, function(err, exec) {
          if(err) return nextExec(err);

          exec.start(function(err, stream) {
            if(err) return nextExec(err);
            stream.setEncoding('utf8');
            stream.pipe(process.stdout);
            stream.on('end', nextExec);
          });
        });
      }, nextTask);

    }, function(err) {
      if(err) return console.log(err.toString());
      console.log(token.container, 'finished');
    });
  }
};

