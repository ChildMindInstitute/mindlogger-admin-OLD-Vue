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
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>delete</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Reset Builder</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <ActivitySetBuilder />
    </v-content>
  </div>
</template>

<script>
import Components from 'activity-set-builder';

export default {
  name: 'Builder',
  components: {
    ...Components
  },
  data () {
    return {
      drawer: false,
    };
  },
  methods: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    }
  }
}
</script>
