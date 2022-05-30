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
        {{ $t('selectEntryType') }}
      </div>

      <v-card-text>
        <v-btn
          class="ma-2 entry-type-btn"
          disabled
          @click="$emit('selectEntryType', 'self_report')"
        >
          {{ $t('selfReportText') }}
        </v-btn>

        <v-btn
          class="ma-2 entry-type-btn"
          @click="$emit('selectEntryType', 'one_time_report')"
        >
          {{ $t('oneTimeReportText') }}
        </v-btn>

        <v-btn
          class="ma-2 entry-type-btn"
          @click="$emit('selectEntryType', 'user_report')"
        >
          {{ $t('linkedUserText') }}
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

  .entry-type-btn {
    width: 100%;
    text-transform: none;
    text-align: left;
    margin: 5px 0px;
  }
</style>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },
    caseId: {
      type: String,
      required: true
    }
  }
}
</script>
