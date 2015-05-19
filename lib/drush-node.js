var _ = require('lodash');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var argv = require('node-argv');
var Deferred = require('promised-io/promise').Deferred;

var Drush = {
  execOptions: {
    log: false
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
 * @param {string|array} args
 *   The drush command to execute either as a string or an array of arguments,
 *   e.g. 'cc drush' or ['cc', 'drush'].
 * @param {object} options
 *   A hash of options to add to the command, can contain:
 *     - log: flag to log the output of the drush command.
 *     - alias: the drush alias, e.g. "@self" to execute the command with.
 *     - simulate: boolean, simulates all relevant actions.
 *     - uri: the URI of the drupal site to use.
 *     - echo: text to echo to the drush command.
 *     - cat: a file to cat to the drush command.
 *
 * @return Promise
 */
Drush.exec = function (args, options) {
  options = options || {};
  if (typeof args === 'string') {
    args = argv(args, {}).input;
  }
  args = args || [];
  var log = typeof options.log !== 'undefined' ? options.log : this.execOptions.log;
  var def = new Deferred();
  var output = '';

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

  // Initialize drush child process.
  var drush = spawn(Drush.command, args);

  // Handle echo and cat options.
  if (options.echo || options.cat) {
    var command = options.echo ? 'echo' : 'cat';
    var cmd = spawn(command, options[command].split(' '));

    cmd.stdout.on('data', function (data) {
      drush.stdin.write(data);
    });
    cmd.stderr.on('data', function (data) {
      if (log) {
        console.log('' + data);
      }
    });
    cmd.on('close', function (code) {
      if (code !== 0) {
        return def.reject(command + ' process exited with code ' + code);
      }
      drush.stdin.end();
    });
  }

  // Listen to stdout and stderr streams and resolve the promise when the drush
  // process closes.
  drush.stdout.on('data', function (data) {
    output += data;
    if (log) {
      console.log('' + data);
    }
  });
  drush.stderr.on('data', function (data) {
    output += data;
    if (log) {
      console.log('' + data);
    }
  });
  drush.on('close', function (code) {
    if (code !== 0) {
      return def.reject('drush process exited with code ' + code);
    }
    def.resolve(output);
  });

  return def.promise;
};

module.exports = Drush;

