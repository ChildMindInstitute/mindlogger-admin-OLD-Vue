<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-toolbar-title>
        MindLogger Admin {{ showEnvironment }}
      </v-toolbar-title>
      <v-spacer />
      <v-menu
        v-if="isLoggedIn"
        :offset-y="true"
        :nudge-width="150"
        bottom
        right
      >
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-list>
            <v-list-item @click="logout">
              <v-list-item-content>
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item-content>

              <v-list-item-action>
                <v-icon>mdi-logout</v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <v-divider />

          <v-list>
            <v-list-item>
              <v-list-item-title @click="switchAccount(ownerAccountId)">
                {{ ownerAccountName }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item 
              v-for="(account, index) in accounts" 
              :key="index" 
              @click="switchAccount(account.accountId)"
            >
              <v-list-item-title>{{ account.accountName }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
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
import api from './Components/Utils/api/api.vue';
import _ from 'lodash';

export default {
  name: 'App',
  store,
  computed: {
    isLoggedIn() {
      return !_.isEmpty(this.$store.state.auth);
    },
    showEnvironment() {
      return process.env.VUE_APP_TITLE_ENV
    },
    ownerAccountName() {
      return this.$store.state.ownerAccount.accountName;
    },
    ownerAccountId() {
      return this.$store.state.ownerAccount.accountId;
    },
    accounts() {
      const accounts = [];
      this.$store.state.allAccounts.forEach(account => {
        if (!account.owned) {
          accounts.push(account);
        }
      });
      return accounts;
    }
  },
  methods: {
    logout() {
      this.$store.commit('resetState');
      this.$router.push('/login')
    },
    
    switchAccount(accountId) {
      api.switchAccount({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        accountId
      }).then((resp) => {
        this.$store.commit('switchAccount', resp.data.account);
        this.$router.push('/build');
        this.$router.push('/applets');
      }).catch((err) => {
        console.warn(err);
      })
    }
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