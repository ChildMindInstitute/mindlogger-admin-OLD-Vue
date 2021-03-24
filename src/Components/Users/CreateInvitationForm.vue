<template>
  <div>
    <h1>{{ $t("createInvitation") }}</h1>
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
              :label="$t('firstName')"
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
              :label="$t('lastName')"
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
              :label="$t('email')"
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
              :items="invitationRoles"
              :rules="[(v) => !!v || 'Item is required']"
              item-text="title"
              item-value="name"
              :label="$t('role')"
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
              key="secret-id-input"
              v-model="params.profile.mrn"
              :label="$t('secretUserId')"
              :rules="secretUserIdRules"
              required
            />
          </v-col>
          <v-col
            v-else
            cols="12"
            sm="6"
            md="4"
          >
            <v-text-field
              key="account-name-input"
              v-if="
                username === currentAccountName && appletRoles.includes('owner')
              "
              v-model="params.accountName"
              label="AccountName"
              :rules="accountNameRules"
              required
            />
          </v-col>
          <v-col
            v-if="params.role === 'reviewer'"
            cols="12"
            sm="12"
            md="12"
          >
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

        <v-row align="center">
          <v-col cols="auto">
            <v-select
              v-model="currentLanguage"
              :items="languages"
              label="Choose Language"
              item-text="label"
              item-value="value"
              hide-details
              single-line
              outlined
              dense
            />
          </v-col>
          <v-col cols="auto">
            <v-btn
              :disabled="!valid"
              color="primary"
              @click="submit"
            >
              {{ $t("submit") }}
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="error"
              @click="reset"
            >
              {{ $t("resetForm") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import { RolesMixin } from '../Utils/mixins/RolesMixin';

export default {
  name: "CreateInvitationForm",
  mixins: [RolesMixin],
  data() {
    return {
      lazy: false,
      valid: true,
      emailRules: [
        (v) => !!v || this.$i18n.t("emailRequired"),
        (v) =>
          /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(v) ||
          this.$i18n.t("emailMustBeValid"),
      ],
      firstNameRules: [
        (v) => !!v || this.$i18n.t("firstNameRequired")
      ],
      lastNameRules: [
        (v) => !!v || this.$i18n.t("lastNameRequired")
      ],
      accountNameRules: [
        (v) => !!v || this.$i18n.t("accountNameRequired")
      ],
      usersRules: [
        (v) => !!v || this.$i18n.t("usersRequired")
      ],
      secretUserIdRules: [
        (v) => !!v || this.$i18n.t("secretUserIdRequired")
      ],
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
          label: this.$i18n.t('en'),
          value: "en"
        },
        {
          label: this.$i18n.t('fr'),
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
      return this.$store.state.currentAppletMeta.roles;
    },
    activeUserList() {
      return this.$store.state.users.active;
    },
    invitationRoles() {
      let roles = this.$store.state.currentAppletMeta.roles;

      if (roles.includes("manager") || roles.includes("owner")) {
        // return [this.$t("user"), this.$t("coordinator"), this.$t("editor"), this.$t("manager"), this.$t("reviewer")];
        return this.localizedRoles;
      } else if (roles.includes("coordinator")) {
        // return [this.$t("user"), this.$t("reviewer")];
        return this.localizedRoles.filter(role => {
          return role.name === 'user' || role.name === 'reviewer';
        })
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
        invitationOptions.accountName = this.params.accountName || this.currentAccountName;
      }
      if (this.params.role === "reviewer") {
        invitationOptions.users = this.params.users;
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
