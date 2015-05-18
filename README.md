# drush for node.js

This is a simple node.js wrapper for running [drush](https://github.com/drush-ops/drush) commands.

To use:

```javascript
var drush = require('drush-node');

drush.init().then(
  function () {
    // Executes `drush updb` and logs the output after the command has completed.
    drush.exec('updb')
      .then(
        function (res) {
          console.log(res);
        }
      );

    // Executes `drush cc all` and logs the output as the command is running.
    drush.exec('cc all'], {log: true});
  }
);
```

The module is built on top of [promised-io](https://github.com/kriszyp/promised-io)
and exec returns a promise object. Chaining commands can therefore be
conveniently done as follows:

```javascript
var group = require('promised-io/promise').all([
  drush.init({log: true}),
  drush.exec('updb'),
  drush.exec('fra'),
  drush.exec('cc all')
]);

group.then(function (res) {
  console.log('All commands completed.');
});
```

You must call `drush.init()` before executing other commands, but as long
as the `drush` object remains in scope you only need to call it once.

### Advanced options

You may pass additional options to the underlaying [spawn commands](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
by calling init with a hash of appropriate options:

```javascript
drush.init({ detached: true })
```

*Note*: The `log` option is not an option for the spawn command, but can be
included when calling drush.init(). Specifying this option when calling
drush.init() prevents the need to specify it on every individual call to
drush.exec() in cases where you want all output for every command to be logged
to the terminal.
