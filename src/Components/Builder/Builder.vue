<template>
  <div>
    <v-toolbar
      app
      dark
      color="primary"
      clipped-left
    >
      <v-toolbar-side-icon
        @click="toggleDrawer"
      />
      <v-toolbar-title>Activity Set Builder</v-toolbar-title>
    </v-toolbar>

    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
    >
      <v-list>
        <v-list-tile
          @click="toggleAbout"
        >
          <v-list-tile-action>
            <v-icon>info</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>About</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <About
        v-if="aboutOpen"
      />
      <ActivitySetBuilder
        v-else
      />
    </v-content>
  </div>
</template>

<script>
import Components from 'activity-set-builder';
import About from './AboutBuilder';

export default {
  name: 'Builder',
  components: {
    ...Components,
    About
  },
  data () {
    return {
      drawer: false,
      aboutOpen: false,
    };
  },
  methods: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    toggleAbout() {
      this.aboutOpen = !this.aboutOpen;
    }
  }
}
</script>
