<template>
  <div>
    <v-card class="elevation-12">
      <v-toolbar
        color="primary"
        dark
        flat
      >
        <v-toolbar-title>{{ $t("login") }} </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p>
          {{ $t("logIntoAccount") }}
        </p>
        <v-form
          ref="form"
          lazy-validation
        >
          <v-text-field
            v-model="email"
            :rules="emailRules"
            :label="$t('login')"
            prepend-icon="mdi-account"
          />

          <v-text-field
            v-model="password"
            :rules="passwordRules"
            :label="$t('password')"
            type="password"
            prepend-icon="lock"
          />
        </v-form>

        <div
          v-if="error"
          class="error"
        >
          {{ error }}
        </div>
        <p
          class="ml-32 text-underline"
          @click="onForgotPassword"
        >
          {{ $t("forgotPassword") }}?
        </p>

        <v-row align="center">
          <v-col cols="auto">
            <v-btn
              color="primary"
              @click="login"
            >
              {{ $t("login") }}
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              outlined
              color="primary"
              @click="onCreateAccount"
            >
              {{ $t("createAccount") }}
            </v-btn>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="currentLanguage"
              :items="languages"
              :label="$t('selectLanguage')"
              item-text="label"
              item-value="value"
              hide-details
              single-line
              outlined
              dense
              @change="onLanguageChange"
            />
          </v-col>
        </v-row>
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

/* .v-select__selections input {
  width: 0;
} */
</style>

<script>
import api from "../Utils/api/api.vue";
import _ from "lodash";
import { AccountMixin } from '../Utils/mixins/AccountMixin';

export default {
  mixins: [AccountMixin],
  data() {
    return {
      valid: true,
      email: "",
      emailRules: [
        (v) => !!v || this.$i18n.t("emailRequired"),
        (v) => /.+@.+\..+/.test(v) || this.$i18n.t("emailMustBeValid"),
      ],
      password: "",
      passwordRules: [(v) => !!v || this.$i18n.t("passwordRequired")],
      error: "",
      // languages: [
      //   {
      //     label: this.$i18n.t('en'),
      //     value: "en_US",
      //   },
      //   {
      //     label: this.$i18n.t('fr'),
      //     value: "fr_FR",
      //   },
      // ],
      currentLanguage: "en_US",
    }
  },

  computed: {
    apiHost() {
      return this.$store.state.backend;
    },
    languages() {
      return [
        {
          label: this.$i18n.t('en'),
          value: "en_US",
        },
        {
          label: this.$i18n.t('fr'),
          value: "fr_FR",
        },
      ]
    }
  },

  created() {
    this.currentLanguage = this.$route.query.lang || this.$store.state.currentLanguage;
  },

  methods: {
    onLanguageChange() {
      this.$i18n.locale = this.currentLanguage;
      this.$store.commit("setCurrentLanguage", this.currentLanguage);
      this.$router.replace({ query: { lang: this.currentLanguage }})
    },
    login() {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.error = "";
      api
        .signIn({
          apiHost: this.$store.state.backend,
          user: this.email,
          password: this.password,
        })
        .then((resp) => {
          this.setAuth({ auth: resp.data, email: this.email });
          this.onLoginSuccess();
          this.analytics.track('Login Successful');
          this.analytics.login(resp.data.user._id);
        })
        .catch((e) => {
          this.error = e.response.data.message;
        });
    },
    onCreateAccount() {
      this.$emit("createAccount", null);
    },
    onSetBackend() {
      this.$emit("setBackend", null);
    },
    onForgotPassword() {
      this.$emit("forgotPassword", null);
    },
    onLoginSuccess() {
      this.$emit("loginSuccess");
    }
  },
};
</script>

<style lang="scss" scoped>
.ml-32 {
  margin-left: 32px;
}
.text-underline {
  text-decoration: underline;
  user-select: none;
  cursor: pointer;
}
</style>
