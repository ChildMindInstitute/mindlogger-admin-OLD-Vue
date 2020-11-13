<template>
  <v-dialog max-width="800" :value="value" @input="$emit('input', $event)">
    <v-card>
      <v-card-text>
        <template>
          <h3>{{ $t('dataRetentionSettings') }}</h3>

          <div class="input-controls">
            <span> {{ $t('userDataStoredFor') }} </span>
            <div class="input-number">
              <v-text-field
                type="number"
                v-model="settings"
              />
            </div>
          </div>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text @click="onClickClose()">
          {{ $t('close') }}
        </v-btn>
        <v-btn color="primary" text @click="onClickSubmitSettings()">
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
  },
  data: () => ({
    settings: 5,
  }),
  methods: {
    onClickClose() {
      this.$emit('settings-close');
    },
    onClickSubmitSettings() {
      this.$emit('set-settings', this.settings.data);
    },
  },
};
</script>

<style lang="scss" scoped>
  .input-controls {
    display: flex;
    align-items: center;
    
    .input-number {
      margin-left: 15px;
      width: 100px;
    }
  }
</style>
