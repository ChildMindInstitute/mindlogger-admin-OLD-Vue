<template>
  <div>
    <h1>Create Invitation</h1>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-container>
        <v-row>
          <v-col 
            cols="12" 
            sm="6" 
            md="6"
          >
            <v-text-field
              v-model="params.profile.firstName"
              label="FirstName"
              required
            />
          </v-col>

          <v-col 
            cols="12" 
            sm="6" 
            md="6"
          >
            <v-text-field
              v-model="params.profile.lastName"
              label="LastName"
              required
            />
          </v-col>

          <v-col 
            cols="12" 
            sm="6" 
            md="4"
          >
            <v-text-field
              v-model="params.profile.email"
              :rules="emailRules"
              label="email"
              required
            />
          </v-col>

          <v-col 
            cols="12" 
            sm="6" 
            md="4"
          >
            <v-text-field
              v-model="params.profile.mrn"
              label="MRN"
            />
          </v-col>

          <v-col 
            cols="12" 
            sm="6" 
            md="4"
          >
            <v-select
              v-model="params.role"
              :items="roles"
              :rules="[v => !!v || 'Item is required']"
              label="Role"
              required
            />
          </v-col>
        </v-row>
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
      </v-container>
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

      this.$emit("createInvitation", invitationOptions);
    },

    // eslint-disable-next-line
    reset() {
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
