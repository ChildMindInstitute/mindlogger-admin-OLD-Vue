<template>
  <div>
    <v-card class="elevation-12">
      <v-toolbar
        color="primary"
        dark
        flat
      >
        <v-toolbar-title> {{ $t("createAccount") }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p>
          {{ $t("createNewAccount") }} {{ $store.state.backend }}
          <v-btn
            icon
            style="margin: 0px;"
            @click="onSetBackend"
          >
            <v-icon
              small
              color="primary"
            >
              edit
            </v-icon>
          </v-btn>
        </p>
        <v-form
          ref="form"
          lazy-validation
        >
          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="Email"
            prepend-icon="mdi-account-box-outline"
          />

          <v-text-field
            v-model="firstName"
            :rules="firstNameRules"
            :label="$t('firstName')"
            prepend-icon="mdi-account"
          />

          <v-text-field
            v-model="lastName"
            :rules="lastNameRules"
            :label="$t('lastName')"
            prepend-icon="mdi-account-outline"
          />

          <v-text-field
            v-model="password"
            :rules="passwordRules"
            :label="$t('password')"
            type="password"
            prepend-icon="lock"
          />
          <div
            v-if="error"
            class="error"
          >
            {{ error }}
          </div>

          <v-btn
            outlined
            color="primary"
            @click="onLogin"
          >
            {{ $t("login") }}
          </v-btn>
          <v-btn
            color="primary"
            @click="createAccount"
          >
            {{ $t("createAccount") }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.error {
  color: "red";
}

.v-btn {
  margin: 6px 8px;
}
</style>

<script>
import api from "../Utils/api/api.vue";
import _ from "lodash";

export default {
  data() {
    return {
      email: "",
      emailRules: [
        (v) => !!v || this.$i18n.t("emailRequired"),
        (v) => /.+@.+\..+/.test(v) || this.$i18n.t("emailMustBeValid"),
      ],
      firstName: "",
      firstNameRules: [(v) => !!v || this.$i18n.t("firstNameRequired")],
      lastName: "",
      lastNameRules: [(v) => !!v || this.$i18n.t("lastNameRequired")],
      password: "",
      passwordRules: [(v) => !!v || this.$i18n.t("passwordRequired")],
      error: "",
    }
  },

  computed: {
    apiHost() {
      return this.$store.state.backend;
    },
  },

  methods: {
    createAccount() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.error = "";

      api
        .signUp({
          apiHost: this.apiHost,
          body: {
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            password: this.password,
          },
        })
        .then((resp) => {
          const auth = {
            ...resp.data,
            user: {
              displayName: resp.data.displayName,
            },
          };

          this.$store.commit("setAuth", { auth, email: this.email });
          this.setAccounts();
        })
        .catch((e) => {
          this.error = e.response.data.message;
        });
    },
    setAccounts() {
      api
        .getAccounts({
          apiHost: this.apiHost,
          token: this.$store.state.auth.authToken.token,
        })
        .then((resp) => {
          this.$store.commit("setAccounts", resp.data);
          this.$router.push("/dashboard").catch(err => {});
        })
        .catch((err) => {
          console.warn(err);
        });
    },
    onLogin() {
      this.$emit("login", null);
    },
    onSetBackend() {
      this.$emit("setBackend", null);
    },
  },
};
</script>
