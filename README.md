# Aven Framework (Soft Launch)

![Aven Cloud](./graphics/AvenLogo.png)

An opinionated attempt to make applications dramatically easier to develop and deploy. Use JS and React to target all platforms, update code and application data using the same real-time database.

## A Full Stack ReactJS Framework

- Use SQLite backend in development, and PostgreSQL in production
- Depends on NodeJS, React, React Native, Babel
- Universal caching layer designed to make apps fast by default
- Simple realtime database with smart cache and offline client functionality
- Full Authentication and permission system
- Simple module system
- Use one JavaScript codebase for:
    - Backend logic
    - Server-rendered React sites
    - Client React apps and PWAs
    - React Native apps on iOS and Android


## Getting started

### 1: Get these dependencies:

- NodeJS 8+
- Yarn 1+
- Watchman 4.9+


### 2: Create a project:

```
yarn create aven-app todo-app
```

Go edit the files in `todo-app`! The main file is `index.js`.

### 3: Run the local server:

```
cd todo-app
yarn start
```

This will create a local SQLite database for development, and start a server on [http://localhost:3000](http://localhost:3000).


### 4: Mobile App:

Details coming soon. Its basically a normal [Expo](expo.io) app with an ugly caveat:

The mobile app uses code from the main repo. How? `npm i -g wml`, [from wix](https://github.com/wix/wml), run `wml link src mobile/src` and then `wml start`

## Production

While not quite yet production ready, the testing ground is [aven.io](https://aven.io), and will be stabilizing soon.


