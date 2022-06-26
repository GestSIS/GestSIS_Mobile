# GestSIS Mobile

## Build

First configure the environement :

- https://stackoverflow.com/a/66316335

And then:

```sh
gradlew assemble
gradlew bundle
```

!Warning, to be able to build, you need to be in the `android` folder and gradlew need access to the upper folder !

The output of the bundle is in `<project-name>/app/build/outputs/bundle/`

Source:
- https://stackoverflow.com/a/57204818

## Signing the bundle

```sh
jarsigner -keystore gestsis-release-key.jks ./app/build/outputs/bundle/release/app-release.aab gestsis-ks
```
