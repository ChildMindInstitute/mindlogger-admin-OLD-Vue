<template>
  <v-dialog
    max-width="800"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title class="card-title">
        {{ defaultTitle || $t('appletPassword') }}
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="password.data"
          :label="$t('enterPassword')"
          :append-icon="password.value ? 'mdi-eye' : 'mdi-eye-off'"
          :type="password.value ? 'password' : 'text'"
          @click:append="() => (password.value = !password.value)"
          @input="defaultErrorMsg = ''"
        />

        <v-text-field
          v-if="hasConfirmPassword"
          v-model="confirmPassword.data"
          :label="$t('confirmPassword')"
          :append-icon="confirmPassword.value ? 'mdi-eye' : 'mdi-eye-off'"
          :type="confirmPassword.value ? 'password' : 'text'"
          @click:append="() => (confirmPassword.value = !confirmPassword.value)"
          @input="defaultErrorMsg = ''"
        />

        <div
          v-if="error || defaultErrorMsg"
          class="error mb-4"
        >
          {{ error || defaultErrorMsg }}
        </div>

        <v-btn
          color="primary"
          :disabled="!!error"
          @click="onClickSubmitPassword"
        >
          {{ $t('submit') }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.card-title {
  color: white;
  background: #1976d2;
}
</style>

<script>
export default {
  name: 'AppletPassword',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    hasConfirmPassword: {
      type: Boolean,
      required: false,
      default: true,
    },
    defaultTitle: {
      type: String,
      required: false,
      default: null
    }
  },
  data: () => ({
    password: {
      data: '',
      value: true,
    },
    confirmPassword: {
      data: '',
      value: true,
    },
    defaultErrorMsg: '',
  }),
  computed: {
    error() {
      return (
        this.errorPassword(this.password.data) ||
        (this.hasConfirmPassword &&
          this.errorConfirmPassword(this.confirmPassword.data))
      );
    },
  },
  methods: {
    errorPassword(value) {
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
      if (pattern.test(value)) {
        return false;
      }

      return this.$t('invalidAppletPasswordFormat');
    },
    errorConfirmPassword(value) {
      if (value == this.password.data) {
        return false;
      }

      return this.$t('passwordDontMatch');
    },
    onClickSubmitPassword() {
      this.$emit('set-password', this.password.data);
    },
  },
};
</script>
