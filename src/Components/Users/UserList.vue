<template>
  <div>
    <div class="d-flex justify-space-between pt-5">
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
              <user-table-actions :item="item" :users="selectedUsers" :refreshUserRequest="updateUserList"></user-table-actions>
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
                v-if="item.refreshRequest"
                class="btn-user-request"
                @click="userRequestHandler(item)"
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
  </div>
</template>

<style scoped>
  .cell {
    text-align: center;
  }

  .reset-selection {
    margin-right: 10px;
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
    user-select: none;
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

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/fr';
import UserTableActions from "@/Components/Users/UserTableActions";

TimeAgo.addLocale(en);
TimeAgo.addLocale(fr);

const timeAgo = new TimeAgo('en-US');

export default {
  name: "UserList",
  components: {
    UserTableActions,
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
    } else {
      let currentApplet = this.$store.state.currentAppletMeta;

      if (
        !currentApplet || !(
          currentApplet.roles.includes('coordinator') || 
          currentApplet.roles.includes('manager') ||
          currentApplet.roles.includes('owner')
        )
      ) {
        headers = headers.filter((header) => 
          header.value != 'currentScheduleStatus'
        )
      }

      if (
        !currentApplet || !(
          currentApplet.roles.includes('manager') ||
          currentApplet.roles.includes('owner')
        )
      ) {
        headers = headers.filter(header =>
          header.value != 'refreshRequest'
        );
      }
    }

    return {
      headers,
      searchText: '',
      loading: true,
      options: {},
      totalUsers: 0,
      updateUserList: null,
      users: [],
      formattedUsers: [],
      timeAgo: new TimeAgo(this.$i18n.locale.replace('_', '-')),
      selectedUsers: [], // consider when user multi select.
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
          allow: this.options.sortBy.length > 0
        }
      ).then((resp) => {
        this.loading = false;

        this.users = resp.data.items;
        this.totalUsers = resp.data.total;

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
      this.selectedUsers[row.id] = this.users[row.id]
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
          }).join(', '),
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
    }
  }
};
</script>
