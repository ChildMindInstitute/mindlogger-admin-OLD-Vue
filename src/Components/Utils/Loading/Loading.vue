<template>
  <v-container fluid>
      <v-layout align-center justify-space-between column fill-height>
        <h1>
          Loading Your Applets
        </h1>
        <p class="text-center">
          An applet is a collection of
          <a href="https://github.com/ReproNim/schema-standardization">reusable surveys</a>
          along with
          study-specific settings, like your users and schedule.
        </p>
        <v-progress-circular
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'Loading',
}
</script>
