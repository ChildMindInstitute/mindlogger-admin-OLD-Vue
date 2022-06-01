<template>
  <v-dialog
    max-width="800"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title class="headline">
        {{ title }}
      </v-card-title>

      <v-card-text>
        {{ dialogText }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          color="primary darken-1"
          text
          @click="onOK"
        >
          {{ $t('okay') }}
        </v-btn>

        <v-btn
          color="primary darken-1"
          text
          @click="onCancel"
        >
          {{ $t('cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
    export default {
        name: 'ConfirmationDialog',
        props: {
            value: {
                type: Boolean,
                required: true
            },
            dialogText: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
        },
        data: () => ({
            
        }),
        methods: {
          onOK() {
            this.$emit('onOK');
            this.$emit('input', false);
          },
          onCancel() {
            this.$emit('input', false);
          },
        }
    }
</script>
