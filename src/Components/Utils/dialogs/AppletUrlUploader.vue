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
          v-model="appletUrl"
          :rules="rules.appletUrl"
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
    rules: {
      appletUrl: [val => (val || '').length > 0 || 'This field is required'],
    }
  }),
  methods: {
    onClickSubmit() {
      if (this.appletUrl) {
        this.$emit('set-value', this.appletUrl);
      }
    },
  },
};
</script>
