FROM debian:8

RUN apt-get update && apt-get install -y \
    python \
    build-essential \
    curl \
    g++-4.8

RUN curl -o- 'https://raw.githubusercontent.com/creationix/nvm/v0.33.4/install.sh' | bash

RUN bash -c "source '/root/.nvm/nvm.sh' && nvm install '0.12'"

RUN curl -o- 'https://install.meteor.com/?release=1.2.1' | sh

ADD . /src

RUN bash -c "\
    cd /src && \
    source '/root/.nvm/nvm.sh' && \
    APP_ENV=production meteor build --verbose --directory build \
    "

WORKDIR /src/build/bundle

RUN bash -c "\
    source '/root/.nvm/nvm.sh' && \
    cd /src/build/bundle/programs/server && \
    CXX=g++-4.8 CC=gcc-4.8 npm install \
    "

# Annoying Meteor Hacks
RUN bash -c "\
    source '/root/.nvm/nvm.sh' && \
    cd programs/server && \
    rm -rf npm/npm-bcrypt/node_modules/bcrypt && \
    npm install --save bcrypt && \
    npm install \
    "

CMD bash -c "\
    source '/root/.nvm/nvm.sh' && \
    node main.js \
    "

