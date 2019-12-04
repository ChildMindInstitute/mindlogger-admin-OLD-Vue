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
      <v-checkbox
        v-model="useDefaultProfile"
        label="Let users pick their own displayName and email"
      />

      <v-text-field
        v-model="invitationBody.profile.displayName"
        label="displayName"
        required
      />

      <v-text-field
        v-model="invitationBody.profile.email"
        :rules="emailRules"
        label="email"
        required
      />

      <v-select
        v-model="invitationBody.role"
        :items="roles"
        :rules="[v => !!v || 'Item is required']"
        label="Role"
        required
      />

      <v-btn
        :disabled="!valid"
        color="success"
        @click="submit"
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
      emailRules: [ v => /.+@.+/.test(v) || 'Invalid Email address' ],
      useDefaultProfile: true,
      roles: ['user', 'coordinator', 'editor', 'manager', 'reviewer'],
      invitationBody: {
        role: '',
        profile: {
          displayName: '',
          email: '',
        },
      }
    };
  },
  methods: {
    submit() {
      this.$emit('createInvitation', this.invitationBody);
    },
    reset() {
      this.useDefaultProfile = true;
      this.this.invitationBody = {
        role: 'user',
        profile: {
          displayName: '',
          email: '',
        }
      }
    }
  }
}
</script>
