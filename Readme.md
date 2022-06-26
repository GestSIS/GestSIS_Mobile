# GestSIS Mobile

## Build

### En utilisant Docker (Manière privilégiée)

Commencer par mettre à jour le numéro de version dans `android/app/build.gradle` et incrémenter `versionCode` ainsi que `versionName`.

Mettre `gestsis-release-key.jks` dans le dossier './keys'.

Finalement lancer :

```sh
docker build -t mobile-build ./android
docker run --rm -it -v /app/node_modules -v $(pwd):/app mobile-build
```

Le script qui sera lancé vous demandera de saisir la clé de déchiffrement du fichier `.jks` pour signer l'apk.

L'apk généré se trouve ici './app/build/outputs/bundle/release/gestsis-2.0.x.aab'.

### OLD Method

First configure the environment :

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
