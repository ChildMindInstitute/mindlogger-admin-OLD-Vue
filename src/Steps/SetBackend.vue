<template>
  <v-container>
    <v-layout row wrap>
        <v-flex>
          <h1>Select your Server</h1>
          <p>
            This server will hold your applet configuration settings
            and all the data you collect.
          </p>
          <v-text-field
            label="Server URL"
            v-model="backendServer"
          ></v-text-field>
        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'BackendServer',

  data: () => ({
    // default to mindlogger-dev
    backendServer: 'https://mindlogger-dev.vasegurt.com/api/v1',
  }),

  computed: {
    /**
     * only let the user continue
     * if backendServer is not empty
     */
    readyToContinue() {
      if (this.backendServer) {
        return true;
      }
      return false;
    }
  },
  /**
   * when the component is mounted,
   * load the backend from the store.
   */
  mounted() {
    if (this.$store.state.backend) {
      this.backendServer = this.$store.state.backend;
    }
  },

  methods: {
    /**
     * save the backend to the store
     */
    continueAction() {
      this.$store.commit('setBackend', this.backendServer);
      return this.$store.state.backend;
    }
  },

};
</script>

