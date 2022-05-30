<template>
  <div>
    <div class="case-header pt-5">
      <div class="data-filter">
        <v-text-field
          v-model="searchText"
          :label="$t('searchCases')"
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
        @click="createCaseDialog = true"
      >
        <v-icon
          class="mr-2"
          dark
        >
          mdi-plus
        </v-icon>

        {{ $t('newCase') }}
      </v-btn>
    </div>

    <div class="d-flex">
      <v-data-table
        style="width: 100%"
        :headers="headers"
        :items="formattedCases"
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
          <tr>
            <template
              v-for="header in headers"
            >
              <td
                v-if="header.value != 'actions'"
                :key="header.value"
              >
                {{ item[header.value] }}
              </td>

              <td
                v-else
                :key="header.value"
              >
                <div class="actions">
                  <v-tooltip
                    v-if="item.editable || item.exportable"
                    top
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        @click.stop="onViewCase(item)"
                      >
                        <v-icon> mdi-format-list-bulleted </v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('viewCase') }}</span>
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
                        @click.stop="onDeleteCase(item)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('deleteCase') }}</span>
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

    <CreateCaseDialog
      v-model="createCaseDialog"
      @create="createCase"
    />

    <LinkCaseUserDialog
      v-model="linkCaseUserDialog.visible"
      :passwords="passwords"
      :case-password="linkCaseUserDialog.password"
      :case-id="linkCaseUserDialog.case && linkCaseUserDialog.case.caseId || ''"
      @link="linkCaseUser"
      @updatePassword="updatePassword"
    />

    <ConfirmationDialog
      v-model="caseDeleteDialog.visible"
      :dialogText="$t('confirmDeleteCase', { name: caseDeleteDialog.caseId })"
      :title="$t('deleteCase')"
      @onOK="deleteCase"
    />

    <AppletPassword
      ref="casePasswordDialog"
      v-model="casePasswordDialog.visible"
      :default-title="$t('casePassword')"
      :has-confirm-password="false"
      @set-password="setCasePassword"
    />
  </div>
</template>

<style scoped>
  .case-header {
    display: flex;
    justify-content: space-between;
  }

  .data-filter {
    width: 25%;
    padding-left: 5px;
  }

  tr {
    cursor: pointer;
    user-select: none;
  }

  tr:hover {
    background-color: #f0f0f0;
  }

  tr .actions {
    display: none;
  }

  tr:hover .actions {
    display: block;
  }
</style>

<script>
import CreateCaseDialog from "../Utils/dialogs/CreateCaseDialog";
import LinkCaseUserDialog from "../Utils/dialogs/LinkCaseUserDialog";
import ConfirmationDialog from "../Utils/dialogs/ConfirmationDialog";
import AppletPassword from "../Utils/dialogs/AppletPassword";
import encryption from "../Utils/encryption/encryption";
import { CaseMixin } from "../Utils/mixins/CaseMixin";
import api from "../Utils/api/api";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/fr';
TimeAgo.addLocale(en);
TimeAgo.addLocale(fr);

export default {
  components: {
    CreateCaseDialog,
    LinkCaseUserDialog,
    ConfirmationDialog,
    AppletPassword,
  },
  mixins: [ CaseMixin ],
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    cases: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      searchText: '',
      headers: [
        {
          text: this.$i18n.t('caseId'),
          align: 'left',
          sortable: true,
          value: 'caseId',
          isPrimaryColumn: true,
          width: '30%',
        },
        {
          text: this.$i18n.t('updated'),
          align: 'left',
          sortable: true,
          value: 'timeAgo',
          width: '15%'
        },
        {
          text: this.$i18n.t('actions'),
          align: 'left',
          sortable: false,
          value: 'actions'
        }
      ],
      createCaseDialog: false,
      linkCaseUserDialog: {
        visible: false,
        password: '',
        case: null,
        profileId: '',
      },
      passwords: {},
      timeAgo: new TimeAgo(this.$i18n.locale.replace('_', '-')),
      caseDeleteDialog: {
        visible: false,
        caseId: '',
        id: ''
      },
      casePasswordDialog: {
        visible: false,
        item: null
      }
    }
  },

  computed: {
    accountApplets () {
      return this.$store.state.currentAccount.applets;
    },

    formattedCases () {
      return this.cases.map(obj => {
        const editable = !obj.applets.length || this.accountApplets.find(applet => applet.roles.includes('coordinator') && obj.applets.includes(applet.id));
        const exportable = this.accountApplets.find(applet => applet.roles.includes('reviewer') && obj.applets.includes(applet.id));
        const deletable = this.accountApplets.find(applet => applet.roles.includes('manager') && (obj.applets.includes(applet.id) || !obj.applets.length));

        return {
          ...obj,
          timeAgo: this.timeAgo.format(new Date(obj.updated), 'round'),
          editable,
          exportable,
          deletable
        }
      }).filter(obj => obj.caseId.includes(this.searchText))
    }
  },

  methods: {
    onViewCase (item) {
      this.$store.commit('setCurrentCase', this.cases.find(obj => obj._id == item._id));
      this.$router.push(`case/${item._id}/dashboard`).catch(err => {});
    },

    onExportData (item) {
      for (const appletId of item.applets) {
        if (!this.passwords[appletId]) {
          this.casePasswordDialog.visible = true;
          this.casePasswordDialog.item = item;
          return ;
        }
      }

      let processes = Promise.resolve();

      this.$store.commit('setCurrentUsers', {});

      for (const appletId of item.applets) {
        processes = processes.then(() => this.setAppletPrivateKey(appletId, this.passwords[appletId]).then(() => {
          const applet = this.accountApplets.find(applet => applet.id === appletId);
          return this.exportUserData(applet, null, item._id);
        }));
      }
    },

    setCasePassword (password) {
      try {
        const decrypted = encryption.decryptData({ text: this.casePasswordDialog.item.password, key: encryption.getHashed(password) })

        this.casePasswordDialog.visible = false;
        Object.assign(this.passwords, JSON.parse(decrypted));

        this.onExportData(this.casePasswordDialog.item);
      } catch (e) {
        this.$refs.casePasswordDialog.defaultErrorMsg = this.$t('incorrectCasePassword');
      }
    },

    onDeleteCase (item) {
      this.$set(this, 'caseDeleteDialog', {
        visible: true,
        caseId: item.caseId,
        id: item._id
      })
    },

    deleteCase () {
      return api.deleteCase(this.apiHost, this.token, this.caseDeleteDialog.id).then(() => {
        this.$emit('onStatusUpdated', {
          message: this.$t('caseDeleteSuccess', { name: this.caseDeleteDialog.caseId }),
          title: this.$t('deleteCase')
        })

        this.$emit('refreshCaseList')
      })
    },

    createCase ({ caseID, password, index, appletId, profileId }) {
      const pass = encryption.encryptData({ text: JSON.stringify({}), key: encryption.getHashed(password) })
      const form = new FormData();
      form.set(
        'password',
        JSON.stringify(pass)
      );

      api.createCase(
        this.apiHost,
        this.token,
        caseID,
        form,
        []
      ).then(resp => {
        this.createCaseDialog = false;

        if (appletId) {
          this.$set(this, 'linkCaseUserDialog', {
            visible: true,
            password: password,
            case: resp.data,
            profileId
          })
        } else {
          this.$emit('onStatusUpdated', {
            message: this.$t('caseCreateSuccess', { name: resp.data.caseId }),
            title: this.$t('caseSuccess')
          })
        }

        this.$emit('refreshCaseList');
      }).catch(() => {
        this.createCaseDialog = false;
        this.$emit('onStatusUpdated', {
          message: this.$t('caseAlreadyExists'),
          title: this.$t('caseFailed')
        })
      })
    },

    linkCaseUser ({ form, applets }) {
      const caseId = this.linkCaseUserDialog.case._id;

      api.addAppletsToCase(this.apiHost, this.token, caseId, applets, form).then(
        () => api.linkUser(
          this.apiHost,
          this.token,
          caseId,
          this.linkCaseUserDialog.profileId,
          applets,
          this.linkCaseUserDialog.case.caseId
        )
      ).then(() => {
        this.linkCaseUserDialog.visible = false;
        this.$emit('onStatusUpdated', {
          message: this.$t('caseUpdateSuccess', { name: this.linkCaseUserDialog.case.caseId }),
          title: this.$t('caseUpdate')
        })
      })
    },

    updatePassword ({ appletId, password }) {
      this.$set(this.passwords, appletId, password)
    },
  }
}
</script>
