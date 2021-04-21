<template>
  <v-container fluid>
    <v-layout
      align-center
      column
    >
      <h2 class="mb-2">
        {{ $t("editingApplets") }}
      </h2>

      <v-progress-circular
        color="primary"
        indeterminate
      />
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "About",
};
</script>
