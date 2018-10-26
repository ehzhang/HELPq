# install instructions for heroku and MongoDB Atlas

1. install meteor and heroku tool-belt
- `https://install.meteor.com/ | sh`
- [heroku tool-belt](https://devcenter.heroku.com/articles/heroku-cli)

2. clone the repo
- `git clone https://github.com/HackRU/helpq.git`

3. init config
- `./create_config`
- set `LCS.URL` in `private/config.json`
- `git add config.json`
- `git commit -m "DONT PUSH THIS TO ORIGIN"`

4. create heroku instance
- `heroku login`
- `heroku apps:create <helpq-name>`

5. set build pack
- `heroku buildpacks:set https://github.com/AdmitHub/meteor-buildpack-horse.git`

6. setup MongoDB atlas or mLab and get the connection string
- for atlas [login](cloud.mongodb.com) and create a new cluster, or use an existing one
- under security add a new user with readWriteAnyDataBase@admin. meteor needs this to tail the oplog
- then on overview click connect>connect your application>3.4 or earlier
- you should get a connection of the format mongodb://user:<Password>@shard1:27017,shard2:27017,shard3:27017/test?ssl=true...
- fill in the password you set up and change the db from /test to /meteor
- make sure you go to security > ip whitelist > add ip address > add current ip address

8. set environment for heroku
- `heroku config:add MONGO_URL=<url we found above>`
- `heroku config:add ROOT_URL=http://<helpq-name>.herokuapp.com`

9. make sure you have heroku remote and push to heroku
- `git remote -v`
- `git push heroku master`
