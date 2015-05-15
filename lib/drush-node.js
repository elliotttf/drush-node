/* globals require, module, console */
var _ = require('lodash');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var Deferred = require('promised-io/promise').Deferred;

var Drush = {
  execOptions: {
    maxBuffer: 256 * 1024 * 1024
  }
};

/**
 * Initializes the drush object by determining the path to the drush
 * executable.
 *
 * @return Promise.
 */
Drush.init = function (execOptions) {
  this.execOptions = _.merge(this.execOptions, execOptions || {});
  var def = new Deferred();
  exec('which drush', this.execOptions, function (err, stdout, sterr) {
    if (err) {
      return def.reject(err);
    }

    Drush.command = stdout.replace(/\s+/g, '');
    def.resolve();
  });

  return def.promise;
};

/**
 * Fetches the Drush version on the host machine.
 *
 * @return Promise.
 */
Drush.version = function () {
  var def = new Deferred();
  this.exec('--version')
    .then(
      function (res) {
        var version = res.match(/(\d+\.\d+.*)/);
        def.resolve(version[1]);
      },
      function (err) {
        def.reject(err);
      }
    );

  return def.promise;
};

/**
 * Execute a drush command.
 *
 * @param {string} command
 *   The drush command to execute.
 * @param {object} options
 *   A hash of options to add to the command, can contain:
 *     - alias: the drush alias, e.g. "@self" to execute the command with.
 *     - simulate: boolean, simulates all relevant actions.
 *     - uri: the URI of the drupal site to use.
 *     - echo: text to echo to the drush command.
 *     - cat: a file to cat to the drush command.
 *
 * @return Promise
 */
Drush.exec = function (command, options) {
  options = options || {};
  var def = new Deferred();
  var cmd = Drush.command;
  var prop = '';

  if (options.alias) {
    cmd += ' ' + options.alias;
  }

  if (options.simulate) {
    cmd += ' -s';
  }

  if (options.uri) {
    cmd += ' -l ' + options.uri;
  }

  cmd += ' ' + command + ' -y';

  if (options.echo) {
    cmd = 'echo ' + options.echo + ' | ' + cmd;
  }

  if (options.cat) {
    cmd = 'cat ' + options.cat + ' | ' + cmd;
  }

  exec(cmd, this.execOptions, function (err, stdout, stderr) {
    if (err) {
      return def.reject(err);
    }

    def.resolve(stdout);
  });

  return def.promise;
};

/**
 * Spawn a drush command.
 *
 * @param {array} args
 *   An array of arguments to append to the command, e.g. ['cc', 'drush'].
 * @param {object} options
 *   A hash of options to add to the command, can contain:
 *     - alias: the drush alias, e.g. "@self" to execute the command with.
 *     - simulate: boolean, simulates all relevant actions.
 *     - uri: the URI of the drupal site to use.
 *     - echo: text to echo to the drush command.
 *     - cat: a file to cat to the drush command.
 *
 * @return Promise
 */
Drush.spawn = function (args, options) {
  args = args || [];
  options = options || {};
  var def = new Deferred();
  var pipeToDrush = function (command, pipeArgs) {
    var cmd = spawn(command, pipeArgs);
    cmd.stdout.on('data', function (data) {
      cmd.stdin.write(data);
    });
    cmd.stderr.on('data', function (data) {
      console.log('' + data);
    });
    cmd.on('close', function (code) {
      if (code !== 0) {
        return def.reject(command + ' process exited with code ' + code);
      }
      cmd.stdin.end();
    });
  };

  // Prepend the alias argument.
  if (options.alias) {
    args = [options.alias].concat(args);
  }

  // Add simulate flag.
  if (options.simulate) {
    args.push('-s');
  }

  // Add uri arguments.
  if (options.uri) {
    args.push('-l');
    args.push(options.uri);
  }

  // Add -y flag to prevent prompts from hanging.
  args.push('-y');

  // Handle echo and cat options.
  if (options.echo) {
    pipeToDrush('echo', [options.echo]);
  }
  else if (options.cat) {
    pipeToDrush('cat', [options.cat]);
  }

  var run = spawn(Drush.command, args);
  run.stdout.on('data', function (data) {
    console.log('' + data);
  });
  run.stderr.on('data', function (data) {
    console.log('' + data);
  });
  run.on('close', function (code) {
    if (code !== 0) {
      return def.reject('drush process exited with code ' + code);
    }
    def.resolve();
  });

  return def.promise;
};

module.exports = Drush;

