<template>
  <v-dialog
    :value="value"
    max-width="500px"
    @input="$emit('input', $event)"
  >
    <v-card class="pa-4">
      <v-card-title class="text-center">
        {{ $t("editUserData") }}
      </v-card-title>

      <v-form
        ref="form"
        v-model="valid"
      >
        <v-card-text>
          <v-text-field
            v-model="params.nickName"
            :label="$t('nickName')"
          />

          <v-text-field
            key="secret-id-input"
            v-model="params.MRN"
            :label="$t('secretUserId')"
            :rules="secretUserIdRules"
            required
          />
        </v-card-text>
      </v-form>

      <v-card-actions>
        <v-spacer />

        <v-btn
          color="primary"
          text
          @click="$emit('input', false)"
        >
          {{ $t("close") }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!valid"
          text
          @click="updateProfile"
        >
          {{ $t("save") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.text-center {
  text-align: center;
}
</style>

<script>
import api from "../api/api";
import { AppletMixin } from "../mixins/AppletMixin";

export default {
  mixins: [AppletMixin],

  props: {
    user: {
      type: Object,
      required: true,
    },
    value: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      valid: true,
      secretUserIdRules: [(v) => !!v || this.$i18n.t("secretUserIdRequired")],
      params: {
        MRN: this.user.MRN,
        nickName: this.user.nickName,
        userId: this.user._id,
      },
    };
  },

  methods: {
    updateProfile() {
      api
        .updateProfile({
          apiHost: this.apiHost,
          token: this.token,
          appletId: this.currentAppletMeta.id,
          options: this.params,
        })
        .then(() => {
          this.$emit("updated");
        });
    },
  },
};
</script>
