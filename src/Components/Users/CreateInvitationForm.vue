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
        v-if="!useDefaultProfile"
        v-model="invitationOptions.profile.displayName"
        label="displayName"
        required
      />

      <v-text-field
        v-if="!useDefaultProfile"
        v-model="invitationOptions.profile.email"
        :rules="emailRules"
        label="email"
        required
      />

      <v-select
        v-model="invitationOptions.role"
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
      invitationOptions: {
        role: 'user',
        profile: {
          displayName: '',
          email: '',
        },
      }
    };
  },
  methods: {
    submit() {
      const invitationOptions = {};
      if (this.invitationOptions.role) {
        invitationOptions.role = this.invitationOptions.role;
      }
      if (this.invitationOptions.profile.email && this.invitationOptions.profile.email.trim() !== '') {
        invitationOptions.profile.email = this.invitationOptions.profile.email;
      }
      if (this.invitationOptions.profile.displayName && this.invitationOptions.profile.displayName.trim() !== '') {
        invitationOptions.profile.displayName = this.invitationOptions.profile.displayName;
      }
      this.$emit('createInvitation', invitationOptions);
    },
    reset() {
      this.useDefaultProfile = true;
      this.this.invitationOptions = {
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
