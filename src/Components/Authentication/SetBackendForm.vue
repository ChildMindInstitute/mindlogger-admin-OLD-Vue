<template>
  <div>
    <v-card class="elevation-12">
      <v-toolbar
        color="primary"
        dark
        flat
      >
        <v-toolbar-title>{{ $t("setServer") }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p>
          {{ $t("selectYourServer") }}
        </p>
        <v-form>
          <v-combobox
            v-model="backendServer"
            label="Server URL"
            :items="backendServers"
            item-value="url"
            item-text="name"
            prepend-icon="mdi-server"
          />
        </v-form>

        <v-btn
          color="primary"
          @click="onOkay"
        >
          {{ $t("okay") }}
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.error {
  color: "red";
}

.v-btn {
  margin: 6px 8px;
}
</style>

<script>
import api from "../Utils/api/api.vue";
import _ from "lodash";

export default {
  data: () => ({
    backendServer: "",
    backendServers: [
      {
        name: "MindLogger (api.mindlogger.org)",
        url: "https://api.mindlogger.org/api/v1",
      },
      {
        name: "MindLogger development (api-dev.mindlogger.org)",
        url: "https://api-dev.mindlogger.org/api/v1",
      },
      {
        name: "MindLogger staging (api-staging.mindlogger.org)",
        url: "https://api-staging.mindlogger.org/api/v1",
      },
      {
        name: "localhost (localhost:8080)",
        url: "http://localhost:8080/api/v1",
      },
      {
        name: "admin new",
        url: "https://api-new.mindlogger.org/api/v1"
      },
      { name: "other", url: "" },
    ],
  }),

  mounted() {
    if (this.$store.state.backend) {
      this.backendServer = this.$store.state.backend;
    }
  },

  methods: {
    setBackend() {
      if (
        typeof this.backendServer === "string" ||
        this.backendServer instanceof String
      ) {
        this.$store.commit("setBackend", this.backendServer.trim());
      } else {
        this.$store.commit("setBackend", this.backendServer.url.trim());
      }
    },
    onOkay() {
      this.setBackend();
      this.$emit("setBackend", null);
    },
  },
};
</script>
