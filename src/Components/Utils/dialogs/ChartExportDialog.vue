<template>
  <v-dialog
    max-width="500"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-text>
        <div class="text">
          Are you sure you want to download this report to PDF?
        </div>

        <div>
          <v-checkbox
            v-model="hasNotes"
            label="add notes"
          ></v-checkbox>
        </div>

        <MarkDownEditor
          v-if="hasNotes"
          v-model="markdown"
        />
      </v-card-text>

      <v-card-actions class="actions">
        <v-btn @click="$emit('export-chart', hasNotes ? markdown : '')">
          Yes
        </v-btn>

        <v-btn @click="$emit('input', false)">
          No
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.actions {
  justify-content: space-around;
}

.text {
  font-size: 18px;
  margin-bottom: 20px;
}
</style>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      markdown: '',
      hasNotes: false
    }
  }
}
</script>