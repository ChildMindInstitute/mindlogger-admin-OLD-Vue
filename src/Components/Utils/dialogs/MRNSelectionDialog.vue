<template>
  <v-dialog
    :value="value"
    max-width="500px"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title class="edit-card-title">
        {{ name }} ({{ email }})
      </v-card-title>

      <v-card-text>
        <v-expansion-panels
          v-model="panel"
          focusable
        >
          <v-expansion-panel>
            <v-expansion-panel-header>
              {{ profile.appletName }}
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <div class="content-title">
                Reviewing Data for:
              </div>
              <UserSelection
                v-model="userList"
                :appletId="profile.appletId"
                hint="$t('addRemoveReviewer')"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          text
          @click="onClose"
        >
          {{ $t('close') }}
        </v-btn>
        <v-btn
          color="primary"
          text
          @click="onSave"
        >
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
  .reviewer-button {
    cursor: pointer;
    border: 1px solid white;
    border-radius: 10%;
  }

  .content-title {
    margin: 10px 0px;
  }
</style>

<script>
  import UserSelection from "../../Users/UserSelection";

  export default {
    name: 'EditRoleDialog',
    components: {
      UserSelection
    },
    props: {
      profile: {
        type: Object,
        required: true
      },
      value: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        users: {},
        name: this.profile['firstName'],
        email: this.profile['email'],
        panel: 0,
        userList: this.profile['userList'],
      }
    },
    methods: {
      onSave() {
        this.$emit('onSaveMRNList', { MRNs: this.userList });
      },

      onClose() {
        this.$emit('onCloseMRNDialog');
      },
    }
  }
</script>
