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
        {{ $t('selectLinkedUser') }}
      </div>

      <v-card-text>
        <v-list class="user-list">
          <v-list-item-group
            v-model="selectedUser"
          >
            <v-list-item
              v-for="user in availableUsers"
              :key="user._id"
              class="user-item"
            >
              <v-list-item-content>
                {{ user.MRN }}
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          color="primary"
          :disabled="selectedUser < 0"
          @click="onSubmit"
        >
          Submit
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

  .user-list {
    outline: 2px solid gray;
    height: 200px;
    overflow-y: scroll;
    padding-top: 0px;
    padding-bottom: 0px;
  }

  .user-item {
    border-bottom: 1px solid gray;
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
    },

    users: {
      type: Array,
      required: true
    },

    applet: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      selectedUser: -1,
    }
  },

  computed: {
    availableUsers () {
      return this.users.filter(user => user.applets.find(obj => obj.appletId == this.applet.id))
    }
  },

  methods: {
    onSubmit () {
      this.$emit('selectLinkedUser', this.availableUsers[this.selectedUser])
    }
  }
}
</script>
