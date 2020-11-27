<template>
  <div>
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
          :class="selectedRows.includes(item.id) ? 'selected' : ''"
          @click="rowClicked(item)"
        >
          <td
            v-for="header in headers"
            :key="header.value"
            class="cell"
          >
            <span v-if="header.value == 'manage' && selectedRows.includes(item.id)">
              <v-btn
                v-if="item.viewable.length > 0"
                @click="viewUser(item)"
              >
                {{ $t("view") }}
              </v-btn>
              <v-btn
                v-if="item.editable.length > 0"
                @click="editUser(item)"
              >
                {{ $t("edit") }}
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
              />
            </span>
            <span v-else-if="header.value == 'updated'">
              {{ item['timeAgo'] }}
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
      v-model="userEditDialog.visible"
      :employer="userEditDialog.employer"
      @refreshUserList="updateUserList"
    />

    <ViewDataDialog
      :key="`view-${userViewDialog.key}`"
      v-model="userViewDialog.visible"
      :employer="userViewDialog.employer"
    />
  </div>
</template>

<style scoped>
  .cell {
    text-align: center;
  }
  .filter .search-input {
    margin: 10px;
    width: 25%;
    display: inline-block;
  }
  .filter span {
    color: rgb(159, 110, 240);
    font-weight: 600;
    margin-left: 20px;
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
import { AppletMixin } from "../Applets/appletMixin";
import EditUserAccessDialog from "../Utils/dialogs/EditUserAccessDialog";
import ViewDataDialog from "../Utils/dialogs/ViewDataDialog";

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
        text: '',
        align: 'center',
        sortable: false,
        value: 'manage',
        width: '20%'
      }
    ];

    if (!this.multiSelectionEnabled) {
      headers.shift();
    }
    return {
      headers,
      searchText: '',
      loading: true,
      options: {},
      totalUsers: 0,
      users: [],
      updateUserList: null,
      timeAgo: new TimeAgo(this.$i18n.locale.replace('_', '-')),

      selectedRows: [],
      userEditDialog: {
        visible: false,
        employer: {},
        key: 0
      },
      userViewDialog: {
        visible: false,
        employer: {},
        key: 0
      },
    };
  },
  computed: {
    accountApplets() {
      return this.$store.state.currentAccount.applets;
    },

    formattedUsers() {
      const formattedUsers = [];

      for (let i = 0; i < this.users.length; i++) {
        let MRNs = [], updated = null, user = this.users[i], pinned = false;
        let viewable = [], editable = [];

        let defaultMRN = null;
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
        }

        formattedUsers.push({
          MRN: MRNs.filter(function(item, pos){
            return MRNs.indexOf(item) == pos; 
          }).join(','),
          timeAgo: updated && this.timeAgo.format(new Date(updated), 'round'),
          updated,
          pinned,
          viewable,
          editable,
          id: i
        })
      }
      return formattedUsers;
    },
  },
  watch: {
    options: {
      handler () {
        this.updateUserList();
      },
      deep: true,
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
      })
    }, 270);

    this.updateUserList = () => {
      this.loading = true;
      updateUserList();
    };
  },
  methods: {
    rowClicked(row) {
      if (this.selectedRows.includes(row.id)) {
        if (this.multiSelectionEnabled) {
          this.selectedRows = this.selectedRows.filter(id => id != row.id);
        }
      } else {
        if (!this.multiSelectionEnabled) {
          this.selectedRows = [];
        }
        this.selectedRows.push(row.id);
      }
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
    viewUser(row) {
      this.$set(this, 'userViewDialog', {
        visible: true,
        employer: row.viewable.reduce((data, appletId) => ({
          ...data,
          [appletId]: this.users[row.id][appletId]
        }), {}),
        key: this.userViewDialog.key + 1
      })
    },
    editUser(row) {
      this.$set(this, 'userEditDialog', {
        visible: true,
        employer: row.editable.reduce((data, appletId) => ({
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
  },
};
</script>
