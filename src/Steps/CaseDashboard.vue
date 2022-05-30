<template>
  <v-container
    fluid
  >
    <SetSchedule
      v-if="settingSchedule"
      :add-entry="addEntry"
      :entry-type="newEntry && newEntry.entryType || ''"
      :case-id="currentCase._id"
      @scheduleSaved="scheduleSaved"
      @failed="failedToCreateEntry"
    />
    <v-card
      v-show="!settingSchedule"
    >
      <div class="tabs">
        <v-tabs
          v-model="selectedTab"
          background-color="white"
          color="black"
          light
          left
        >
          <template v-for="tab in tabs">
            <v-tab
              :key="tab"
              @click="onSwitchTab"
            >
              {{ $t(tab) }}
            </v-tab>
          </template>
        </v-tabs>
      </div>

      <v-tabs-items v-model="selectedTab">
        <v-tab-item
          v-for="tab in tabs"
          :key="tab"
        >
          <v-card
            v-if="tab == 'entries'"
            flat
          >
            <EntryList
              :loading="loading"
              :eventHub="eventHub"
              :case-password="casePassword"
              :passwords="passwords"
              @setEntrySchedule="setEntrySchedule"
              @updatePasswords="updatePasswords"
              @setCasePassword="setCasePassword"
            />
          </v-card>

          <v-card
            v-else
            flat
          >
            <LinkUser
              :loading="loading"
              :case-password="casePassword"
              :passwords="passwords"
              @updatePasswords="updatePasswords"
              @setCasePassword="setCasePassword"
            />
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card>

    <EntryInfoDialog
      v-model="entryInfoDialog.visible"
      :entry="entryInfoDialog.entry || {}"
      :is-new-entry="entryInfoDialog.isNewEntry"
    />

    <InformationDialog
      v-model="informationDialog"
      :title="$t('createFailed')"
      :dialog-text="$t('createEntryFailedText')"
    />
  </v-container>
</template>

<script>
import EntryList from "../Components/Cases/EntryList";
import LinkUser from "../Components/Cases/LinkUser";
import api from "../Components/Utils/api/api";
import { AppletMixin } from "../Components/Utils/mixins/AppletMixin";
import EntryInfoDialog from "../Components/Utils/dialogs/EntryInfoDialog";
import InformationDialog from "../Components/Utils/dialogs/InformationDialog";
import SetSchedule from "./SetSchedule";
import Vue from "vue";

export default {
  components: {
    EntryList,
    LinkUser,
    SetSchedule,
    EntryInfoDialog,
    InformationDialog,
  },
  mixins: [AppletMixin],
  data() {
    return {
      selectedTab: 0,
      tabs: ['entries', 'linkUser'],
      loading: true,
      settingSchedule: false,

      newEntry: null,
      entryInfoDialog: {
        visible: false,
        entry: null,
        isNewEntry: false
      },
      eventHub: new Vue(),
      casePassword: '',
      passwords: {},

      informationDialog: false
    }
  },

  computed: {
    currentCase () {
      return this.$store.state.currentCase;
    }
  },

  mounted() {
    this.addEntry = this.addEntry.bind(this);
    this.onSwitchTab();
  },

  methods: {
    setCasePassword (password) {
      this.casePassword = password;
    },

    updatePasswords (passwords) {
      this.$set(this, 'passwords', passwords);
    },

    onSwitchTab () {
      this.loading = true;
      api.getCase(this.apiHost, this.token, this.currentCase._id).then(resp => {
        this.$store.commit('setCurrentCase', resp.data);
        this.loading = false;
      })
    },

    setEntrySchedule ({ linkedUser, entryType, applet }) {
      let profileId = null;
      this.$store.commit('setCurrentApplet', applet);

      if (linkedUser) {
        for (let i = 0; i < linkedUser.applets.length; i++) {
          if (linkedUser.applets[i].appletId == applet.id) {
            profileId = linkedUser.applets[i].profileId;
          }
        }

        this.$store.commit('setCurrentUsers', {
          [profileId]: {
            MRN: linkedUser.MRN
          }
        })
      } else {
        this.$store.commit('setCurrentUsers', {
          '_': {
            MRN: this.$t('oneTimeReportEntry'),
          }
        })
      }

      this.settingSchedule = true

      this.newEntry = {
        linkedUser, entryType, applet, profileId
      }
    },

    scheduleSaved (entry) {
      this.settingSchedule = false;

      this.$store.commit('setCurrentApplet', null);
      this.$store.commit('setCurrentUsers', {});

      setTimeout(
        () => {
          this.$set(this, 'entryInfoDialog', {
            visible: true,
            entry,
            isNewEntry: true
          })
        },
        500
      )

      this.eventHub.$emit('onNewEntry', entry);
    },

    failedToCreateEntry() {
      this.settingSchedule = false;

      this.$store.commit('setCurrentApplet', null);
      this.$store.commit('setCurrentUsers', {});

      setTimeout(
        () => {
          this.informationDialog = true;
        },
        500
      );
    },

    addEntry () {
      return api.addEntry(
        this.apiHost,
        this.token,
        this.currentCase._id,
        this.newEntry.profileId,
        this.newEntry.applet.id,
        this.newEntry.entryType
      ).then(resp => {
        this.$store.commit('addEntry', resp.data);

        return resp.data;
      });
    }
  }
}
</script>
