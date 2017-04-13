<br>
<p align="center">
  <img alt="HackCU" src="https://github.com/hackcu/mentors/raw/master/public/assets/images/hackculogo.png" width="300"/>
</p>
<br>

An extensible, customizable real-time queue system, built with [Meteor](https://www.meteor.com/)!

Forked from [HELPq](https://github.com/ehzhang/HELPq). Read the original [README here](README.md)

## Setup

Needs [meteor](https://www.meteor.com/) installed.

#### Mac OS X, Linux

```sh
  ./create_config
  meteor
```

#### Windows:

Copy the `private/config.json.template` into `private/config.json`

```sh
  meteor
```

## Run Server

### Local environment

```
meteor
```

## Deploy

To deploy we will use `meteor up`. To do so first install it by running: `npm install -g mup`. You will also need sudo access to the server, ask to website team organizer.


- Create a new folder outside the project
- Run `mup init`
- Edit the generated `mup.js` file to match the following:

```
module.exports = {
  servers: {
    one: {
        // TODO: change host and username
      host: 'REPLACE_WITH_SERVER_IP',
      username: 'REPLACE_WITH_USER',
    }
  },

  meteor: {
    name: 'helpq',
    // TODO: change path
    path: 'path/to/helpq/project/',

    servers: {
      one: {},
    },

    env: {
      ROOT_URL: 'http://mentors.hackcu.org/',
      PORT: 8000,
      MONGO_URL: 'mongodb://localhost/meteor',
      APP_EN: 'production',
    },

    docker: {
      image: 'kadirahq/meteord',
    },
    deployCheckWaitTime: 120,
    enableUploadProgressBar: true
  },

  mongo: {
    port: 27017,
    version: '3.4.1',
    servers: {
     one: {}
    }
  }
};
```


- Run `mup setup` (only needed if first time deploying to server)
- Run `mup deploy`

If you need to deploy a new version, run `mup deploy` only.

----------------

Made with :heart: at HackCU

