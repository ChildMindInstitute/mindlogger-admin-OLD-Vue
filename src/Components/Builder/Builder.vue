<template>
  <v-content>
    <About v-if="aboutOpen" />
    <AppletSchemaBuilder
      v-else
      exportButton
      @uploadProtocol="onUploadProtocol"
    />

    <v-dialog v-model="dialog">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          Upload Received
        </v-card-title>
        <v-card-text>
          {{ dialogText }}
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="dialog = false">
            Dismiss
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-content>
</template>

<script>
import Components from "applet-schema-builder";
import About from "./AboutBuilder";
import PackageJson from "../../../package.json";
import api from "../Utils/api/api.vue";
import { cloneDeep } from "lodash";

export default {
  name: "Builder",
  components: {
    ...Components,
    About,
  },
  data() {
    return {
      drawer: false,
      aboutOpen: false,
      package: PackageJson,
      dialog: false,
      dialogText: "",
    };
  },
  methods: {
    onUploadProtocol(newApplet) {
      const protocol = new FormData();
      protocol.set("protocol", JSON.stringify(newApplet || {}));

      api
        .createApplet({
          data: protocol,
          email: this.$store.state.userEmail,
          token: this.$store.state.auth.authToken.token,
          apiHost: this.$store.state.backend,
        })
        .then((resp) => {
          this.dialogText =
            "The applet is being created. Please check back in several mintutes to see it.";
          this.dialog = true;
        })
        .catch((e) => {
          console.log(e);
          this.dialogText =
            "There was an error uploading your applet. Please try again or report the issue.";
          this.dialog = true;
        });
    },
  },
};
</script>
