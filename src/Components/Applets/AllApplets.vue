<template>
  <div>
    <v-layout
      v-if="applets === undefined || applets.length == 0"
      align-center
      column
    >
      <h1>
        You have no active applets.
      </h1>
    </v-layout>
    <v-layout
      v-else
      row
      wrap
      justify-center
    >
      <Applet
        v-for="(applet,i) in applets"
        :key="`i${i}`"
        :applet="applet"
        @deleteApplet="deleteApplet"
        @refreshApplet="refreshApplet"
      />
    </v-layout>
    <v-btn
      color="primary"
      fixed
      bottom
      right
      fab
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
            v-model="newActivitySetURL"
            label="activity set url"
          />
          <v-btn
            color="primary"
            :disabled="!newActivitySetURL"
            @click="onClickAdd"
          >
            Add
          </v-btn>
          <h3> Quick Add </h3>
          <p>
            Below are a list of activity sets you can add.
            These are JSON-LD files that describe the questions of your
            applet. Eventually, there will be a library of questions
            and you will be able to create your own.
          </p>
          <p
            v-for="activityInfo in sampleActivitySets"
            :key="activityInfo.name"
          >
            <a @click="newActivitySetURL=activityInfo.url">{{ activityInfo.name }}</a>
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// import _ from 'lodash';
import Applet from './Applet';
import api from '../Utils/api/api.vue';
import config from '../../config';

export default {
  name: 'AllApplets',
  components: {
    Applet,
  },
  props: {
    applets: {
      type: Array,
      required: true,
    }
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
  watch: {
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },
  methods: {
    /**
     * closes modal and adds applet
     */
    onClickAdd(){
      this.dialog = false;
      this.addNewApplet();
    },
    /**
     * api call to add a new applet
     */
    addNewApplet() {
      api.addNewApplet({
        activitySetUrl: this.newActivitySetURL,
        token: this.$store.state.auth.authToken.token,
        apiHost: this.$store.state.backend,
      }).then(() => {
        this.newActivitySetURL = '';
        this.$emit('refreshAppletList');
      });
    },
    /**
     * deactivates an applet
     */
    deleteApplet(applet) {
      api.deleteApplet({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: applet.applet._id.split('applet/')[1],
      }).then((resp) => {
        // eslint-disable-next-line
        console.log(resp);
        this.$emit('refreshAppletList');
      });
    },
    /**
     * refresh an applet's activity set
     */
    refreshApplet(applet) {
      api.refreshApplet({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: applet.applet._id.split('applet/')[1],
      }).then((resp) => {
        // eslint-disable-next-line
        console.log(resp);
        this.$emit('refreshAppletList');
      });
    },
  }
}
</script>
