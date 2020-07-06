<template>
  <div>
    <h1>Create Invitation</h1>
    <v-form
      ref="form"
      v-model="valid"
      :lazy-validation="lazy"
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
              :rules="firstNameRules"
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
              :rules="lastNameRules"
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
              label="Email"
              required
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

          <v-col 
            v-if="params.role === 'user'"
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
            v-else
            cols="12" 
            sm="6" 
            md="4"
          >
            <v-text-field
              v-model="params.accountName"
              label="AccountName"
              :rules="accountNameRules"
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
      lazy: false,
      valid: true,
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      firstNameRules: [
        v => !!v || 'Name is required',
      ],
      lastNameRules: [
        v => !!v || 'Name is required',
      ],
      accountNameRules: [
        v => !!v || 'Name is required',
      ],
      roles: ["user", "coordinator", "editor", "manager", "reviewer"],
      params: {
        role: "user",
        profile: {
          firstName: "",
          lastName: "",
          email: "",
          mrn: "",
        },
        accountName: "",
      }
    };
  },
  methods: {
    submit() {
      const invitationOptions = {
        firstName: this.params.profile.firstName,
        lastName: this.params.profile.lastName,
        email: this.params.profile.email,
        role: this.params.role
      };
      
      if (this.params.role === "user") {
        invitationOptions.MRN = this.params.profile.mrn;
      } else {
        invitationOptions.accountName = this.params.accountName;
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
