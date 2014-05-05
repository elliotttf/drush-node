var drush = require('../lib/drush-node.js');

exports['drush'] = {
  setUp: function (done) {
    done();
  },

  version: function (test) {
    test.expect(1);

    drush.init()
      .then(function () {
        drush.version()
          .then(
            function (version) {
              test.ok(true, 'Drush version: ' + version);
              test.done();
            },
            function (err) {
              test.ok(false, err);
              test.done();
            }
          );
      });
  },

  exec: function (test) {
    test.expect(1);

    drush.init()
      .then(function () {
        drush.exec('st')
          .then(
            function (res) {
              if (res.match(/PHP executable/)) {
                test.ok(true, 'Drush can execute.');
              }
              else {
                test.ok(false, 'Drush output unexpected.');
              }

              test.done();
            },
            function (err) {
              test.ok(false, 'Drush output unexpected.');
              test.done();
            }
          );
      });
  }
};

