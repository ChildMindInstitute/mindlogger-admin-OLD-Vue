<template>
  <v-btn
    color="primary"
    @click="createInvitation"
  >
    Create new invitation
  </v-btn>
</template>

<script>
export default {
  name: 'CreateInvitationButton',
  methods: {
    createInvitation() {
      this.$emit('createInvitation', null);
    }
  }
}
</script>
