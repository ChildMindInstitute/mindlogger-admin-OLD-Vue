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
      <v-card v-if="!builderOpen">
        <v-card-text>
          <h3>Upload an activity set</h3>
          <v-text-field
            v-model="newProtocolURL"
            label="activity set url"
          />
          <v-btn
            color="primary"
            :disabled="!newProtocolURL"
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
            v-for="activityInfo in sampleProtocols"
            :key="activityInfo.name"
          >
            <a @click="newProtocolURL=activityInfo.url">{{ activityInfo.name }}</a>
          </p>
          <h3> Build a new activity Set </h3>
          <p>
            Build a new activity set from scratch and download the schema files. Currently supported item types include radio and text.
          </p>
          <v-btn
            color="primary"
            @click="builderOpen = true"
          >
            Launch Builder (beta)
          </v-btn>
        </v-card-text>
      </v-card>
      <v-card v-else>
        <ActivitySetBuilder v-on:closeBuilder="builderOpen = false"/>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// import _ from 'lodash';
import Applet from './Applet';
import ActivitySetBuilder from '../ActivitySetBuilder/ActivitySetBuilder.vue';
import api from '../Utils/api/api.vue';
import config from '../../config';

export default {
  name: 'AllApplets',
  components: {
    Applet,
    ActivitySetBuilder
  },
  props: {
    applets: {
      type: Array,
      required: true,
    }
  },
  data: () => ({
    sampleProtocols: config.protocols,
    dialog: false,
    builderOpen: false,
    /**
     * placeholder for the new applet URL
     * this will likely be a github link to an activity set
     * from the ReproNim
     */
    newProtocolURL: '',
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
        protocolUrl: this.newProtocolURL,
        token: this.$store.state.auth.authToken.token,
        apiHost: this.$store.state.backend,
      }).then(() => {
        this.newProtocolURL = '';
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
