# drush for node.js

This is a simple node.js wrapper for running [drush](https://github.com/drush-ops/drush) commands.

To use:

```javascript
var drush = require('drush');

drush.init().then(
  function () {
    drush.exec('updb')
      .then(
        function (res) {
          console.log(res);
        }
      );
  }
);
```

The module is built on top of [promised-io](https://github.com/kriszyp/promised-io)
and exec returns a promise object. Chaining commands can therefore be conveniently
done as follows:

```javascript
var group = require('promised-io/promise').all([
  drush.init(),
  drush.exec('updb'),
  drush.exec('fra'),
  drush.exec('cc all')
]);

group.then(function (res) {
  console.log(res.join("\r"));
});
```

You must call `Drush.init()` before executing other commands, but as long
as the `Drush` object remains in scope you only need to call it once.

### Advanced options

You may pass additional options to the underlaying [exec commands](http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
by calling init with a hash of appropriate options:

```javascript
drush.init({ maxBuffer: 256 * 1024 * 1024 })
```

*Note*: You may need to increase the buffer size for commands that return a lot
of output.
