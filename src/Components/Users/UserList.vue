<template>
  <div>
    <div class="d-flex justify-space-between">
      <div class="filter">
        <v-text-field
          v-model="searchText"
          :label="$t('searchUsers')"
          prepend-inner-icon="mdi-magnify"
          class="search-input"
          outlined
          show-select
          @change="updateFilter"
          @input="updateFilter"
        />

        <span>{{ $t("search") }}</span>
      </div>
      <v-btn
        v-if="multiSelectionEnabled"
        class="reset-selection"
        @click="resetSelection"
      >
        {{ $t('resetSelection') }}
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="formattedUsers"
      :options.sync="options"
      :server-items-length="totalUsers"
      :loading="loading"
      :custom-sort="customSort"
      :footer-props="{
        itemsPerPageText: $t('rowsPerPage'),
        itemsPerPageAllText: $t('all')
      }"
    >
      <template v-slot:body="props">
        <tr
          v-for="item in props.items"
          :key="item.id"
          :class="item.selected ? 'selected' : ''"
          @click="rowClicked(item)"
        >
          <td
            v-for="header in headers"
            :key="header.value"
            class="cell"
          >
            <span v-if="header.value == 'manage' && item.selected">
              <v-btn
                v-if="item.scheduling.length > 0"
                @click.stop="onViewCalendar(item)"
              >
                <v-icon> mdi-calendar-month </v-icon>
              </v-btn>

              <v-btn
                v-if="item.viewable.length > 0"
                @click.stop="onViewUser(item)"
              >
                <v-icon> mdi-chart-bar </v-icon>
              </v-btn>

              <v-btn
                v-if="item.viewable.length"
                @click.stop="onExportUserData(item)"
              >
                <v-icon class="export-icon">mdi-export</v-icon>
              </v-btn>

              <v-btn
                v-if="item.editable.length > 0"
                @click.stop="editUser(item)"
              >
                <v-icon> mdi-delete </v-icon>
              </v-btn>
            </span>
            <span v-else-if="header.value == 'pinned'">
              <v-btn @click="switchPin(item, !item[header.value])">
                <v-icon v-if="item[header.value]">mdi-pin</v-icon>
                <v-icon v-else>mdi-pin-off</v-icon>
              </v-btn>
            </span>
            <span v-else-if="header.value == 'selected'">
              <v-checkbox
                v-model="item.selected"
                disabled
              />
            </span>
            <span v-else-if="header.value == 'updated'">
              {{ item['timeAgo'] }}
            </span>
            <span v-else-if="header.value == 'refreshRequest'">
              <span
                class="btn-user-request"
                @click="userRequestHandler(item)"
                v-if="item.refreshRequest"
              >
                {{ $t('refreshRequest') }}
              </span>
            </span>
            <span v-else>
              {{ item[header.value] }}
            </span>
          </td>
        </tr>
      </template>

      <template v-slot:footer.page-text="{ pageStart, pageStop, itemsLength }">
        {{ pageStart }} - {{ pageStop }} {{ $t('of') }} {{ itemsLength }}
      </template>
    </v-data-table>

    <EditUserAccessDialog
      :key="`edit-${userEditDialog.key}`"
      :user="userEditDialog.user"
      v-model="userEditDialog.visible"
      @refreshUserList="updateUserList"
    />

    <SchedulingDialog
      :key="`scheduling-${userScheduleDialog.key}`"
      :user="userScheduleDialog.user"
      v-model="userScheduleDialog.visible"
      @onViewCalendar="viewCalendar"
    />

    <ExportDataDialog
      :key="`export-${userExportDialog.key}`"
      :user="userExportDialog.user"
      v-model="userExportDialog.visible"
      @onExportData="onDataRequest"
    />

    <ViewDataDialog
      :key="`view-${userViewDialog.key}`"
      :user="userViewDialog.user"
      v-model="userViewDialog.visible"
      @onViewData="onDataRequest"
    />

    <AppletPassword
      ref="appletPasswordDialog"
      v-model="appletPasswordDialog.visible"
      :hasConfirmPassword="false"
      @set-password="onAppletPassword"
    />
  </div>
</template>

<style scoped>
  .cell {
    text-align: center;
  }

  .reset-selection {
    margin-right: 10px;
    text-transform: none;
  }
  .filter {
    width: 50%;
  }
  .filter .search-input {
    margin: 10px;
    width: 50%;
    display: inline-block;
  }
  .filter span {
    color: rgb(159, 110, 240);
    font-weight: 600;
    margin-left: 20px;
  }

  .btn-user-request {
    color: red;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
  } 
  .btn-user-request:hover {
    color: rgb(100, 0, 0);
  }

  @media only screen and (max-width: 767px) {
    .filter .search-input {
      width: 80%;
    }
    .filter span {
      display: none;
    }
  }

  tr {
    cursor: pointer;
  }
  tr:hover {
    background-color: #f0f0f0;
  }
  tr.selected {
    background-color: rgb(239, 245, 255);
  }
</style>

<script>
import api from "../Utils/api/api.vue";
import config from "../../config";
import debounce from "debounce-promise";
import { AppletMixin } from "../Utils/mixins/AppletMixin";
import EditUserAccessDialog from "../Utils/dialogs/EditUserAccessDialog";
import ViewDataDialog from "../Utils/dialogs/ViewDataDialog";
import SchedulingDialog from "../Utils/dialogs/SchedulingDialog";
import ExportDataDialog from "../Utils/dialogs/ExportDataDialog";
import AppletPassword from "../Utils/dialogs/AppletPassword";
import encryption from "../Utils/encryption/encryption";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/fr';

TimeAgo.addLocale(en);
TimeAgo.addLocale(fr);

const timeAgo = new TimeAgo('en-US');

export default {
  name: "UserList",
  components: {
    EditUserAccessDialog,
    ViewDataDialog,
    SchedulingDialog,
    ExportDataDialog,
    AppletPassword,
  },
  mixins: [AppletMixin],
  props: {
    multiSelectionEnabled: {
      type: Boolean,
      required: false,
      default: true
    },
    getUserList: {
      type: Function,
      required: true,
    },
    reloading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  created() {
    if (this.multiSelectionEnabled) {
      const self = this;
      self.keyDownHandler = function ({ key }) {
        if (key == "Shift") self.shiftKeyOn = true;
      };
      self.keyUpHandler = function ({ key }) {
        if (key == "Shift") self.shiftKeyOn = false;
      };
      window.addEventListener("keydown", this.keyDownHandler);
      window.addEventListener("keyup", this.keyUpHandler);
    }
  },

  beforeDestroy() {
    if (this.multiSelectionEnabled) {
      window.removeEventListener("keydown", this.keyDownHandler);
      window.removeEventListener("keyup", this.keyUpHandler);
    }
  },

  data() {
    let headers = [
      {
        text: '',
        align: 'center',
        sortable: false,
        value: 'selected',
        width: 20,
      },
      {
        text: this.$i18n.t('pinStatus'),
        align: 'center',
        sortable: false,
        value: 'pinned',
        width: 20,
      },
      {
        text: this.$i18n.t('userCode'),
        align: 'center',
        sortable: true,
        value: 'MRN',
      },
      {
        text: this.$i18n.t('updated'),
        align: 'center',
        sortable: true,
        value: 'updated',
      },
      {
        text: this.$i18n.t('currentScheduleStatus'),
        align: 'center',
        sortable: false,
        value: 'currentScheduleStatus',
      },
      {
        text: '',
        align: 'center',
        sortable: false,
        value: 'refreshRequest',
        width: '10%',
      },
      {
        text: '',
        align: 'center',
        sortable: false,
        value: 'manage',
        width: '20%'
      }
    ];

    if (!this.multiSelectionEnabled) {
      /** hide some headers in dashboard page */
      headers = headers.filter((header) => 
        header.value != 'refreshRequest' && 
        header.value != 'currentScheduleStatus' && 
        header.value != 'selected'
      );
    }

    return {
      headers,
      searchText: '',
      loading: true,
      options: {},
      totalUsers: 0,
      users: [],
      formattedUsers: [],
      updateUserList: null,
      timeAgo: new TimeAgo(this.$i18n.locale.replace('_', '-')),

      userEditDialog: {
        visible: false,
        user: {},
        key: 0
      },
      userViewDialog: {
        visible: false,
        user: {},
        key: 0
      },
      userExportDialog: {
        visible: false,
        user: {},
        key: 0,
      },
      userScheduleDialog: {
        visible: false,
        user: {},
        key: 0
      },
      appletPasswordDialog: {
        visible: false,
        profile: {},
        appletId: null,
        requestedAction: null,
      },

      shiftKeyOn: false,
      startRow: -1,
      previousEndRow: -1,
    };
  },
  computed: {
    accountApplets() {
      return this.$store.state.currentAccount.applets;
    },

    currentUsers() {
      return this.$store.state.currentUsers;
    },

    currentAccount() {
      return this.$store.state.currentAccount;
    },
  },
  watch: {
    options: {
      handler () {
        this.updateUserList();
      },
      deep: true,
    },
    reloading: function(reloading) {
      if (reloading) {
        this.updateUserList();
      }
    },
  },

  beforeMount() {
    const updateUserList = debounce(() => {
      this.getUserList(
        'user',
        this.searchText,
        {
          pageIndex: this.options.page - 1,
          recordsPerPage: this.options.itemsPerPage,
          allow: true
        },
        {
          sortBy: this.options.sortBy[0],
          sortDesc: this.options.sortDesc[0],
          allow: this.options.length > 0
        }
      ).then((resp) => {
        this.loading = false;

        this.users = resp.data.items;
        this.totalUsers = resp.total;

        this.formattedUsers = this.getFormattedUsers();

        this.$emit('userDataReloaded');
      })
    }, 270);

    this.updateUserList = () => {
      this.loading = true;
      updateUserList();
    };
  },
  methods: {
    rowClicked(row) {
      const rowId = row.id;

      if (this.startRow < 0 || !this.shiftKeyOn) {
        if (this.multiSelectionEnabled || !row.selected) {
          this.invertSelection(row);
        }

        /** in case multi-selection is disabled unselect previously selected row */
        if (!this.multiSelectionEnabled && row.id != this.previousEndRow && this.previousEndRow >= 0) {
          this.invertSelection(this.formattedUsers[this.previousEndRow]);
        }

        this.previousEndRow = this.startRow = rowId;
      } else {
        const start = Math.min(rowId, this.previousEndRow);
        const end = Math.max(rowId, this.previousEndRow);

        for (let i = start; i <= end; i++) {
          const status = [
            Math.sign(i - start) * Math.sign(this.startRow - i) + 1,
            Math.sign(i - end) * Math.sign(this.startRow - i) + 1,
          ];

          if (status[0] && !status[1] || !status[0] && status[1]) {
            this.invertSelection(this.formattedUsers[i]);
          }
        }

        this.previousEndRow = rowId;
      }
    },

    invertSelection(row) {
      let user = this.users[row.id];
      let profile = Object.values(user)[0];

      if (row.selected) {
        row.selected = false;

        if (this.currentAppletMeta) {
          this.$store.commit('unSelectUser', profile);
        }
      } else {
        row.selected = true;

        if (this.currentAppletMeta) {
          this.$store.commit('selectUser', profile);
        }
      }
    },

    userRequestHandler(row) {
      this.$emit('onReuploadResponse', Object.values(this.users[row.id])[0])
    },

    updateFilter() {
      this.updateUserList();
    },

    switchPin(row, newState) {
      let user = this.users[row.id];
      let profile = Object.values(user)[0];

      api.updatePin({
        apiHost: this.apiHost,
        token: this.token,
        profileId: profile['_id'],
        newState,
      }).then(() => {
        this.updateUserList();
      })
    },

    onViewUser(row) {
      if (row.viewable.length > 1) {
        this.$set(this, 'userViewDialog', {
          visible: true,
          user: row.viewable.reduce((data, appletId) => ({
            ...data,
            [appletId]: this.users[row.id][appletId]
          }), {}),
          key: this.userViewDialog.key + 1
        });
      } else {
        this.onDataRequest({
          appletId: row.viewable[0],
          profile: this.users[row.id][row.viewable[0]],
          viewing: true
        });
      }
    },

    onExportUserData(row) {
      if (row.viewable.length > 1) {
        this.$set(this, 'userExportDialog', {
          visible: true,
          user: row.viewable.reduce((data, appletId) => ({
            ...data,
            [appletId]: this.users[row.id][appletId]
          }), {}),
          key: this.userExportDialog.key + 1
        });
      } else {
        this.onDataRequest({
          appletId: row.viewable[0],
          profile: this.users[row.id][row.viewable[0]],
          viewing: false
        });
      }
    },

    onViewCalendar(row) {
      if (row.scheduling.length === 1 && this.users[row.id][row.scheduling[0]].hasIndividualEvent) {
        this.viewCalendar({
          appletId: row.scheduling[0],
          profile: this.users[row.id][row.scheduling[0]],
        })
      } else {
        this.$set(this, 'userScheduleDialog', {
          visible: true,
          user: row.scheduling.reduce((data, appletId) => ({
            ...data,
            [appletId]: this.users[row.id][appletId]
          }), {}),
          key: this.userScheduleDialog.key + 1
        });
      }
    },

    viewCalendar({ appletId, profile }) {
      const applet = this.currentAccount.applets.find(applet => applet.id === appletId);

      this.$store.commit('setCurrentApplet', applet);
      this.$store.commit('setCurrentUsers', {
        [profile['_id']]: profile
      });

      this.$router.push(`/applet/${applet.id}/schedule`).catch(err => {});
    },

    editUser(row) {
      this.$set(this, 'userEditDialog', {
        visible: true,
        user: row.editable.reduce((data, appletId) => ({
          ...data,
          [appletId]: this.users[row.id][appletId]
        }), {}),
        key: this.userEditDialog.key + 1
      });
    },

    customSort(items, sortBy, sortDesc, locale) {
      const sortRule = ['pinned', ...sortBy];
      const sortType = [1, ...sortDesc].map( value => value ? -1 : 1);

      return items.sort((x, y) => {
        for (let i = 0; i < sortRule.length; i++) {
          const rule = sortRule[i];

          if (x[rule] < y[rule]) return -sortType[i];
          if (x[rule] > y[rule]) return sortType[i];
        }
        return 0;
      });
    },

    getFormattedUsers() {
      const formattedUsers = [];

      for (let i = 0; i < this.users.length; i++) {
        let MRNs = [], updated = null, user = this.users[i], refreshRequest = false;
        let selected = false, pinned = false, hasIndividualEvent = false;

        let viewable = [], editable = [], scheduling = [];

        for (let appletId in user) {
          let profile = user[appletId];
          const applet = this.accountApplets.find(applet => applet.id === appletId);

          MRNs.push(profile.MRN);

          if (profile.updated && (!updated || new Date(updated).getTime() < new Date(profile.updated).getTime())) {
            updated = profile.updated;
          }

          pinned = profile.pinned;

          if (profile.viewable) {
            viewable.push(appletId);
          }

          if (
            applet.roles.includes('coordinator') && !profile.roles.includes('owner') &&
            (
              applet.roles.includes('owner') || 
              (!applet.roles.includes('manager') && profile.roles.length == 1 || applet.roles.includes('manager') && !profile.roles.includes('manager'))
            )
          ) {
            editable.push(appletId);
          }

          if (applet.roles.includes('coordinator')) {
            scheduling.push(appletId);
          }

          /** enable only in applet-selected page */
          if (this.currentAppletMeta) {
            refreshRequest = profile.refreshRequest;
            hasIndividualEvent = profile.hasIndividualEvent;
            if (this.currentUsers[profile['_id']]) {
              selected = true;
            }
          }
        }

        formattedUsers.push({
          MRN: MRNs.filter(function(item, pos){
            return MRNs.indexOf(item) == pos; 
          }).join(','),
          timeAgo: updated && this.timeAgo.format(new Date(updated), 'round'),
          currentScheduleStatus: hasIndividualEvent ? this.$t('individualSchedule') : this.$t('generalSchedule'),
          updated,
          pinned,
          viewable,
          editable,
          scheduling,
          selected,
          refreshRequest,
          id: i
        })
      }

      return formattedUsers;
    },

    resetSelection() {
      this.$store.commit('setCurrentUsers', {});
      for (let user of this.formattedUsers) {
        user.selected = false;
      }
    },

    onDataRequest({ appletId, profile, viewing }) {
      const appletMeta = this.accountApplets.find(applet => applet.id === appletId);

      let preprocess = !this.isLatestApplet(appletMeta) ? this.loadApplet(appletId) : Promise.resolve();

      preprocess.then(() => {
        const appletData = this.$store.state.allApplets[appletId];

        const encryptionInfo = appletData.applet.encryption;

        this.$set(this, 'appletPasswordDialog', {
          visible: false,
          appletId,
          profile,
          requestedAction: viewing ? this.gotoDashboard.bind(this) : this.exportData.bind(this),
        });

        if (
          !encryptionInfo ||
          !encryptionInfo.appletPrime ||
          encryptionInfo.appletPrivateKey
        ) {
          this.appletPasswordDialog.requestedAction();
        } else {
          this.appletPasswordDialog.visible = true;
        }
      })
    },

    gotoDashboard() {
      const applet = this.accountApplets.find(applet => applet.id === this.appletPasswordDialog.appletId);

      let profile = this.appletPasswordDialog.profile;

      this.$store.commit('setCurrentApplet', applet);
      this.$store.commit('setCurrentUsers', {
        [profile['_id']]: profile
      });

      this.$router.push({
        path: `/applet/${applet.id}/dashboard`,
        query: { users: [profile['_id']] },
      }).catch(err => {});
    },

    exportData() {
      const applet = this.accountApplets.find(applet => applet.id === this.appletPasswordDialog.appletId);

      this.exportUserData(applet);
    },

    onAppletPassword(appletPassword) {
      const applet = this.accountApplets.find(applet => applet.id === this.appletPasswordDialog.appletId);

      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword,
        accountId: this.currentAccount.accountId,
        prime: applet.encryption.appletPrime,
        baseNumber: applet.encryption.base,
      });

      if (
        encryptionInfo
          .getPublicKey()
          .equals(Buffer.from(applet.encryption.appletPublicKey))
      ) {
        this.$store.commit('setAppletPrivateKey', {
          appletId: this.appletPasswordDialog.appletId,
          key: Array.from(encryptionInfo.getPrivateKey()),
        });

        this.appletPasswordDialog.requestedAction();

        this.appletPasswordDialog.visible = false;
      } else {
        this.$refs.appletPasswordDialog.defaultErrorMsg 
          = this.$t('incorrectAppletPassword');
      }
    },
  },
};
</script>
