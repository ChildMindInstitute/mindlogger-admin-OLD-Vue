<template>
  <v-dialog
    :value="value"
    max-width="600px"
    @input="$emit('input', $event)"
  >
    <v-card
      v-if="!selectedProfile"
      class="pa-4"
    >
      <div class="title">
        {{ $t('individualScheduleSetup') }}
      </div>

      <div class="sub-title">
        {{ $t('selectAppletForSchedule') }}
      </div>

      <v-card-text>
        <v-btn
          v-for="profile in profileList"
          :key="profile.appletId"
          class="view-btn"
          @click="onViewCalendar(profile)"
        >
          {{ profile.identifier }}
        </v-btn>
      </v-card-text>
    </v-card>
    <v-card v-else>
      <v-card-title class="alert-content">
        {{ $t('individualScheduleAlert', { MRN: selectedProfile.MRN || selectedProfile.firstName + ' '+ selectedProfile.lastName })}}
      </v-card-title>

      <v-card-actions class="d-flex justify-space-around">
        <v-btn @click="viewCalendar">
          {{ $t('Yes') }}
        </v-btn>
        <v-btn @click="onCancel">
          {{ $t('No') }}
        </v-btn>
      </v-card-actions>
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

  .title, .sub-title {
    text-align: center;
  }
  .sub-title {
    font-size: smaller;
  }

  .alert-content {
    word-break: break-word;
  }
</style>

<script>
  import api from "../api/api";

  export default {
    name: 'SchedulingDialog',
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
        selectedProfile: null,
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
        const profile = Object.values(this.user)[0];
        const applet = this.currentAccount.applets.find(applet => applet.id === appletId);
        let MRN = null;
        if (profile.MRN && !profile.MRN.match(/None \(.*\)/))
        {
          MRN = profile.MRN;
        }
        this.profileList.push({
          ...profile,
          appletId,
          MRN,
          identifier: `${applet.name} (${MRN ? 'MRN: ' + MRN : 'email: ' + profile.email})`,
        });
      }
      if (this.profileList.length === 1) {
        this.selectedProfile = this.profileList[0];
      }
    },
    methods: {
      onViewCalendar(profile) {
        this.selectedProfile = profile;
        if (profile.hasIndividualEvent) {
          this.viewCalendar();
        }
      },
      viewCalendar() {
        this.$emit('onViewCalendar', {
          appletId: this.selectedProfile.appletId,
          profile: this.user[this.selectedProfile.appletId]
        });
      },
      onCancel() {
        if (this.profileList.length > 1) {
          this.selectedProfile = null;
        } else {
          this.$emit('input', false);
        }
      }
    }
  }
</script>
