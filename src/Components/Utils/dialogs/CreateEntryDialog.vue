<template>
  <v-dialog
    max-width="600"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card
      class="pa-4"
    >
      <div class="title">
        {{ $t('newEntryTitle', { name: caseId }) }}
      </div>

      <div class="sub-title">
        {{ $t('selectAppletForNewEntry') }}
      </div>

      <v-card-text>
        <v-btn
          v-for="applet in caseApplets"
          :key="applet.id"
          class="ma-2 applet-btn"
          :disabled="!applet.userCount"
          @click="$emit('selectApplet', applet)"
        >
          {{ applet.displayName }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
  .title, .sub-title {
    text-align: center;
  }
  .sub-title {
    font-size: smaller;
  }

  .applet-btn {
    width: 100%;
    text-transform: none;
    text-align: left;
    margin: 5px 0px;
  }
  .applet-btn /deep/ .v-btn__content {
    width: 100%;
    white-space: break-spaces;
    text-align: center;
  }
</style>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },

    caseApplets: {
      type: Array,
      required: true
    },

    caseId: {
      type: String,
      required: true
    }
  },
}
</script>
