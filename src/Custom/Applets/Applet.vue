<template>
    <v-card style="margin: 18px">
       <v-layout>
        <!-- <v-img
          :src="applet.applet['schema:image'] || 'https://picsum.photos/id/83/200/200'"
          class="smallish"
        ></v-img> -->
          <v-flex class="text-lg-right">
            <div v-if="currentApplet" style="color: red; text-align: center;">
              <h4>CURRENT</h4>
            </div>
            <v-img
              :src="applet.applet['schema:image'] || 'https://picsum.photos/id/83/200/200'"
              height="125px"
              width="125px"
              class="pa-3 ma-3"
              contain
            ></v-img>
          </v-flex>

          <v-flex>
            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0">
                  {{applet.applet["skos:prefLabel"]}}
                </h3>
                <div> {{ applet.applet["schema:description"] }} </div>
              </div>
            </v-card-title>
            <!-- <v-card-text>
              omg the below doesn't make any sense because this is set per activity, not per applet.
              so delete this.
              <v-radio-group v-model="scheduleType" :mandatory="false" :disabled="!currentApplet">
                <v-radio label="No Schedule" value="none"></v-radio>
                <v-radio label="Calendar Dates" value="absolute"></v-radio>
                <v-radio label="Relative to first response" value="relative"></v-radio>
              </v-radio-group>
            </v-card-text> -->
            <v-btn :disabled="status !== 'ready'" @click="refreshApplet">
              <span v-if="status === 'ready'">Refresh</span>
              <span v-else> Refreshing.. </span>
            </v-btn>
            <v-btn @click="deleteApplet">
              Delete
            </v-btn>
            <v-btn @click="setSelectedApplet">
              Select
            </v-btn>
          </v-flex>
        </v-layout>
        

        <v-card-actions class="pa-3 pt-3">
          <!-- <v-btn flat color="orange" @click="select">Select</v-btn> -->
        </v-card-actions>
    </v-card>
</template>

<style>
  .smallish {
    max-width: 400px;
    min-width: 200px;
    width: 300px;
    height: 100px;
  }
</style>

<script>
export default {
  name: 'Applet',
  props: {
    applet: {
      type: Object,
      required: true,
    },
  },
  computed: {
    currentApplet() {
      if (this.applet == this.$store.state.currentApplet) {
        return true;
      }
      return false;
    }
  },
  data: () => ({
    status: 'ready',
  }),
  watch: {
    // scheduleType() {
    //   if (this.currentApplet) {
    //     // this.$store.commit('setSchedule', { scheduleType: this.scheduleType });
    //   }
    // }
  },
  methods: {
    // select() {
    //   // this.$store.commit('setCurrentApplet', this.applet);
    //   if (!this.applet.schedule) {
    //     // this.applet.schedule = { scheduleType: 'none' };
    //     // this.$store.commit('setSchedule', this.applet.schedule);
    //   }
    // }
    refreshApplet() {
      this.$emit('refreshApplet', this.applet);
    },
    deleteApplet() {
      this.$emit('deleteApplet', this.applet);
    },
    setSelectedApplet() {
      console.log(this.applet);
      this.$store.commit('setCurrentApplet', this.applet);
    }
  },
  created() {

  }
}
</script>

