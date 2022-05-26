<template>
  <v-dialog
    :value="value"
    max-width="500px"
    @input="$emit('input', $event)"
  >
    <v-card class="pa-4">
      <v-card-text>
        <div class="alert-message">
          {{ $t('alertMessage', { userIdentifier }) }}
        </div>

        <div class="mt-4 alert-message">
          {{ alertMessage }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          class="view-btn"
          @click="$emit('view-data')"
        >
          {{ $t('takeToResponseData') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
  .view-btn {
    width: 100%;
    text-transform: none;
    text-align: left;
    margin: 5px 0px;
  }
  .view-btn /deep/ .v-btn__content {
    width: 100%;
    white-space: break-spaces;
    text-align: center;
  }

  .alert-message {
    text-align: center;
    color: black;

    font-weight: 500;
    font-size: 17.5px;
  }
</style>

<script>
  export default {
    name: 'ResponseAlertDialog',
    props: {
      value: {
        type: Boolean,
        required: true,
      },
      user: {
        type: Object,
        required: true,
      },
      alert: {
        type: Object,
        required: true,
      },
    },
    computed: {
      userIdentifier() {
        return this.user.MRN || this.user.email;
      },
      alertMessage() {
        return this.alert.alertMessage;
      }
    },
  }
</script>
