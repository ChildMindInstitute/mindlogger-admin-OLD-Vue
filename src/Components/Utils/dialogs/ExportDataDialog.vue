<template>
  <v-dialog
    :value="value"
    max-width="500px"
    @input="$emit('input', $event)"
  >
    <v-card
      class="pa-4"
    >
      <div class="title">
        {{ $t('exportUserData') }}
      </div>

      <div class="sub-title">
        {{ $t('selectAppletToExportData') }}
      </div>

      <v-card-text>
        <v-btn
          v-for="profile in profileList"
          :key="profile.appletId"
          class="view-btn"
          @click="onExportData(profile)"
        >
          <div class="btn-label">
            {{ profile.identifier }}
          </div>
        </v-btn>
      </v-card-text>
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

  .btn-label {
    width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .title, .sub-title {
    text-align: center;
  }
  .sub-title {
    font-size: smaller;
  }
</style>

<script>
  export default {
    name: 'ViewDataDialog',
    props: {
      user: {
        type: Object,
        required: true,
      },
      value: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        profileList: [],
        dialog: false,
      }
    },
    computed: {
      currentAccount() {
        return this.$store.state.currentAccount;
      }
    },
    beforeMount() {
      this.profileList = [];
      for (let appletId in this.user) {
        const applet = this.currentAccount.applets.find(applet => applet.id === appletId);
        const profile = this.user[appletId];
        const MRN = profile.MRN || null;

        this.profileList.push({
          ...profile,
          appletId,
          MRN,
          identifier: `${applet.name} (${MRN ? this.$i18n.t('secretUserId') + ': ' + MRN : 'email: ' + profile.email})`
        });
      }
    },
    methods: {
      onExportData(profile) {
        this.$emit('onExportData', {
          appletId: profile.appletId,
          profile: this.user[profile.appletId],
          viewing: false
        });
      }
    }
  }
</script>
