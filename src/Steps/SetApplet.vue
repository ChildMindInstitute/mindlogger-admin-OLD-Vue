<template>
  <v-container fluid>
    <Loading v-if="status === 'loading'" />
    <div
      v-else-if="status === 'error'"
      class="error"
    >
      {{ error.message }}
    </div>
    <AllApplets
      v-else
      :applets="allApplets"
      @refreshAppletList="getApplets"
    />
  </v-container>
</template>

<script>
// grab the api component we wrote in mindlogger-web
import api from '@bit/akeshavan.mindlogger-web.api';
import _ from 'lodash';
import AllApplets from '../Components/Applets/AllApplets';
import Loading from '../Components/Utils/Loading';
import { Parse, Day } from 'dayspan';
import config from '../config';

window.Parse = Parse;
window.Day = Day;

export default {
  name: 'Applet',
  components: {
    AllApplets,
    Loading,
  },
  data: () => ({
    sampleActivitySets: config.activitySets,
    /**
     * placeholder for any error messages from axios
     */
    error: {},
    /**
     * status of the get applets route
     */
    status: 'loading',
  }),
  computed: {
    /**
     * a list of all the applets
     */
    allApplets() {
      return this.$store.state.allApplets;
    },
    /**
     * the currently selected applet
     */
    currentApplet() {
      return this.$store.state.currentApplet;
    },
    /**
     * boolean for whether or not the user is logged in
     */
    isLoggedIn() {
      return !_.isEmpty(this.$store.state.auth);
    },
    /**
     * only allow the user to continue if they have selected
     * a current applet
     */
    readyToContinue() {
      return !_.isEmpty(this.currentApplet);
    },
  },
  watch: {
    isLoggedIn() {
      if (this.isLoggedIn) {
        this.getApplets();
      }
    },
  },
  /**
   * get the user's applets if they are logged in
   */
  mounted() {
    if (this.isLoggedIn) {
      this.getApplets();
    }
  },
  methods: {
    /**
     * call getAppletsForUser and commit the response to the store.
     */
    getApplets() {
      this.status = 'loading';
      api.getAppletsForUser({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        user: this.$store.state.auth.user._id,
        role: 'manager',
      }).then((resp) => {
        // eslint-disable-next-line
        console.log(resp.data);
        this.$store.commit('setAllApplets', resp.data);
        this.status = 'ready';
      }).catch((e) => {
        this.error = e;
        this.status = 'error';
      });
    },
    /**
     * nothing to do when the user hits 'continue'
     */
    continueAction() {

    },
    /**
     * commit the current applet to the store
     */
    /**
     * get group memberships for the current applet
     */
    // getGroupMemberships() {
    //   adminApi.getGroupMemberships({
    //     apiHost: this.$store.state.backend,
    //     token: this.$store.state.auth.authToken.token,
    //     appletId: this.currentApplet.applet._id.split('applet/')[1],
    //   }).then((resp) => {
    //     console.log('response from group memberships', resp);
    //     const groups = [
    //       {
    //         name: 'user',
    //         id: resp.data.user.groups[0]._id,
    //       },
    //       {
    //         name: 'reviewer',
    //         id: resp.data.user.groups[0]._id,
    //       },
    //       {
    //         name: 'manager',
    //         id: resp.data.user.groups[0]._id,
    //       },
    //     ]
    //     this.$store.commit('setGroups', groups);
    //   });
    // },
  },
}
</script>
