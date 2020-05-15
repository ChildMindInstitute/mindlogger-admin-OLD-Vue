<template>
  <div>
    <h1>Create Invitation</h1>
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
        v-model="params.profile.firstName"
        label="FirstName"
        required
      />

      <v-text-field
        v-if="!useDefaultProfile"
        v-model="params.profile.lastName"
        label="LastName"
        required
      />

      <v-text-field
        v-if="!useDefaultProfile"
        v-model="params.profile.email"
        :rules="emailRules"
        label="email"
        required
      />

      <v-select
        v-model="params.role"
        :items="roles"
        :rules="[v => !!v || 'Item is required']"
        label="Role"
        required
      />
      <v-btn
        :disabled="!valid"
        color="primary"
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
  name: "CreateInvitationForm",
  data() {
    return {
      valid: true,
      emailRules: [v => /.+@.+/.test(v) || "Invalid Email address"],
      useDefaultProfile: true,
      roles: ["user", "coordinator", "editor", "manager", "reviewer"],
      params: {
        role: "user",
        profile: {
          firstName: "",
          lastName: "",
          email: "",
          mrn: "",
        }
      }
    };
  },
  methods: {
    submit() {
      const invitationOptions = {};
      if (this.params.role) {
        invitationOptions.role = this.params.role;
      }
      if (!this.useDefaultProfile) {
        if (
          this.params.profile.email &&
          this.params.profile.email.trim() !== ""
        ) {
          invitationOptions.email = this.params.profile.email;
        }
        if (
          this.params.profile.firstName &&
          this.params.profile.firstName.trim() !== ""
        ) {
          invitationOptions.firstName = this.params.profile.firstName;
        }
        if (
          this.params.profile.lastName &&
          this.params.profile.lastName.trim() !== ""
        ) {
          invitationOptions.lastName = this.params.profile.lastName;
        }
        if (
          this.params.profile.mrn &&
          this.params.profile.mrn.trim() !== ""
        ) {
          invitationOptions.MRN = this.params.profile.mrn;
        }
      }

      this.$emit("createInvitation", invitationOptions);
    },

    // eslint-disable-next-line
    reset() {
      this.useDefaultProfile = true;
      this.params = {
        role: "user",
        profile: {
          displayName: "",
          email: ""
        }
      };
    }
  }
};
</script>

<style scoped>
.v-btn {
  margin: 6px 8px;
}
</style>
