# helpq

## Description
this is a configuration and extension of MIT's helpq specifically for HackRU
the main idea is to integrate it with lcs and other HackRU type things
the [HELPq readme](HELPQ.md) may give some more insight on HELPq specifically.
for more information about meteor and how this fork integrates with LCS see
[how it works](HOWITWORKS.md)

## Inspiration
Originally we used a slackbot in order to provide mentorship to hackers during
HackRU, and we found this 

## Installation Guide
### for development
+ git clone this repo and enter the folder
+ [install meteor](https://www.meteor.com/install)
+ run `./create_config`
+ run `meteor`
### for production
+ see [install](INSTALL.md)

## Style Guide
try to follow [airbnb's lead](https://github.com/airbnb/javascript).
there are a few area's where we can't do this because of meteors nodejs/babel,
but that's ok. if you can't do it because of javascript syntax limitations and
the exception is not listed below, do whatever you think is in the spirit of
the style guide. if you disagree with any of this: let's talk.
I will probably agree with you.

### defining functions
````// good
const funName = function(arg, otherArg){
  return arg;
}
// bad
var funName = ...
function funName(arg, otherArg){...
````
this is the best we can do without ()=> type syntax
### variables
use const as much as possible, if you must then you are allowed to begrudgingly use var
this is only because we don't have let :(
### object literals and method shorthand
avoid putting any functionality in objects. just pretend like
they're hashmaps or a way to give functions a namespace.
```
//good
const object = {
      val: 5,
      val2: "str",
      innerObject: {
          innerVal: 5
      }
}
const fun = function(){/***/}
Meteor.namespace = {
    fun:fun
}
```
### lamdas
```
// good
function(arg){return arg + 1}
function(arg){
  //multiple
  //statements
  //inside
  return arg +1
}
// bad
function(arg){multiple();on();one();line();return arg+1}
````
## Links to Further docs
[lcs documentation](https://github.com/HackRU/lcs/wiki)
