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
          label="Enter Applet URL"
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
  }),
  methods: {
    onClickSubmit() {
      this.$emit('set-value', this.appletUrl);
    },
  },
};
</script>
