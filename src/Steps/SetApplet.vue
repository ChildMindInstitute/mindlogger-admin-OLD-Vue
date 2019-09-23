<template>
  <v-container>
    <div v-if="isLoggedIn">
      <h1 style="text-align: center;">Your Applets</h1>
      <p style="text-align: center;" class="mb-3">
        An applet is a collection of
        <a href="https://github.com/ReproNim/schema-standardization">reusable surveys</a>
        along with
        study-specific settings, like your users and schedule.
      </p>
      <div v-if="status === 'loading'">
        <Loader />
      </div>
      <div v-else-if="status === 'error'" class="error">
        {{error.message}}
      </div>
      
      <AllApplets :applets="allApplets" v-on:selected_applet="setSelectedApplet"
        v-on:refreshAppletList="getApplets"/>
    </div>
  </v-container>
</template>

<script>
// grab the api component we wrote in mindlogger-web
import api from '@bit/akeshavan.mindlogger-web.api';
import _ from 'lodash';
import AllApplets from '../Custom/Applets/AllApplets';
import adminApi from '../Custom/Utils/api';
import { Parse, Day } from 'dayspan';
import Loader from '@bit/akeshavan.mindlogger-web.loader';

window.Parse = Parse;
window.Day = Day;

export default {
  name: 'Applet',
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
    /**
     * placeholder for the new applet URL
     * this will likely be a github link to an activity set
     * from the ReproNim
     */
    newActivitySetURL: '',
  }),
  components: {
    AllApplets,
    Loader,
  },
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
    /**
     * add a new applet
     */
    addNewApplet() {
      /**
       * TODO: add a route in ../Custom/Utils/api.vue
       * and call it with this.newAppletURL
       */

      this.status = 'loading';
      adminApi.addNewApplet({ 
        activitySetUrl: this.newActivitySetURL,
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        // user: this.$store.state.auth.user._id,
        name: 'Mood',
      }).then(() => {
        // response should have the updated applet list
        // this.$store.commit('setAllApplets', resp.data);
        this.newActivitySetURL = '';
        this.status = 'ready';
        this.getApplets();
      });
    }
  },
  /**
   * get the user's applets if they are logged in
   */
  mounted() {
    if (this.isLoggedIn) {
      this.getApplets();
    }
  },
}
</script>

