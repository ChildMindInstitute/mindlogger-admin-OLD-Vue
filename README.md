# MindLogger Administrator Panel

[![GitHub version](https://img.shields.io/github/tag/ChildMindInstitute/mindlogger-admin.svg)](https://github.com/ChildMindInstitute/mindlogger-admin/releases)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
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

### Deploy to specific s3 bucket
first you need to create aws cli credentials
```aws configure --profile benjaminthonetdev```
after that you can deploy your branch with current commands
```
- npm run build
- npm run deploy-dev
```