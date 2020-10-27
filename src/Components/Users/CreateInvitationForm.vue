<template>
  <div>
    <h1>{{ $t("createInvitation") }}</h1>
    <v-form ref="form" v-model="valid" :lazy-validation="lazy">
      <v-container>
        <v-row>
          <v-col cols="12" sm="6" md="6">
            <v-text-field
              v-model="params.profile.firstName"
              label="FirstName"
              :rules="firstNameRules"
              required
            />
          </v-col>

          <v-col cols="12" sm="6" md="6">
            <v-text-field
              v-model="params.profile.lastName"
              label="LastName"
              :rules="lastNameRules"
              required
            />
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="params.profile.email"
              :rules="emailRules"
              :label="$t('email')"
              required
            />
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="params.role"
              :items="invitationRoles"
              :rules="[(v) => !!v || 'Item is required']"
              :label="$t('role')"
              required
            />
          </v-col>

          <v-col v-if="params.role === 'user'" cols="12" sm="6" md="4">
            <v-text-field
              v-model="params.profile.mrn"
              :label="$t('createInvitation')"
            />
          </v-col>
          <v-col v-else cols="12" sm="6" md="4">
            <v-text-field
              v-if="
                username === currentAccountName && appletRoles.includes('owner')
              "
              v-model="params.accountName"
              label="AccountName"
              :rules="accountNameRules"
              required
            />
          </v-col>
          <v-col v-if="params.role === 'reviewer'" cols="12" sm="12" md="12">
            <v-combobox
              v-model="params.users"
              hint="Press enter to add a user"
              label="Users"
              :rules="usersRules"
              multiple
              small-chips
              required
            />
          </v-col>
        </v-row>
        <v-btn :disabled="!valid" color="primary" @click="submit">
          {{ $t("submit") }}
        </v-btn>
        <v-btn color="error" @click="reset">
          {{ $t("resetForm") }}
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
        (v) => !!v || $t("emailRequired"),
        (v) =>
          /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(v) ||
          $t("emailMustBeValid"),
      ],
      firstNameRules: [(v) => !!v || $t("firstNameRequired")],
      lastNameRules: [(v) => !!v || $t("lastNameRequired")],
      accountNameRules: [(v) => !!v || $t("nameRequired")],
      usersRules: [(v) => !!v || $t("usersRequired")],
      params: {
        role: "user",
        profile: {
          firstName: "",
          lastName: "",
          email: "",
          mrn: ""
        },
        accountName: "",

        users: []
      },
      languages: [
        {
          label: "English",
          value: "en"
        },
        {
          label: "French",
          value: "fr"
        }
      ],
      currentLanguage: "en"
    };
  },
  computed: {
    currentAccountName() {
      return this.$store.state.ownerAccount.accountName;
    },
    username() {
      return this.$store.state.auth.user.displayName;
    },
    appletRoles() {
      return this.$store.state.currentApplet.roles;
    },
    activeUserList() {
      return this.$store.state.users.active;
    },
    invitationRoles() {
      let roles = this.$store.state.currentApplet.roles;

      if (roles.includes("manager") || roles.includes("owner")) {
        return ["user", "coordinator", "editor", "manager", "reviewer"];
      } else if (roles.includes("coordinator")) {
        return ["user", "reviewer"];
      }

      return [];
    },
  },

  methods: {
    submit() {
      const invitationOptions = {
        firstName: this.params.profile.firstName,
        lastName: this.params.profile.lastName,
        email: this.params.profile.email,
        role: this.params.role,
        lang: this.currentLanguage
      };

      if (this.params.role === "user") {
        invitationOptions.MRN = this.params.profile.mrn;
      } else {
        invitationOptions.accountName = this.params.accountName;
      }
      if (this.params.role === "reviewer") {
        invitationOptions.users = [];
        let userIds = this.params.users;
        let activeUsers = this.activeUserList;
        let userData;
        let userId;

        for (let i = 0; i < userIds.length; i++) {
          userId = userIds[i];

          for (let j = 0; j < activeUsers.length; j++) {
            userData = activeUsers[j];

            if (userData.MRN === userId || userData._id === userId) {
              invitationOptions.users.push(userData._id);
            }
          }
        }
      }

      this.$emit("createInvitation", invitationOptions);
    },

    // eslint-disable-next-line
    reset() {
      this.params = {
        role: "user",
        profile: {
          displayName: "",
          email: "",
        },
      };
    },
  },
};
</script>

<style scoped>
.v-btn {
  margin: 6px 8px;
}
</style>
