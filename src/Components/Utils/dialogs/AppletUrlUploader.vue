<template>
  <v-dialog
    max-width="800"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-text>
        <h3>{{ $t('appletUrl') }}</h3>

        <v-text-field
          ref="url"
          v-model="appletUrl"
          :rules="[() => state]"
          :error-messages="errorMsg"
          label="Enter Applet URL"
          required
        />

        <v-btn
          color="primary"
          @click="onClickSubmit"
        >
          {{ $t('submit') }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AppletUrl',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    appletUrl: '',
    errorMsg: '',
    state: true,
  }),
  watch: {
    appletUrl () {
      this.checkAppletUrl();
    },
  },
  methods: {
    onClickSubmit() {
      const res = this.checkAppletUrl();
      if (this.appletUrl && this.state) {
        this.$emit('set-value', this.appletUrl);
      }
    },

    checkAppletUrl() {
      const gitHubPattern = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/;

      this.errorMsg = '';
      this.state = true;

      if (!this.appletUrl) {
        this.errorMsg = 'This field is required';
        this.$refs['url'].validate(true);
        this.state = false;
      } else if (!gitHubPattern.test(this.appletUrl)) {
        this.errorMsg = 'Invalid GitHub URL';
        this.$refs['url'].validate(true);
        this.state = false;
      }
    }
  },
};
</script>
