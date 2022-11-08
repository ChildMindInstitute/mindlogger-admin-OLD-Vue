<template>
  <v-container fluid>
    <v-layout
      align-center
      column
    >
      <h2 
        class="mb-2" 
        :class="error && 'text-error'"
      >
        {{ text ? text : $t("editingApplets") }}
      </h2>

      <v-progress-circular
        :color="error ? 'red' : 'primary'"
        indeterminate
      />
    </v-layout>
  </v-container>
</template>

<style scoped>
.text-error {
  color: red;
}
</style>

<script>
export default {
  name: "About",
  props: {
    text: {
      type: String,
      required: false,
      default: ''
    },
    error: {
      type: Boolean,
      required: false,
      default: false
    }
  },
};
</script>
