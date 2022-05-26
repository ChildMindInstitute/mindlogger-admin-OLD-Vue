<template>
  <v-dialog
    max-width="800"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card class="pa-2">
      <div class="title">
        {{ isNewEntry ? 'New' : '' }} Entry for Case {{ currentCase.caseId }}
      </div>

      <div class="sub-title">
        {{ applet.displayName }}
      </div>

      <v-card-text>
        <div
          v-if="entry.entryType == 'one_time_report'"
        >
          <div>
            {{ $t('shareLinkForCaseAssessment') }}
          </div>
          <div
            class="mt-2"
          >
            {{ publicUrl }}
          </div>
        </div>

        <div
          v-else-if="entry.entryType == 'user_report'"
        >
          {{ $t('scheduleUpdated', { MRN: entry.responder }) }}
        </div>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn
          color="primary"
          @click="$emit('input', false)"
        >
          ok
        </v-btn>
      </v-card-actions>
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
</style>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },

    entry: {
      type: Object,
      required: true
    },

    isNewEntry: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    accountApplets () {
      return this.$store.state.currentAccount.applets;
    },

    currentCase () {
      return this.$store.state.currentCase || {};
    },

    applet () {
      const entryApplet = this.accountApplets.find(applet => applet.id == this.entry.appletId);

      return entryApplet || {};
    },

    publicUrl () {
      return `${process.env.VUE_APP_WEB_URI}/case/${this.currentCase._id}/applet/public/${this.entry._id}`
    }
  }
}
</script>
