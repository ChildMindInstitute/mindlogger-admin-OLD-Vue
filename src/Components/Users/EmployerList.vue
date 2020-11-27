<template>
  <div>
    <div class="filter">
      <v-text-field
        v-model="searchText"
        :label="$t('searchOrganizers')"
        prepend-inner-icon="mdi-magnify"
        class="search-input"
        outlined
      />

      <span>{{ $t("search") }}</span>
    </div>

    <v-data-table
      :headers="headers"
      :items="formattedEmployers"
      :loading="loading"
      :footer-props="{
        itemsPerPageText: $t('rowsPerPage'),
        itemsPerPageAllText: $t('all'),
      }"
    >
      <template v-slot:body="props">
        <tr
          v-for="item in props.items"
          :key="item.id"
          :class="selectedRow === item.id ? 'selected' : ''"
          @click="rowClicked(item)"
        >
          <td
            v-for="header in headers"
            :key="header.text"
            class="cell"
          >
            <span v-if="header.value == 'edit' && selectedRow === item.id">
              <!-- edit access -->
              <v-tooltip
                v-if="item.editable.length"
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
            <span v-else>{{ item[header.value] }}</span>
          </td>
        </tr>
      </template>

      <template v-slot:footer.page-text="{ pageStart, pageStop, itemsLength }">
        {{ pageStart }} - {{ pageStop }} {{ $t('of') }} {{ itemsLength }}
      </template>
    </v-data-table>

    <EditRoleDialog
      :key="editRoleDialog.key"
      v-model="editRoleDialog.visible"
      :employer="editRoleDialog.employer"
      @updated="onEditRoleSuccessfull"
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
import EditRoleDialog from "../Utils/dialogs/EditRoleDialog";

export default {
  name: "EmployerList",
  components: {
    EditRoleDialog,
  },
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    role: {
      type: String,
      required: true
    },
    employers: {
      type: Array,
      required: true
    },
    hasRoleColumn: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    let headers = [
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
        text: 'Roles',
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
          text: '',
          align: 'center',
          sortable: false,
          value: 'edit',
          width: '10%',
      }
    ];

    if (!this.hasRoleColumn) {
      headers = headers.filter(header => header.text != 'Roles');
    }
    return {
      headers,
      searchText: '',
      editRoleDialog: {
        visible: false,
        employer: {},
        key: 0
      },
      selectedRow: null,
    };
  },
  computed: {
    accountApplets() {
      return this.$store.state.currentAccount.applets;
    },
    formattedEmployers() {
      const appletRoles = {};

      const formatted = [];

      for (let applet of this.accountApplets) {
        appletRoles[applet.id] = applet.roles;
      }

      for (let i = 0; i < this.employers.length; i++) {
        const employer = this.employers[i];
        const data = Object.values(employer)[0];
        let editable = [];

        for (let appletId in employer) {
          let profile = employer[appletId];

          /** managers' roles are editable by only owner */
          if (!profile.roles.includes('owner') && (!profile.roles.includes('manager') || appletRoles[appletId].includes('owner'))) {
            editable.push(appletId);
          }
        }

        if (data.firstName.includes(this.searchText) || data.lastName.includes(this.searchText) || data.email.includes(this.searchText)) {
          formatted.push({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            roles: data.roles,
            editable,
            id: i
          });
        }
      }

      return formatted;
    },
  },
  methods: {
    rowClicked(row) {
      this.selectedRow = row.id;
    },
    onEditAccess(item) {
      this.$set(this, 'editRoleDialog', {
        visible: true,
        employer: this.employers[item.id],
        key: this.editRoleDialog.key+1
      });
    },

    onEditRoleSuccessfull() {
      this.$set(this.editRoleDialog, 'visible', false);
      this.$emit('onEditRoleSuccessfull');
    }
  },
};
</script>
