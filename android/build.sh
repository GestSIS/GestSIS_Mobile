#/bin/sh

cd /app
rm -rf dist
yarn install
yarn build
yarn cap sync
cd /app/android
chmod 777 gradlew
./gradlew assemble
./gradlew bundle
jarsigner -keystore ../keys/gestsis-release-key.jks ./app/build/outputs/bundle/release/app-release.aab gestsis-ks
mv ./app/build/outputs/bundle/release/app-release.aab ./app/build/outputs/bundle/release/gestsis-2.1.x.aab
chmod -R a+rw ./app/build/outputs/bundle/release/
