<template>
  <div>
    <div class="entry-header pt-5">
      <div class="data-filter">
        <v-text-field
          v-model="searchText"
          :label="$t('searchEntries')"
          prepend-inner-icon="mdi-magnify"
          class="search-input"
          hide-details
          outlined
        />
      </div>
    </div>

    <div class="pl-2 my-1">
      <v-btn
        color="primary"
        style="margin: auto;"
        @click="selectAppletDialog = true"
      >
        <v-icon
          class="mr-2"
          dark
        >
          mdi-plus
        </v-icon>

        {{ $t('newEntry') }}
      </v-btn>
    </div>

    <div class="d-flex entry-list">
      <v-data-table
        style="width: 100%"
        :headers="headers"
        :items="filteredEntries"
        depressed
        sort-by="calories"
        class="elevation-4"
        :loading="loading"
        :footer-props="{
          itemsPerPageText: $t('rowsPerPage'),
          itemsPerPageAllText: $t('all'),
          itemsPerPageOptions: [10, 50, 100, -1],
        }"
      >
        <template v-slot:item="{ item }">
          <tr
            v-if="item.visible"
            :class="{'selected': selectedEntry == item}"
            @mousedown="selectedEntry = item"
          >
              <template
                v-if="item.type == 'applet'"
              >
                <td
                  v-for="header in headers"
                  :key="header.value"
                >
                  <div
                    v-if="header.value == 'responderId'"
                  >
                    <v-icon @click="switchExpand(item)">
                      {{ item.expanded ? 'mdi-folder-open-outline' : 'mdi-folder-outline' }}
                    </v-icon>
                    {{ item.name }}
                  </div>
                  <div
                    v-else-if="header.value == 'actions'"
                    class="actions"
                  >
                    <v-tooltip
                      v-if="item.creatable"
                      top
                    >
                      <template v-slot:activator="{ on }">
                        <v-btn
                          v-on="on"
                          @click.stop="selectApplet(item)"
                        >
                          <v-icon>
                            mdi-playlist-plus
                          </v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('createEntry') }}</span>
                    </v-tooltip>

                    <v-tooltip
                      v-if="item.exportable"
                      top
                    >
                      <template v-slot:activator="{ on }">
                        <v-btn
                          v-on="on"
                          @click.stop="onExportData(item)"
                        >
                          <v-icon class="export-icon">
                            mdi-export
                          </v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('exportData') }}</span>
                    </v-tooltip>
                  </div>
                </td>
              </template>

              <template
                v-else
              >
                <td
                  v-for="header in headers"
                  :key="header.value"
                >
                  <div
                    v-if="header.value != 'actions'"
                    :class="{ 'responder-id': header.value == 'responderId' }"
                  >
                    {{ item[header.value] }}
                  </div>

                  <div
                    v-else
                    class="actions"
                  >
                    <v-tooltip
                      v-if="item.exportable"
                      top
                    >
                      <template v-slot:activator="{ on }">
                        <v-btn
                          v-on="on"
                          @click.stop="onViewUser(item)"
                        >
                          <v-icon> mdi-chart-bar </v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('viewData') }}</span>
                    </v-tooltip>

                    <v-tooltip
                      v-if="item.exportable"
                      top
                    >
                      <template v-slot:activator="{ on }">
                        <v-btn
                          v-on="on"
                          @click.stop="onExportData(item)"
                        >
                          <v-icon class="export-icon">
                            mdi-export
                          </v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('exportData') }}</span>
                    </v-tooltip>

                    <v-tooltip
                      v-if="item.deletable"
                      top
                    >
                      <template v-slot:activator="{ on }">
                        <v-btn
                          v-on="on"
                          @click.stop="onDeleteEntry(item)"
                        >
                          <v-icon> mdi-delete </v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('editAccess') }}</span>
                    </v-tooltip>
                  </div>
                </td>
              </template>
          </tr>
        </template>
        <template v-slot:no-data>
          <h4> No data</h4>
        </template>
      </v-data-table>
    </div>

    <CreateEntryDialog
      v-model="selectAppletDialog"
      :case-id="currentCase.caseId || ''"
      :case-applets="caseApplets"
      @selectApplet="selectApplet"
    />

    <SelectEntryTypeDialog
      v-model="selectEntryTypeDialog"
      :case-id="currentCase.caseId || ''"
      @selectEntryType="selectEntryType"
    />

    <LinkedUserSelectionDialog
      v-model="selectUserDialog"
      :case-id="currentCase.caseId || ''"
      :users="linkedUsers"
      :applet="newEntry.applet || {}"
      @selectLinkedUser="selectLinkedUser"
    />

    <AppletPassword
      ref="casePasswordDialog"
      v-model="casePasswordDialog.visible"
      :default-title="$t('casePassword')"
      :has-confirm-password="false"
      @set-password="setCasePassword"
    />

    <ConfirmationDialog
      v-model="confirmationDialog.visible"
      :title="$t('deleteEntry')"
      :dialog-text="$t('confirmDeleteEntry')"
      @onOK="deleteEntry"
    />

    <InformationDialog
      v-model="entryDeletedDialog"
      :title="$t('deleteEntry')"
      :dialog-text="$t('entryDeleted')"
    />
  </div>
</template>

<style scoped>
  .entry-header {
    display: flex;
    justify-content: space-between;
  }

  .responder-id {
    margin-left: 2rem;
  }

  tr .actions {
    display: none;
  }
  tr:hover .actions {
    display: block;
  }

  .entry-list /deep/ tr.selected {
    background-color: rgb(239, 245, 255) !important;
  }
</style>

<script>
import { CaseMixin } from "../Utils/mixins/CaseMixin";

import CreateEntryDialog from "../Utils/dialogs/CreateEntryDialog";
import SelectEntryTypeDialog from "../Utils/dialogs/SelectEntryTypeDialog";
import LinkedUserSelectionDialog from "../Utils/dialogs/LinkedUserSelectionDialog";
import ConfirmationDialog from "../Utils/dialogs/ConfirmationDialog";
import InformationDialog from "../Utils/dialogs/InformationDialog";
import AppletPassword from "../Utils/dialogs/AppletPassword";
import encryption from "../Utils/encryption/encryption";
import api from "../Utils/api/api";

export default {

  components: {
    CreateEntryDialog,
    SelectEntryTypeDialog,
    LinkedUserSelectionDialog,
    AppletPassword,
    ConfirmationDialog,
    InformationDialog,
  },
  mixins: [CaseMixin],

  props: {
    loading: {
      type: Boolean,
      required: true
    },
    eventHub: {
      type: Object,
      required: true
    },
    passwords: {
      type: Object,
      required: true
    },
    casePassword: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      searchText: '',
      selectAppletDialog: false,
      selectEntryTypeDialog: false,
      selectUserDialog: false,
      headers: [
        {
          text: this.$i18n.t('responderId'),
          align: 'left',
          sortable: false,
          value: 'responderId',
          width: '30%',
          isPrimaryColumn: true,
        },
        {
          text: this.$i18n.t('entryType'),
          align: 'left',
          sortable: false,
          value: 'entryType',
          width: '10%',
        },
        {
          text: this.$i18n.t('lastUpdated'),
          align: 'left',
          sortable: false,
          value: 'lastUpdated',
          width: '20%',
        },
        {
          text: this.$i18n.t('status'),
          align: 'left',
          sortable: false,
          value: 'status',
        },
        {
          text: this.$i18n.t('actions'),
          align: 'left',
          sortable: false,
          value: 'actions',
          width: '20%'
        }
      ],

      newEntry: {
        applet: null,
        type: '',
        linkedUser: null
      },

      items: [],

      casePasswordDialog: {
        visible: false,
        requestedAction: null
      },

      confirmationDialog: {
        visible: false,
        entry: null
      },

      entryDeletedDialog: false,
      selectedEntry: null
    }
  },

  computed: {
    caseApplets () {
      const applets = [];

      if (this.currentCase.applets) {
        for (let appletId of this.currentCase.applets) {
          const applet = this.accountApplets.find(
            applet => applet.id == appletId && ( applet.roles.includes('coordinator') || applet.roles.includes('reviewer') || applet.roles.includes('manager') )
          )

          let userCount = 0
          for (const user of this.linkedUsers) {
            if (user.applets.find(obj => obj.appletId == applet.id)) {
              userCount++;
            }
          }

          if (applet) {
            applets.push({
              ...applet,
              userCount
            })
          }
        }
      }

      return applets
    },

    filteredEntries () {
      return this.items.filter(item => item.type == 'applet' || item.responderId.includes(this.searchText))
    }
  },

  watch: {
    loading() {
      if (!this.loading) {
        this.onLoad();
      }
    }
  },

  created() {
    this.eventHub.$on('onNewEntry', this.onNewEntry)
  },

  methods: {
    getEntryType (type) {
      if (type == 'self_report') {
        return 'Admin Report';
      }
      else if (type == 'one_time_report') {
        return 'One-time submission';
      }
      return 'User Report';
    },

    getEntryStatus (status) {
      if (status == 'not_started') {
        return 'Not Started'
      }
      else if (status == 'completed') {
        return 'Completed'
      }

      return 'In Progress';
    },

    onLoad () {
      this.items = []

      for (let applet of this.caseApplets) {
        const deletable = applet.roles.includes('manager');
        const exportable = applet.roles.includes('reviewer') || applet.roles.includes('manager');

        this.items.push({
          type: 'applet',
          expanded: true,
          visible: true,
          deletable,
          exportable,
          creatable: applet.roles.includes('coordinator') || applet.roles.includes('manager'),
          appletId: applet.id,
          id: applet.id,
          name: applet.displayName,
        })

        for (let i = 0; i < this.entries.length; i++) {
          const entry = this.entries[i];

          if (entry.appletId == applet.id) {
            this.items.push(this.getEntryItem(entry))
          }
        }
      }
    },

    getEntryItem (entry) {
      const applet = this.caseApplets.find(applet => applet.id == entry.appletId);

      return {
        type: 'entry',
        deletable: applet.roles.includes('manager'),
        exportable: applet.roles.includes('reviewer') || applet.roles.includes('manager'),
        visible: true,
        entryType: this.getEntryType(entry.entryType),
        responderId: entry.responder || 'None',
        lastUpdated: entry.lastUpdated,
        status: this.getEntryStatus(entry.status),
        appletId: entry.appletId,
        profileId: entry.profileId,
        id: entry._id,
      }
    },

    switchExpand (applet) {
      applet.expanded = !applet.expanded;

      for (let item of this.items) {
        if (item.type == 'entry' && item.appletId == applet.appletId) {
          item.visible = applet.expanded;
        }
      }
    },

    onNewEntry (entry) {
      let lastIndex = -1;

      for (let i = this.items.length-1; i >= 0; i--) {
        if (this.items[i].appletId == entry.appletId) {
          lastIndex = i;
          break;
        }
      }

      this.items.splice(lastIndex + 1, 0, this.getEntryItem(entry));
    },

    onExportData (item) {
      if (this.casePassword) {
        this.exportData(item);
      } else {
        this.$set(this, 'casePasswordDialog', {
          visible: true,
          requestedAction: this.exportData.bind(this, item)
        })
      }
    },

    onViewUser (item) {
      if (this.casePassword) {
        this.viewUser(item);
      } else {
        this.$set(this, 'casePasswordDialog', {
          visible: true,
          requestedAction: this.viewUser.bind(this, item)
        })
      }
    },

    exportData (item) {
      this.setAppletPrivateKey(item.appletId, this.passwords[item.appletId]).then(() => {
        const applet = this.accountApplets.find(applet => applet.id === item.appletId);

        if (item.type == 'entry') {
          this.$store.commit('setCurrentUsers', {
            [item.profileId]: {
              appletId: item.appletId,
              MRN: item.responderId,
            }
          });
        } else {
          this.$store.commit('setCurrentUsers', {});
        }

        this.exportUserData(applet, null, this.currentCase._id, item.id);
      })
    },

    viewUser (item) {
      this.setAppletPrivateKey(item.appletId, this.passwords[item.appletId]).then(() => {
        const applet = this.accountApplets.find(applet => applet.id === item.appletId);

        this.$store.commit('setCurrentApplet', applet);
        this.$store.commit('setCurrentUsers', {
          [item.profileId]: {
            appletId: item.appletId,
            MRN: item.responderId,
          }
        });

        this.$router.push({
          path: `/applet/${item.appletId}/dashboard`,
          query: { users: [item.profileId] },
        }).catch(err => {});
      })
    },

    onDeleteEntry (item) {
      this.confirmationDialog.visible = true;
      this.confirmationDialog.entry = item;
    },

    deleteEntry () {
      const entryId = this.confirmationDialog.entry.id;

      api.deleteEntry(this.apiHost, this.token, this.currentCase._id, entryId).then(() => {
        this.$store.commit('deleteEntry', this.entries.findIndex(entry => entry._id == entryId));
        this.entryDeletedDialog = true;

        const index = this.items.findIndex(item => item.type == 'entry' && item.id == entryId);
        this.items.splice(index, 1);
      });
    },

    selectApplet (applet) {
      this.newEntry.applet = this.caseApplets.find(d => d.id == applet.id);
      this.selectAppletDialog = false;
      this.selectEntryTypeDialog = true;
    },

    selectEntryType (entryType) {
      this.selectEntryTypeDialog = false;

      this.newEntry.entryType = entryType;
      this.newEntry.linkedUser = null;

      if (entryType == 'user_report') {
        this.selectUserDialog = true;
      } else {
        this.$emit('setEntrySchedule', this.newEntry);
      }
    },

    setCasePassword (password) {
      try {
        const decrypted = encryption.decryptData({ text: this.currentCase.password, key: encryption.getHashed(password) })

        this.$emit('updatePasswords', JSON.parse(decrypted));
        this.$emit('setCasePassword', password);
        this.casePasswordDialog.visible = false;

        if (this.casePasswordDialog.requestedAction) {
          this.$nextTick(() => {
            this.casePasswordDialog.requestedAction();
          });
        }
      } catch (e) {
        this.$refs.casePasswordDialog.defaultErrorMsg = this.$t('incorrectCasePassword');
      }
    },

    selectLinkedUser (linkedUser) {
      this.newEntry.linkedUser = linkedUser;
      this.selectUserDialog = false;

      this.$emit('setEntrySchedule', this.newEntry);
    },
  }
}
</script>
