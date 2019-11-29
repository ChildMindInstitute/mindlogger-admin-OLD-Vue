<template>
  <div>
    <h1>
      Create Invitation
    </h1>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-text-field
        v-model="name"
        :counter="10"
        :rules="nameRules"
        label="Name"
        required
      />

      <v-text-field
        v-model="email"
        :rules="emailRules"
        label="E-mail"
        required
      />

      <v-select
        v-model="select"
        :items="roles"
        :rules="[v => !!v || 'Item is required']"
        label="Role"
        required
      />

      <v-btn
        :disabled="!valid"
        color="success"
        @click="validate"
      >
        Submit
      </v-btn>

      <v-btn
        color="error"
        @click="reset"
      >
        Reset Form
      </v-btn>
    </v-form>
  </div>
</template>

<script>
export default {
  name: 'CreateInvitationForm',
  data() {
    return {
      roles: ['user', 'coordinator', 'editor', 'manager', 'reviewer'],
      invitationBody: {
        role: '',
        idCode: '',
        profile: {},
      }
    };
  },
  methods: {
    createInvitation() {
      this.$emit('createInvitation', this.invitationBody);
    }
  }
}
</script>
