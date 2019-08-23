<template>
  <v-container>
    <v-layout row wrap>
        <v-flex>
          <h1>Select your Server</h1>
          <p>
            This server will hold your applet configuration settings
            and all the data you collect.
          </p>
          <div id="serverInputContainer">
            <v-select
              label="Server URL"
              @change="onChange($event)"
              id="serverSelector"
              :items="backendServers"
              item-value="url"
              item-text="name"
            ></v-select>
            <v-text-field
              id="serverTextInput"
              label="Server URL"
              v-model="backendServer"
              style="display:none;"
            ></v-text-field>
          </div>
          <span class="underline"></span>
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
      {'name': 'MindLogger', 'url': 'https://api.mindlogger.org/api/v1'},
      {'name': 'MindLogger development', 'url': 'https://dev.mindlogger.org/api/v1'},
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
        var inputContainer=document.getElementById('serverInputContainer');
        this.backendServer = 'https://????/api/v1';
        inputContainer.childNodes[0].style.display='none';
        inputContainer.childNodes[1].style.display='block';
      }
    },
    updateValue(event) {
      this.backendServer = event;
    },
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
