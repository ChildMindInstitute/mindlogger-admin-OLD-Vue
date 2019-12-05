<template>
  <v-app>
    <router-view></router-view>
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
  @import "../node_modules/@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
</style>

<style>

.primary {
    background-color: #005fa3 !important;
    border-color: #005fa3 !important;
}

body, html, #app, #dayspan {
  font-family: 'IBM Plex Sans', sans-serif !important;
  width: 100%;
  height: 100%;
}

.v-btn--flat,
.v-text-field--solo .v-input__slot {
  background-color: #f5f5f5 !important;
  margin-bottom: 8px !important;
}

.application--wrap {
  background-color: white;
}

</style>
