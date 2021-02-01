<template>
  <div>
    <div class="d-flex justify-space-between pt-5">
      <div class="filter">
        <v-text-field
          v-model="searchText"
          :label="currentRole == 'user' ? $t('searchUsers') : $t('searchOrganizers')"
          prepend-inner-icon="mdi-magnify"
          class="search-input"
          outlined
          show-select
          @change="updateFilter"
          @input="updateFilter"
        />
      </div>
      <!-- <v-btn
        v-if="multiSelectionEnabled"
        class="reset-selection"
        @click="resetSelection"
      >
        {{ $t('resetSelection') }}
      </v-btn> -->
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
        itemsPerPageAllText: $t('all'),
        itemsPerPageOptions: [10, 50, 100, -1],
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
              <v-tooltip
                v-if="item.scheduling.length > 0"
                top
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click.stop="onViewCalendar(item)"
                  >
                    <v-icon> mdi-calendar-month </v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('viewIndividualCalendar') }}</span>
              </v-tooltip>

              <v-tooltip
                v-if="item.viewable.length > 0"
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
                v-if="item.viewable.length"
                top
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click.stop="onExportUserData(item)"
                  >
                    <v-icon class="export-icon">mdi-export</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('exportData') }}</span>
              </v-tooltip>

              <v-tooltip
                v-if="item.deletable.length > 0"
                top
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click.stop="editUser(item)"
                  >
                    <v-icon> mdi-delete </v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('editAccess') }}</span>
              </v-tooltip>

              <v-tooltip
                v-if="item.editable.length && currentRole !== 'user'"
                top
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click="onEditAccess(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Edit Access</span>
              </v-tooltip>
            </span>
            <span v-else-if="header.value == 'pinned'">
              <v-btn @click="switchPin(item, !item[header.value])">
                <v-icon v-if="item[header.value]">mdi-pin</v-icon>
                <v-icon v-else>mdi-pin-off</v-icon>
              </v-btn>
            </span>
            <span v-else-if="header.value == 'roles'">
              {{ item[header.value].join(', ') }}
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
        <tr v-if="props.items.length === 0 && !loading">
          <h4 class="no-data"> No data </h4>
        </tr>
      </template>

      <template v-slot:footer.page-text="{ pageStart, pageStop, itemsLength }">
        {{ pageStart }} - {{ pageStop }} {{ $t('of') }} {{ itemsLength }}
      </template>
    </v-data-table>

    <EditUserAccessDialog
      :key="`edit-${userEditDialog.key}`"
      v-model="userEditDialog.visible"
      :user="userEditDialog.user"
      @refreshUserList="updateUserList"
    />

    <SchedulingDialog
      :key="`scheduling-${userScheduleDialog.key}`"
      v-model="userScheduleDialog.visible"
      :user="userScheduleDialog.user"
      @onViewCalendar="viewCalendar"
    />

    <ExportDataDialog
      :key="`export-${userExportDialog.key}`"
      v-model="userExportDialog.visible"
      :user="userExportDialog.user"
      @onExportData="onDataRequest"
    />

    <ViewDataDialog
      :key="`view-${userViewDialog.key}`"
      v-model="userViewDialog.visible"
      :user="userViewDialog.user"
      @onViewData="onDataRequest"
    />

    <AppletPassword
      ref="appletPasswordDialog"
      v-model="appletPasswordDialog.visible"
      :hasConfirmPassword="false"
      @set-password="onAppletPassword"
    />

    <EditRoleDialog
      :key="editRoleDialog.key"
      v-model="editRoleDialog.visible"
      :employer="editRoleDialog.employer"
      @updated="onEditRoleSuccessfull"
    />
  </div>
</template>

<style scoped>
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

  .no-data {
    font-size: 14px;
    margin: 10px 0 10px 20px;
    color: rgba(0, 0, 0, .38);
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
import UserManagement from './UserManagement';
import EditUserAccessDialog from "../Utils/dialogs/EditUserAccessDialog";
import ViewDataDialog from "../Utils/dialogs/ViewDataDialog";
import SchedulingDialog from "../Utils/dialogs/SchedulingDialog";
import ExportDataDialog from "../Utils/dialogs/ExportDataDialog";
import AppletPassword from "../Utils/dialogs/AppletPassword";
import EditRoleDialog from "../Utils/dialogs/EditRoleDialog";
import { RolesMixin } from '../Utils/mixins/RolesMixin';
import encryption from "../Utils/encryption/encryption";

export default {
  name: "UserList",
  components: {
    EditUserAccessDialog,
    ViewDataDialog,
    SchedulingDialog,
    ExportDataDialog,
    AppletPassword,
    EditRoleDialog,
  },
  extends: UserManagement,
  mixins: [RolesMixin],
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
    currentRole: {
      type: String,
      required: false,
      default: 'user'
    }
  },

  data() {
    let headers = [
      {
        text: '',
        align: 'left',
        sortable: false,
        value: 'selected',
        width: 20,
      },
      {
        text: this.$i18n.t('firstName'),
        align: 'center',
        sortable: true,
        value: 'firstName',
      },
      {
        text: this.$i18n.t('lastName'),
        align: 'center',
        sortable: true,
        value: 'lastName',
      },
      {
        text: this.$i18n.t('roles'),
        align: 'center',
        sortable: false,
        value: 'roles',
      },
      {
        text: this.$i18n.t('email'),
        align: 'center',
        sortable: true,
        value: 'email',
      },
      {
        text: this.$i18n.t('pinStatus'),
        align: 'left',
        sortable: false,
        value: 'pinned',
        width: 100,
      },
      {
        text: this.$i18n.t('secretUserId'),
        align: 'left',
        sortable: true,
        value: 'MRN',
      },
      {
        text: this.$i18n.t('updated'),
        align: 'left',
        sortable: true,
        value: 'updated',
      },
      {
        text: this.$i18n.t('currentScheduleStatus'),
        align: 'left',
        sortable: false,
        value: 'currentScheduleStatus',
      },
      {
        text: '',
        align: 'left',
        sortable: false,
        value: 'refreshRequest',
        width: '10%',
      },
      {
        text: '',
        align: 'left',
        sortable: false,
        value: 'manage',
        width: '20%'
      }
    ];

    if (this.currentRole !== 'user') {
      headers = headers.filter(header =>
        header.value != 'MRN' && 
        header.value !== 'pinned'
      );
    } else {
      headers = headers.filter(header =>
        header.value !== 'firstName' &&
        header.value !== 'lastName' && 
        header.value !== 'roles' &&
        header.value !== 'email'
      )
    }

    if (!this.multiSelectionEnabled) {
      /** hide some headers in dashboard page */
      headers = headers.filter((header) => 
        header.value !== 'refreshRequest' && 
        header.value !== 'currentScheduleStatus' && 
        header.value !== 'selected' &&
        header.value !== 'roles'
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
      formattedUsers: [],
      updateUserList: null,

      shiftKeyOn: false,
      startRow: -1,
      previousEndRow: -1,
    };
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
        this.currentRole,
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
        this.startRow = -1;
        this.previousEndRow = -1;

        this.users = resp.data.items;
        this.totalUsers = resp.data.total;

        this.formattedUsers = this.currentRole == 'user' ? this.getFormattedUsers() : this.getFormattedEmployers();

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

      if (this.startRow < 0 || !this.shiftKeyOn || this.currentRole !== 'user') {
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
      if (this.currentRole === 'user') {
        this.updateUserList();
      } else {
        this.startRow = -1;
        this.previousEndRow = -1;
        this.formattedUsers = this.getFormattedEmployers();
      }
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
        let MRNs = [], user = this.users[i];
        let selected = false, pinned = false;

        for (let appletId in user) {
          let profile = user[appletId];
          const applet = this.accountApplets.find(applet => applet.id === appletId);

          MRNs.push(profile.MRN);

          pinned = profile.pinned;

          /** enable only in applet-selected page */
          if (this.currentAppletMeta) {
            if (this.currentUsers[profile['_id']]) {
              selected = true;
            }
          }
        }

        formattedUsers.push({
          MRN: MRNs.filter(function(item, pos){
            return MRNs.indexOf(item) == pos; 
          }).join(', '),
          pinned,
          ...this.getUserStatus(user),
          selected,
          id: i
        })
      }

      return formattedUsers;
    },

    getFormattedEmployers() {
      const appletRoles = {};

      const formatted = [];

      for (let applet of this.accountApplets) {
        appletRoles[applet.id] = applet.roles;
      }

      for (let i = 0; i < this.users.length; i++) {
        const employer = this.users[i];
        const data = Object.values(employer)[0];

        if (data.firstName.includes(this.searchText) || data.lastName.includes(this.searchText) || data.email.includes(this.searchText)) {
          const formattedInfo = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            roles: this.localizedRoles.filter(role => role.name != 'user' && data.roles.includes(role.name)).map(role => role.title),
            ...this.getUserStatus(employer),
            selected: false,
            id: i
          };

          if (data.roles.includes('owner')) {
            formattedInfo.roles = [this.$t('owner')];
          }

          formatted.push(formattedInfo);
        }
      }
      return formatted;
    },

    resetSelection() {
      this.$store.commit('setCurrentUsers', {});
      for (let user of this.formattedUsers) {
        user.selected = false;
      }
    },

    onEditRoleSuccessfull() {
      this.$set(this.editRoleDialog, 'visible', false);
      this.$emit('onEditRoleSuccessfull');
    }
  },
};
</script>
