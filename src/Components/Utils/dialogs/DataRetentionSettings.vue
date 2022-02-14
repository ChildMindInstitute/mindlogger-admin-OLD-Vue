<template>
  <v-dialog
    max-width="800"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-text>
        <template>
          <h3>{{ $t('dataRetentionSettings') }}</h3>

          <div class="input-controls">
            <span> {{ $t('userDataStoredFor') }} </span>
            <v-text-field
              v-if="settings.retention != 'indefinitely'"
              v-model="settings.period"
              class="input-amount"
              type="number"
              :min="1"
            />
            <v-select
              v-model="settings.retention"
              class="input-period"
              :items="periods"
              item-text="name"
              item-value="value"
            />
          </div>

          <div
            v-if="error"
            class="error mb-4"
          >
            {{ error }}
          </div>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          text
          @click="onClickClose()"
        >
          {{ $t('close') }}
        </v-btn>
        <v-btn
          color="primary"
          text
          :disabled="settings.period <= 0 && settings.retention != 'indefinitely'"
          @click="onClickSubmitSettings()"
        >
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'DataRetentionSettings',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    retentionSettings: {
      type: Object,
      required: true,
    },
    error: {
      type: String,
      required: false,
      default: '',
    }
  },
  data: function() {
    return {
      periods: [{
        name: this.$i18n.t('days'),
        value: 'day'
      }, {
        name: this.$i18n.t('weeks'),
        value: 'week'
      }, {
        name: this.$i18n.t('months'),
        value: 'month'
      }, {
        name: this.$i18n.t('years'),
        value: 'year'
      }, {
        name: this.$i18n.t('indefinitely'),
        value: 'indefinitely'
      }],
    }
  },
  computed: {
    settings() {
      return this.retentionSettings;
    }
  },
  methods: {
    onClickClose() {
      this.$emit('settings-close');
    },
    onClickSubmitSettings() {
      this.$emit('set-settings', this.settings);
    },
  },
};
</script>

<style lang="scss" scoped>
  .input-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 80%;

    span {
      flex: 2;
    }

    .input-amount {
      flex: 1;
    }

    .input-period {
      flex: 1;
      margin-left: 20px;
    }
  }
</style>
