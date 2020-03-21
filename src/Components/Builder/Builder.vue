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
      <v-toolbar-title>{{ `Protocol Builder Version ${this.package.dependencies['protocol-builder']}` }}</v-toolbar-title>
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
      <ProtocolBuilder
        v-else
      />
    </v-content>
  </div>
</template>

<script>
import Components from 'protocol-builder';
import About from './AboutBuilder';
import PackageJson from '../../../package.json';

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
      package: PackageJson,
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
