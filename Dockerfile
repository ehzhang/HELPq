FROM ulexus/meteor:legacy
COPY . /src/app/
WORKDIR /src/app/
RUN bash create_config
