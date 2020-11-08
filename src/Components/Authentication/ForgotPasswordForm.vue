<template>
  <div>
    <v-card class="elevation-12">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title>{{ $t("resetPassword") }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p>
          {{ $t("sendLinkPswdHosted") }}
          {{ $store.state.backend }}
        </p>
        <v-form ref="form" lazy-validation>
          <v-text-field v-model="email" :rules="emailRules" label="Email" />
          <div v-if="error" class="error">
            {{ error }}
          </div>

          <v-btn outlined color="primary" @click="onLogin">
            {{ $t("login") }}
          </v-btn>
          <v-btn color="primary" @click="createAccount">
            {{ $t("submit") }}
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
      error: "",
    }
  },
  computed: {
    currentLanguage() {
      return this.$store.state.currentLanguage;
    }
  },
  methods: {
    createAccount() {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.error = "";
      api
        .resetPassword({
          apiHost: this.$store.state.backend,
          body: {
            email: this.email,
            lang: this.currentLanguage.slice(0, 2)
          },
        })
        .then((resp) => {
          this.$emit("sendRequest", null);
        })
        .catch((e) => {
          this.error = e.response.data.message;
        });
    },
    onLogin() {
      this.$emit("login", null);
    },
  },
};
</script>
