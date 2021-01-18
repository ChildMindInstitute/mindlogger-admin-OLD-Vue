# MindLogger Administrator Panel


[![GitHub version](https://img.shields.io/github/tag/ChildMindInstitute/mindlogger-admin.svg)](https://github.com/ChildMindInstitute/mindlogger-admin/releases)

## Project setup
```
npm install
```

### Compiles and hot-reloads for local
create .env.local file with 1 record ```NODE_ENV=local```
then use command below
```
npm run serve
```

### Runs unit tests
```
npm run test:unit
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm -g i eslint-cli
eslint "src/**/*.{js,vue}"
```
### deploy
to deploy any branch to test server you need to config aws cli first
using this command
```aws configure --profile mindlogger_aws```
then run commands
- ```npm run build-dev```
- ```npm run dev-deploy```
