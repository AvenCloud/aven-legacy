= Testing level 0 environments

Shared code currently lives in `mobile/common`. This location is not ideal but the setup is quite fragile. If you want to improve the structure, be sure to test the shared code in the following environments:


== Story 0: Local web dev

What: Test level 0 web server on local computer

How to test:
  - Check out fresh repo
  - yarn
  - yarn start
  - Changes to shared code should cause server to restart with new code


== Story 1: Prod web

What: Test level 0 web server on prod environment

How to test:
  - Check out fresh repo
  - yarn build
  - yarn run run-prod


== Story 2: Local mobile dev


What: Test level 0 mobile app

How to test:
  - Check out fresh repo
  - cd mobile
  - yarn
  - exp start (and exp ios/android)
  - Changes to shared code should cause mobile app to reload with new code



== Story 3: Web browser


What: Test level 0 mobile app

How to test:
  - Check out fresh repo
  - yarn
  - yarn build-client (or yarn build)
  - (code will build at lib/static/ProjectIndex.js...)
  - Shared code should execute. Live-reload is not working here yet
