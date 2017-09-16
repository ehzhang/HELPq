FROM mhart/alpine-node:base-0.10

ADD ./build /src

CMD cd /src/bundle/ && node main.js
