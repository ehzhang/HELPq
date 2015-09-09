HELPq

An extensible, customizable real-time queue system, built with [Meteor](https://www.meteor.com/).

** This is beta release. This queue is fully functional, but code will move around and features will be added over the next few months. Keep checking back for the most up to date. **

Requirements
------------

Quickstart
----------
```sh
  ./create_config
  meteor
```

Configuration
-------------
For front end branding, edit `client/stylesheets/scss/_branding.scss`

To edit text, edit `lib/constants.js`

To configure login, edit `private/config.json`

In `private/config.json`, provide the appropriate application id/secret combinations
for either facebook or github authentication, or choose to disable them.

This will also contain the admin account username and password you'll use for the initial login.

Deploy
------

Deploy with `meteor deploy <your domain name>.meteor.com`

Login as an Admin to grant yourself mentor/admin access using the username/password specified in
your `config.json` file.

