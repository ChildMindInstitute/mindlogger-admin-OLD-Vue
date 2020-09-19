<template>
  <div>
    <v-layout
      v-if="applets === undefined || applets.length == 0"
      align-center
      column
    >
      <h1>You have no active applets.</h1>
    </v-layout>
    <v-layout
      v-else
      row
      wrap
      justify-center
    >
      <AppletCard
        v-for="(applet,i) in applets"
        :key="`i${i + baseKey}`"
        :applet="applet"
        @deleteApplet="deleteApplet"
        @refreshApplet="refreshApplet"
        @onUpdateAppletPassword="onUpdateAppletPassword"
        @duplicateApplet="duplicateApplet"
      />
    </v-layout>

    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn
          color="primary"
          fixed
          bottom
          right
          fab
          style="bottom: 70px; right: 40px;"
          :disabled="!isEditable"
          @click="appletUploadDialog = true"
          v-on="on"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <span>Create or upload a new applet</span>
    </v-tooltip>

    <v-dialog
      v-model="appletUploadDialog"
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
          <h3>Quick Add</h3>
          <p>
            Below are a list of activity sets you can add. These are JSON-LD
            files that describe the questions of your applet. Eventually, there
            will be a library of questions and you will be able to create your
            own.
          </p>
          <p
            v-for="activityInfo in sampleProtocols"
            :key="activityInfo.name"
          >
            <a @click="newProtocolURL = activityInfo.url">
              {{ activityInfo.name }}
            </a>
          </p>
          <h3>Build a new activity Set</h3>
          <p>
            Build a new activity set from scratch and download the schema files.
            Currently, this feature only supports radio items and text items.
          </p>
          <router-link
            to="/build"
            target="_blank"
          >
            <v-btn color="primary">
              Launch Builder
            </v-btn>
          </router-link>
        </v-card-text>
      </v-card>
    </v-dialog>

    <AppletPassword
      v-model="appletPasswordDialog"
      :hasConfirmPassword="true"
      @set-password="onClickSubmitPassword"
    />

    <AppletName
      v-model="appletDuplicateDialog.visibility"
      @set-value="onSetAppletDuplicateName"
      ref="appletNameDialog"
    />
  </div>
</template>

<script>
import AppletCard from './AppletCard.vue';
import api from '../Utils/api/api.vue';
import config from '../../config';
import encryption from '../Utils/encryption/encryption.vue';
import AppletPassword from '../Utils/dialogs/AppletPassword'
import AppletName from '../Utils/dialogs/AppletName';

export default {
  name: "AllApplets",
  components: {
    AppletCard,
    AppletPassword,
    AppletName,
  },
  props: {
    applets: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    sampleProtocols: config.protocols,
    appletUploadDialog: false,
    newProtocolURL: '',
    appletPasswordDialog: false,
    requestedAction: null,
    baseKey: 0,
    appletDuplicateDialog: {
      visibility: false,
      applet: null
    }
  }),
  computed: {
    isEditable() {
      let isEditor = false;
      this.applets.forEach((applet) => {
        if (applet.roles.includes("editor")) {
          isEditor = true;
        }
      });
      if (this.applets.length === 0) {
        isEditor = true;
      }
      return isEditor;
    },

    currentApplet() {
      return this.$store.state.currentApplet;
    },

    accountApplets() {
      return this.$store.state.currentApplets;
    },
  },
  watch: {
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },
  methods: {
    onClickAdd() {
      this.appletUploadDialog = false;
      this.appletPasswordDialog = true;
      this.requestedAction = this.addNewApplet.bind(this);
    },

    onUpdateAppletPassword(applet) {
      this.appletPasswordDialog = true;
      this.requestedAction = this.setAppletPassword.bind(this, applet);
    },

    setAppletPassword(applet, appletPassword) {
      let apiHost = this.$store.state.backend;
      let token = this.$store.state.auth.authToken.token;
      let appletId = applet.applet._id.split("applet/")[1];

      api.setAppletEncryption({
        token,
        apiHost,
        data: this.getEncryptionForm(appletPassword),
        appletId
      }).then(() => api.getApplet({
        token,
        apiHost,
        id: appletId,
        allEvent: this.accountApplets.find(value => value.appletId == appletId).allEvent
      })).then((resp) => {
        this.$store.commit('updateAppletData', {
          ...resp.data,
          roles: applet.roles
        });

        this.baseKey = this.baseKey + 1;
        this.$emit('onAppletPasswordChanged');
      })
    },

    onClickSubmitPassword(appletPassword) {
      this.appletPasswordDialog = false;
      this.requestedAction(appletPassword);
    },

    getEncryptionForm(appletPassword) {
      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword: appletPassword,
        accountId: this.$store.state.currentAccount.accountId
      });

      const encryptionForm = new FormData();
      encryptionForm.set('encryption', JSON.stringify({
            appletPublicKey: Array.from(encryptionInfo.getPublicKey()),
            appletPrime: Array.from(encryptionInfo.getPrime()),
            base: Array.from(encryptionInfo.getGenerator())
      }));

      return encryptionForm;
    },

    addNewApplet(appletPassword) {
      api.addNewApplet({
        protocolUrl: this.newProtocolURL,
        email: this.$store.state.userEmail,
        token: this.$store.state.auth.authToken.token,
        apiHost: this.$store.state.backend,
        data: this.getEncryptionForm(appletPassword)
      }).then((resp) => {
        this.newProtocolURL = '';
        this.$emit('appletUploadSuccessful', resp.data.message);
      }).catch((e) => {
        this.$emit('appletUploadError');
      });
    },

    deleteApplet(applet) {
      api
        .deleteApplet({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: applet.applet._id.split("applet/")[1],
        })
        .then((resp) => {
          this.$emit("refreshAppletList");
        });
    },

    refreshApplet(applet) {
      api
        .refreshApplet({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: applet.applet._id.split("applet/")[1],
        })
        .then((resp) => {
          this.$emit("refreshAppletList");
        });
    },
    duplicateApplet(applet) {
      this.appletDuplicateDialog.visibility = true;
      this.appletDuplicateDialog.applet = applet;
      this.$refs.appletNameDialog.appletName = `duplicate of ${applet.applet['http://www.w3.org/2004/02/skos/core#prefLabel'][0]['@value']}`;
    },

    onSetAppletDuplicateName(appletName) {
      api
        .duplicateApplet({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.appletDuplicateDialog.applet.applet._id.split('/')[1],
          options: {
            name: appletName,
          }
        })
        .then(resp => {
          this.$emit("refreshAppletList");
        });
    }
  },
};
</script>
