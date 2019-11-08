<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-text-field
      v-model="maxResponseLength"
      label="Maximum response length"
      type="number"
      @change="update"
    />
    <v-switch
      v-model="isResponseRequired"
      label="Response required"
      @change="update"
    />
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