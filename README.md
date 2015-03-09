Q
====

An extensible, customizable real-time queue system, built with meteor.

To edit:

For front end branding, edit `client/stylesheets/scss/_branding.scss`

Compile css with 
```sh 
  sass --watch client/stylesheets/scss:client/stylesheets/css
```

To edit copy, edit `lib/constants.js`

To configure login:
```sh
  cp private/config.json.template private/config.json
```

Edit `private/config.json`.

Startup with `meteor`

Deploy with `meteor deploy <your domain name>.meteor.com`
