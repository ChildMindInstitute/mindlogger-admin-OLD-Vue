<template>
  <v-card class="appletCard" :width="cardWidth">
    <v-layout v-if="currentApplet" class="selectedApplet" align-center justify-center column>
      <v-icon size="72" color="primary">mdi-check</v-icon>
      <v-card-title primary-title>
        <h3 class="headline mb-0">{{ appletPrefLabel }}</h3>
      </v-card-title>
    </v-layout>
    <div v-else>
      <v-img
        :src="applet.applet['schema:image'] || 'https://picsum.photos/id/83/200/200'"
        width="100%"
        aspect-ratio="1"
        contain
      />
      <v-card-title primary-title>
        <h3 class="headline mb-0">{{ appletPrefLabel }}</h3>
      </v-card-title>
      <v-card-text>{{ appletDescription }}</v-card-text>
      <v-card-actions>
        <div class="container">
          <div>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  text
                  :disabled="status !== 'ready' || !applet.roles.includes('editor')"
                  @click="refreshApplet"
                  v-on="on"
                >
                  <span v-if="status === 'ready'">Refresh</span>
                  <span v-else>Refreshing..</span>
                </v-btn>
              </template>
              <span>Refreshing applets will take several minutes</span>
            </v-tooltip>
          </div>
          <div>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  text
                  :disabled="!applet.roles.includes('manager')"
                  @click="deleteApplet"
                  v-on="on"
                >Delete</v-btn>
              </template>
              <span>Permanantly disable this applet</span>
            </v-tooltip>
          </div>
          <div>
            <v-menu offset-x>
              <template v-slot:activator="{ on }">
                <v-btn text v-on="on">Select</v-btn>
              </template>
              <v-list>
                <router-link :to="{ name: 'Builder', params: { applet: applet} }">
                  <v-list-item>
                    <v-list-item-title>Duplicate</v-list-item-title>
                  </v-list-item>
                </router-link>
                <v-list-item :disabled="!applet.roles.includes('coordinator')" @click="onViewUsers">
                  <v-list-item-title>View Users</v-list-item-title>
                </v-list-item>
                <v-list-item
                  :disabled="!applet.roles.includes('coordinator')"
                  @click="onViewGeneralCalendar"
                >
                  <v-list-item-title>View General Calendar</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
      </v-card-actions>
    </div>
  </v-card>
</template>

<style scoped>
.appletCard {
  margin: 12px;
}
.selectedApplet {
  height: 100%;
  align-content: center;
}
.container > div {
  display: inline-block;
  display: -moz-inline-box;
  *display: inline;
  zoom: 1;
  width: 33%;
  text-align: center;
}
</style>

<script>
export default {
  name: "AppletCard",
  props: {
    applet: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    status: "ready",
    cardWidth: 300
  }),
  computed: {
    currentApplet() {
      return this.applet == this.$store.state.currentApplet;
    },
    appletPrefLabel() {
      if (
        typeof this.applet.applet[
          "http://www.w3.org/2004/02/skos/core#prefLabel"
        ] === "string"
      ) {
        return this.applet.applet[
          "http://www.w3.org/2004/02/skos/core#prefLabel"
        ];
      } else if (
        typeof this.applet.applet[
          "http://www.w3.org/2004/02/skos/core#prefLabel"
        ] === "object"
      ) {
        return this.applet.applet[
          "http://www.w3.org/2004/02/skos/core#prefLabel"
        ][0]["@value"];
      } else if (typeof this.applet.applet["skos:prefLabel"] === "string") {
        return this.applet.applet["skos:prefLabel"];
      } else if (typeof this.applet.applet["skos:prefLabel"] === "object") {
        return this.applet.applet["skos:prefLabel"][0]["@value"];
      } else {
        return null;
      }
    },
    appletDescription() {
      if (typeof this.applet.applet["schema:description"] === "string") {
        return this.applet.applet["schema:description"];
      } else if (typeof this.applet.applet["schema:description"] === "object") {
        return this.applet.applet["schema:description"][0]["@value"];
      } else if (
        typeof this.applet.applet["http://schema.org/description"] === "string"
      ) {
        return this.applet.applet["http://schema.org/description"];
      } else if (
        typeof this.applet.applet["http://schema.org/description"] === "object"
      ) {
        return this.applet.applet["http://schema.org/description"][0]["@value"];
      } else {
        return null;
      }
    }
  },
  methods: {
    refreshApplet() {
      this.$emit("refreshApplet", this.applet);
    },
    deleteApplet() {
      this.$emit("deleteApplet", this.applet);
    },
    setSelectedApplet() {
      this.$store.commit("setCurrentApplet", this.applet);

      if (this.applet.applet && this.applet.applet.schedule) {
        this.$store.commit(
          "setCachedEvents",
          this.applet.applet.schedule.events
        );
      } else {
        this.$store.commit("setCachedEvents", []);
      }
    },
    onViewUsers() {
      this.setSelectedApplet();
      const appletId = this.applet.applet._id.split("applet/")[1];
      this.$router.push(`applet/${appletId}/users`);
    },
    onViewGeneralCalendar() {
      this.setSelectedApplet();

      const appletId = this.applet.applet._id.split("applet/")[1];
      this.$store.commit("setCurrentUsers", []);
      this.$router.push(`applet/${appletId}/schedule`);
    }
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
}
</style>