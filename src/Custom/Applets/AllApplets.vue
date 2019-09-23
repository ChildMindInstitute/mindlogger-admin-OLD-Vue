<template>
  <div>
    <v-layout row wrap>
      <Applet v-for="(applet,i) in applets"
      :key="`i${i}`" :applet="applet" v-on:deleteApplet="deleteApplet"
        v-on:refreshApplet="refreshApplet"/>

      <v-card
        class="card"
        :width="310">
          <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0">
                Add New Applet
              </h3>
            </div>
          </v-card-title>
          <v-card-actions>
            <v-btn @click="dialog = true;">
              +
            </v-btn>
          </v-card-actions>
      </v-card>
    </v-layout>
    <v-dialog
      v-model="dialog"
      max-width="600"
    >
      <v-card>
        <v-card-text>
          <div style="margin-top: 2em;">
            <h3>Create a new applet:</h3>
            <v-text-field
              label="activity set url"
              v-model="newActivitySetURL"
            ></v-text-field>
            <v-btn color="success" :disabled="!newActivitySetURL || status === 'loading'" @click="addNewApplet">
              Add
            </v-btn>
          </div>
          <div class="mt-3">
            <h3> Quick Add </h3>
            <p> Below are a list of activity sets you can add. 
              These are JSON-LD files that describe the questions of your
              applet. Eventually, there will be a library of questions
              and you will be able to create your own.
            </p>
            <p v-for="activityInfo in sampleActivitySets" :key="activityInfo.name">
              <a @click="newActivitySetURL=activityInfo.url">{{activityInfo.name}}</a>
            </p>
          </div>
        </v-card-text></v-card>
    </v-dialog>
  </div>
</template>

<style>
  .card {
    margin: 12px;
  }
</style>

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
    panel() {
      console.log(this.panel)
      this.$emit('selected_applet', this.panel);
    },
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },
  data: () => ({
    sampleActivitySets: config.activitySets,
    panel: [],
    dialog: false
  }),
  computed: {

  },
  methods: {
    setInitialPanel() {
      const idx = _.findIndex(this.$store.state.allApplets, (a) => {
        return a.applet['schema:description'] == this.$store.state.currentApplet.applet['schema:description'];
      });
      if (idx > -1) {
        this.panel = idx;
      }
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
  },
  mounted() {
    this.setInitialPanel();
  },
}
</script>

