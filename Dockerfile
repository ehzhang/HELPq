FROM node:8-alpine

ADD ./build /src

RUN cd /src/bundle/ && node main.js
