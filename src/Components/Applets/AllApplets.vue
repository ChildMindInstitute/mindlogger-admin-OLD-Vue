<template>
  <div>
    <v-layout
      v-if="applets === undefined || applets.length == 0"
      align-center
      column
    >
      <h1>{{ $t("noActiveApplets") }}</h1>
    </v-layout>
    <v-layout v-else row wrap justify-center>
      <AppletCard
        v-for="(applet, i) in applets"
        :key="`i${i}`"
        :applet="applet"
        @deleteApplet="deleteApplet"
        @refreshApplet="refreshApplet"
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
          @click="dialog = true"
          v-on="on"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <span>{{ $t("createUploadApplet") }}</span>
    </v-tooltip>

    <v-dialog v-model="dialog" max-width="800">
      <v-card>
        <v-card-text>
          <h3>{{ $t("uploadActivitySet") }}</h3>
          <v-text-field
            v-model="newProtocolURL"
            :label="$t('activitySetUrl')"
          />
          <v-btn
            color="primary"
            :disabled="!newProtocolURL"
            @click="onClickAdd"
          >
            {{ $t("add") }}
          </v-btn>
          <h3>{{ $t("quickAdd") }}</h3>
          <p>
            {{ $t("jsonLdFiles") }}
          </p>
          <p v-for="activityInfo in sampleProtocols" :key="activityInfo.name">
            <a @click="newProtocolURL = activityInfo.url">
              {{ activityInfo.name }}
            </a>
          </p>
          <h3>{{ $t("buildNewActivity") }}</h3>
          <p>
            {{ $t("buildNewActivityScratch") }}
          </p>
          <router-link to="/build" target="_blank">
            <v-btn color="primary">
              {{ $t("launchBuilder") }}
            </v-btn>
          </router-link>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AppletCard from "./AppletCard.vue";
import api from "../Utils/api/api.vue";
import config from "../../config";

export default {
  name: "AllApplets",
  components: {
    AppletCard,
    // AppletPassword
  },
  props: {
    applets: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    sampleProtocols: config.protocols,
    dialog: false,
    appletUploadDialog: false,
    newProtocolURL: "",
    appletPasswordDialog: false,
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
  },
  watch: {
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },
  methods: {
    onClickAdd() {
      this.dialog = false;
      this.addNewApplet();
    },
    addNewApplet() {
      api
        .addNewApplet({
          protocolUrl: this.newProtocolURL,
          email: this.$store.state.userEmail,
          token: this.$store.state.auth.authToken.token,
          apiHost: this.$store.state.backend,
        })
        .then((resp) => {
          this.newProtocolURL = "";
          this.$emit("appletUploadSuccessful");
        })
        .catch((e) => {
          this.$emit("appletUploadError");
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
  },
};
</script>
