<template>
  <v-dialog
    :value="value"
    max-width="500px"
    @input="$emit('input', $event)"
  >
    <v-card class="pa-4">
      <div class="title">
        {{ $t('editApplet') }}
      </div>

      <div class="sub-title">
        {{ $t('selectAppletToEdit') }}
      </div>

      <v-card-text>
        <v-btn
          v-for="applet in applets"
          :key="applet.id"
          class="edit-btn"
          @click="onEditApplet(applet)"
        >
          {{ applet.name }}
        </v-btn>
      </v-card-text>
    </v-card>

    <ConfirmationDialog
      v-model="appletEditDialog"
      :dialogText="$t('appletEditAlert')"
      :title="$t('appletEdit')"
      @onOK="editApplet"
    />
  </v-dialog>
</template>

<style scoped>
  .edit-btn {
    width: 100%;
    text-transform: none;
    text-align: left;
    margin: 5px 0px;
  }
  .edit-btn /deep/ .v-btn__content {
    width: 100%;
    white-space: break-spaces;
    text-align: center;
  }
  .title, .sub-title {
    text-align: center;
  }
  .sub-title {
    font-size: smaller;
  }
</style>

<script>
  import api from "../api/api";
  import ConfirmationDialog from './ConfirmationDialog';

  export default {
    name: 'EditAppletDialog',
    components: {
      ConfirmationDialog,
    },
    props: {
      value: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        appletEditDialog: false,
        selectedApplet: null,
      }
    },
    computed: {
      applets() {
        if (!this.$store.state.currentAccount || !Array.isArray(this.$store.state.currentAccount.applets)) {
          return [];
        }

        return this.$store.state.currentAccount.applets.filter(
          applet => 
              applet.roles.includes('manager') || applet.roles.includes('editor')
        )
      }
    },
    methods: {
      onEditApplet(applet) {
        this.selectedApplet = applet;
        if (applet.hasUrl) {
          this.appletEditDialog = true;
        } else {
          this.editApplet();
        }
      },
      editApplet() {
        this.$store.commit('setCurrentApplet', this.selectedApplet);

        this.$router.push({
          name: 'Builder',
          params: {isEditing: true},
        }).catch(err => {
        });
      }
    }
  }
</script>
