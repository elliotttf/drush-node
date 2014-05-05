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
