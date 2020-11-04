<template>
  <v-dialog max-width="800" :value="value" @input="$emit('input', $event)">
    <v-card>
      <v-card-text>
        <h3>{{ $t('appletName') }}</h3>

        <v-text-field v-model="appletName" label="Enter Applet Name" />

        <v-btn color="primary" @click="onClickSubmit">
          {{ $t('submit') }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AppletName',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    appletName: '',
  }),
  methods: {
    onClickSubmit() {
      this.$emit('set-value', this.appletName);
    },
  },
};
</script>
