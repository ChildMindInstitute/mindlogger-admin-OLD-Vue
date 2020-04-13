<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-toolbar-title>MindLogger Admin</v-toolbar-title>
      <v-spacer />
      <v-menu
        v-if="isLoggedIn"
        bottom
        left
      >
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            @click="logout"
          >
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-content>
      <v-container
        fluid
      >
        <router-view />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import store from './State/state';
import _ from 'lodash';

export default {
  name: 'App',
  store,
  computed: {
    isLoggedIn() {
      return !_.isEmpty(this.$store.state.auth);
    },
  },
  methods: {
    logout() {
      this.$store.commit('resetState');
      this.$router.push('/login')
    },
  },
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