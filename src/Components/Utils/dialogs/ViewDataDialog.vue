<template>
  <v-dialog
    :value="value"
    max-width="600px"
    @input="$emit('input', $event)"
  >
    <v-card class="pa-4">
      <div class="title">
        {{ $t('viewData') }}
      </div>

      <div class="sub-title">
        {{ $t('selectAppletToViewData') }}
      </div>

      <v-card-text>
        <div class="scroll">
          <v-btn
            v-for="profile in profileList"
            :key="profile.appletId"
            class="view-btn"
            @click="onViewData(profile)"
          >
            {{ profile.identifier }}
          </v-btn>
        </div>
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
  .view-btn /deep/ .v-btn__content {
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
    .scroll {
    overflow: scroll;
    overflow-y: auto; 
    overflow-x: hidden; 
    max-height: 480px;
  }

  @media only screen and (max-height: 650px) {
    .scroll {
      max-height: 380px;
    }
  }
  @media only screen and (max-height: 550px) {
    .scroll {
      max-height: 280px;
    }
  }
  @media only screen and (max-height: 450px) {
    .scroll {
      max-height: 180px;
    }
  }
  @media only screen and (max-height: 340px) {
    .scroll {
      max-height: 80px;
    }
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
      onViewData(profile) {
        this.$emit('onViewData', {
          appletId: profile.appletId,
          profile: this.user[profile.appletId],
          viewing: true
        });
      },
    }
  }
</script>
