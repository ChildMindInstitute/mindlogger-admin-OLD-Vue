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
      <AppletCard
        v-for="(applet,i) in applets"
        :key="`i${i}`"
        :applet="applet"
        @deleteApplet="deleteApplet"
        @refreshApplet="refreshApplet"
        @selectApplet="getAppletUsers"
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
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-dialog
      v-model="dialog"
      max-width="800"
    >
      <v-card>
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
            Build a new activity set from scratch and download the schema files. Currently, this feature only supports radio items and text items.
          </p>
          <router-link
            to="/build"
            target="_blank"
          >
            <v-btn
              color="primary"
            >
              Launch Builder
            </v-btn>
          </router-link>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AppletCard from './AppletCard.vue';
import api from '../Utils/api/api.vue';
import config from '../../config';

export default {
  name: 'AllApplets',
  components: {
    AppletCard,
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
    newProtocolURL: '',
  }),
  computed: {
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },
  watch: {
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },
  methods: {
    onClickAdd(){
      this.dialog = false;
      this.addNewApplet();
    },
    addNewApplet() {
      api.addNewApplet({
        protocolUrl: this.newProtocolURL,
        token: this.$store.state.auth.authToken.token,
        apiHost: this.$store.state.backend,
      }).then((resp) => {
        this.newProtocolURL = '';
        this.$emit('appletUploadSuccessful', resp);
      }).catch((e) => {
        this.$emit('appletUploadError');
      });
    },
    deleteApplet(applet) {
      api.deleteApplet({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: applet.applet._id.split('applet/')[1],
      }).then((resp) => {
        this.$emit('refreshAppletList');
      });
    },
    refreshApplet(applet) {
      api.refreshApplet({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: applet.applet._id.split('applet/')[1],
      }).then((resp) => {
        this.$emit('refreshAppletList');
      });
    },
    getAppletUsers() {
      this.$store.commit('setUsers', []);
      api.getAppletUsers({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: this.currentApplet.applet._id.split('applet/')[1],
      }).then((resp) => {
        this.$store.commit('setUsers', resp.data);
      });
    },
  }
}
</script>
