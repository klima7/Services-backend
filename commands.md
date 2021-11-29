# Usefull commands

To have them at hand...

### Basic

`npm --prefix functions run build` - compile functions once

`npm --prefix functions run build-watch` - compile functions on changes

`firebase emulators:start --import ..\..\data\x` - start emulators with imported state

`firebase emulators:export ..\..\data\x` - export emulators state

`firebase deploy [--only functions]` - deploy


### Other

`npm install` - install dependencies (run inside functions dir)

`firebase firestore:indexes > firestore.indexes.json` - fetch indexes

`firebase deploy --only firestore:indexes` - deploy indexes

`firebase functions:shell` - start functions shell

### In case of occupied port
- `netstat -ano | findStr "8080"`
- `taskkill /F /PID <pid>`
