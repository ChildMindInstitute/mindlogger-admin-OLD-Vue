<template>
  <v-container>
    <v-layout
      row
      wrap
    >
      <v-flex>
        <h1 style="text-align: center;">
          MindLogger Admin
        </h1>
        <p style="text-align: center;">
          The MindLogger admin panel enables you to add
          set of surveys (called an applet)
          to your mobile app, and invite others to take them.

          For more information, check out the
          <a href="https://github.com/ChildMindInstitute/mindlogger-app/wiki/Quickstart">Quickstart Guide</a>
          .
        </p>

        <br>

        <v-card>
          <v-card-text>
            <h2>Select your Server</h2>
            <p>
              This server will hold your applet configuration settings
              and all the data you collect.
            </p>
            <div id="serverInputContainer">
              <v-select
                id="serverSelector"
                label="Server URL"
                :items="backendServers"
                item-value="url"
                item-text="name"
                @change="onChange($event)"
              />
              <v-text-field
                id="serverTextInput"
                v-model="backendServer"
                label="Server URL"
                style="display:none;"
              />
            </div>
            <span class="underline" />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
export default {
  name: 'BackendServer',

  data: () => ({
    // default to production API host
    backendServer: '',
    backendServers: [
      {'name': 'MindLogger (api.mindlogger.org)', 'url': 'https://api.mindlogger.org/api/v1'},
      {'name': 'MindLogger development (dev.mindlogger.org)', 'url': 'https://dev.mindlogger.org/api/v1'},
      {'name': 'localhost (localhost:8080)', 'url': 'http://localhost:8080/api/v1'},
      {'name': 'other', 'url': ''}
    ]
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
    onChange(value) {
      this.backendServer = value;
      if(this.backendServer==''){
        this.backendServer = 'https://????/api/v1';
      }
      var inputContainer=document.getElementById('serverInputContainer');
      inputContainer.childNodes[0].style.display='none';
      inputContainer.childNodes[1].style.display='block';
    },
    updateValue(event) {
      this.backendServer = event;
    },
    /**
     * save the backend to the store
     */
    continueAction() {
      this.$store.commit('setBackend', this.backendServer.trim());
      return this.$store.state.backend;
    }
  },

};
</script>
