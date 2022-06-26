FROM openjdk:8

RUN apt update
RUN apt install wget unzip curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y nodejs
RUN npm add -g yarn

ENV ANDROID_SDK_ROOT=/usr/local/openjdk-8
WORKDIR $ANDROID_SDK_ROOT
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-6858069_latest.zip
RUN unzip commandlinetools-linux-6858069_latest.zip
RUN mkdir tools
RUN mv cmdline-tools/* tools
RUN mv tools cmdline-tools/tools
RUN export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:/usr/local/openjdk-8/cmdline-tools/tools/bin
WORKDIR $ANDROID_SDK_ROOT/cmdline-tools/tools/bin
RUN yes | ./sdkmanager --licenses

WORKDIR /app/android

CMD [ "sh", "./build.sh" ]
