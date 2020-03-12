<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script>
import store from './State/state';

export default {
  name: 'App',
  store,
}
</script>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,400');
  @import "../node_modules/@ag-grid-community/all-modules/dist/styles/ag-grid.css";
  @import "../node_modules/@ag-grid-community/all-modules/dist/styles/ag-theme-bootstrap.css";
</style>

<style>
.primary {
    background-color: #005fa3 !important;
    border-color: #005fa3 !important;
}
.v-application {
    background-color: #ffffff !important;
}
body, html, #app, #dayspan {
  font-family: 'IBM Plex Sans', sans-serif !important;
  width: 100%;
  height: 100%;
}

.application--wrap {
  background-color: white;
}

div.ag-root .ag-cell-focus {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

</style>