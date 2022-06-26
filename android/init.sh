#/bin/sh

export ANDROID_SDK_ROOT=/usr/local/openjdk-8
cd /usr/local/openjdk-8
wget https://dl.google.com/android/repository/commandlinetools-linux-6858069_latest.zip
unzip commandlinetools-linux-6858069_latest.zip
mkdir tools
mv cmdline-tools/* tools
mv tools cmdline-tools/tools
export PATH=$PATH:/usr/local/openjdk-8/cmdline-tools/latest/bin:/usr/local/openjdk-8/cmdline-tools/tools/bin
cd /usr/local/openjdk-8/cmdline-tools/tools/bin
yes | ./sdkmanager --licenses
cd /app
yarn install
cd /app/android
chmod 777 gradlew
./gradlew assemble
./gradlew bundle
jarsigner -keystore ../keys/gestsis-release-key.jks ./app/build/outputs/bundle/release/app-release.aab gestsis-ks
mv ./app/build/outputs/bundle/release/app-release.aab ./app/build/outputs/bundle/release/gestsis-2.0.x.aab
chmod -R a+rw ./app/build/outputs/bundle/release/