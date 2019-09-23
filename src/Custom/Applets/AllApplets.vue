<template>
  <div>
    <v-layout row wrap justify-center>
      <Applet v-for="(applet,i) in applets"
      :key="`i${i}`" :applet="applet" v-on:deleteApplet="deleteApplet"
      v-on:refreshApplet="refreshApplet"/>
    </v-layout>
    <v-btn
      color="primary"
      fixed bottom right fab
      style="bottom: 70px; right: 40px;"
      @click="dialog = true"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <v-dialog
      v-model="dialog"
      max-width="800"
    >
      <v-card>
        <v-card-text>
          <h3>Create a new applet:</h3>
          <v-text-field
            label="activity set url"
            v-model="newActivitySetURL"
          ></v-text-field>
          <v-btn color="success" :disabled="!newActivitySetURL || status === 'loading'" @click="addNewApplet">
            Add
          </v-btn>
          <h3> Quick Add </h3>
          <p> Below are a list of activity sets you can add. 
            These are JSON-LD files that describe the questions of your
            applet. Eventually, there will be a library of questions
            and you will be able to create your own.
          </p>
          <p v-for="activityInfo in sampleActivitySets" :key="activityInfo.name">
            <a @click="newActivitySetURL=activityInfo.url">{{activityInfo.name}}</a>
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
import Applet from './Applet';
import adminApi from '../Utils/api';
import config from '../../config';


export default {
  name: 'AllApplets',
  props: {
    applets: {
      type: Array,
      required: true,
    }
  },
  components: {
    Applet,
  },
  watch: {
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },
  data: () => ({
    sampleActivitySets: config.activitySets,
    dialog: false,
    /**
     * placeholder for the new applet URL
     * this will likely be a github link to an activity set
     * from the ReproNim
     */
    newActivitySetURL: '',
  }),
  computed: {

  },
  methods: {
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
    },
    /**
     * delete an applet
     */
    deleteApplet(applet) {
      console.log('going to delete here', applet);
      adminApi.deleteApplet({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: applet.applet._id.split('applet/')[1],
      }).then((resp) => {
        console.log(resp);
        this.$emit('refreshAppletList');
      });
    },
    /**
     * refresh an applet's activity set
     */
    refreshApplet(applet) {
      adminApi.refreshApplet({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: applet.applet._id.split('applet/')[1],
      }).then((resp) => {
        console.log(resp);
        this.$emit('refreshAppletList');
      });
    },
  }
}
</script>

