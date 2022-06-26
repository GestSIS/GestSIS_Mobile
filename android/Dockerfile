FROM openjdk:8

WORKDIR /app/android

RUN apt update
RUN apt install wget unzip curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y nodejs
RUN npm add -g yarn

ENV ANDROID_SDK_ROOT=/usr/local/openjdk-8

CMD [ "sh -c 'bash ./init.sh && bash'" ]
