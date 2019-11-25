<template>
  <v-btn
    @click="createInvitation"
    color="primary"
  >
    Create new invitation
  </v-btn>
</template>
<style>

</style>
<script>

export default {
  name: 'CreateInvitation',
  methods: {
    createInvitation() {
      this.$emit('createInvitation', null);
    }
  }
}
</script>
