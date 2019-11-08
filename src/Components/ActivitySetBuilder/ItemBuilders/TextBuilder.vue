<template>
  <v-form
    v-model="valid"
    ref="form"
  >
    <v-text-field
      label="Maximum response length"
      v-model="maxResponseLength"
      type="number"
      v-on:change="update"
    />
    <v-switch
      v-model="isResponseRequired"
      label="Response required"
      v-on:change="update"
    ></v-switch>
  </v-form>
</template>

<script>
export default {
  data: () => ({
    maxResponseLength: 50,
    isResponseRequired: false,
    type: 'xsd:string',
    valid: true,
    textRules: [
      v => !!v || 'Radio options cannot be empty',
    ],
  }),
  methods: {
    update () {
      const responseOptions = {
        'requiredValue': this.isResponseRequired,
        'type': this.type,
        'maxLength': this.maxResponseLength
      };
      this.$emit('update', responseOptions);
    },
  }
}
</script>