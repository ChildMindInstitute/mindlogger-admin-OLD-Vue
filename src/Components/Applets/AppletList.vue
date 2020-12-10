<template>
  <div>
    <div class="filter">
      <v-text-field
        v-model="searchText"
        :label="$t('searchApplets')"
        prepend-inner-icon="mdi-magnify"
        class="search-input"
        outlined
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="formattedApplets"
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
            <span v-if="header.value == 'manage' && selectedRow === item.id">
              <span class="laptop-only">
                <!-- view users -->
                <v-tooltip
                  v-if="item.roles.includes('coordinator') || item.roles.includes('reviewer') || item.roles.includes('manager')"
                  top
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="onViewUsers(item)"
                    >
                      <v-icon>mdi-account-multiple</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('viewUsers') }}</span>
                </v-tooltip>

                <!-- view calendar -->
                <v-tooltip
                  v-if="item.roles.includes('coordinator') || item.roles.includes('manager')"
                  top
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="onViewGeneralCalendar(item)"
                    >
                      <v-icon>mdi-calendar-month</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('viewCalendar') }}</span>
                </v-tooltip>

                <!-- edit applet -->
                <v-tooltip
                  v-if="item.roles.includes('editor') || item.roles.includes('manager')"
                  top
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="onEditApplet(item)"
                    >
                      <v-icon>mdi-square-edit-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>{{$t('editApplet')}}</span>
                </v-tooltip>

                <!-- delete applet -->
                <v-tooltip
                  v-if="item.roles.includes('manager')"
                  top
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="onDeleteApplet(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('deleteApplet') }}</span>
                </v-tooltip>

                <!-- duplicate applet -->
                <v-tooltip
                  v-if="item.roles.includes('editor') || item.roles.includes('manager')"
                  top
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="onDuplicateApplet(item)"
                    >
                      <v-icon>mdi-content-duplicate</v-icon>
                    </v-btn>
                  </template>
                  <span>{{$t('duplicateApplet')}}</span>
                </v-tooltip>

                <!-- refresh applet -->
                <v-tooltip
                  v-if="item.hasUrl && (item.roles.includes('editor') || item.roles.includes('manager'))"
                  top
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="onRefreshApplet(item)"
                    >
                      <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                  </template>
                  <span>{{$t('refreshApplet')}}</span>
                </v-tooltip>

                <!-- transfer ownership -->
                <v-tooltip
                  v-if="item.roles.includes('owner')"
                  top
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="onTransferOwnership(item)"
                    >
                      <v-icon>mdi-transfer</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('transferOwnership') }}</span>
                </v-tooltip>
              </span>

              <span class="laptop-hidden">
                <v-menu offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="primary"
                      dark
                      v-bind="attrs"
                      v-on="on"
                    >
                      {{ $t('manage') }}
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-if="item.roles.includes('reviewer') || item.roles.includes('manager')"
                      @click="onViewUsers(item)"
                    >
                      <v-list-item-title>{{$t('viewUsers')}}</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      v-if="item.roles.includes('coordinator') || item.roles.includes('manager')"
                      @click="onViewGeneralCalendar(item)"
                    >
                      <v-list-item-title>{{$t('viewCalendar')}}</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      v-if="item.roles.includes('editor') || item.roles.includes('manager')"
                      @click="onEditApplet(item)"
                    >
                      <v-list-item-title>{{$t('editApplet')}}</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      v-if="item.roles.includes('manager')"
                      @click="onDeleteApplet(item)"
                    >
                      <v-list-item-title>{{$t('deleteApplet')}}</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      v-if="item.roles.includes('editor') || item.roles.includes('manager')"
                      @click="onDuplicateApplet(item)"
                    >
                      <v-list-item-title>{{ $t('duplicateApplet') }}</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      v-if="item.hasUrl && (item.roles.includes('editor') || item.roles.includes('manager'))"
                      @click="onRefreshApplet(item)"
                    >
                      <v-list-item-title>{{ $t('refreshApplet') }}</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      v-if="item.roles.includes('owner')"
                      @click="onTransferOwnership(item)"
                    >
                      <v-list-item-title>{{$t('transferOwnership')}}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </span>
            </span>
            <span v-else-if="header.value == 'updated'">
              {{ item.timeAgo }}
            </span>
            <span v-else>{{ item[header.value] }}</span>
          </td>
        </tr>
      </template>

      <template v-slot:footer.page-text="{ pageStart, pageStop, itemsLength }">
        {{ pageStart }} - {{ pageStop }} {{ $t('of') }} {{ itemsLength }}
      </template>
    </v-data-table>

    <ConfirmationDialog
      v-model="appletDeleteDialog"
      :dialogText="deleteAppletDialogText"
      :title="deleteAppletDialogTitle"
      @onOK="deleteApplet"
    />

    <ConfirmationDialog
      v-model="appletEditDialog"
      :dialogText="$t('appletEditAlert')"
      :title="$t('appletEdit')"
      @onOK="editApplet"
    />

    <AppletName
      ref="appletNameDialog"
      v-model="appletDuplicateDialog"
      @set-value="onSetAppletDuplicateName"
    />

    <v-dialog
      v-model="ownershipDialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t('transferAppletOwnership') }}</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="ownershipEmail"
                class="ownershipField"
                :label="$t('ownerEmail')"
                required
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click="ownershipDialog = false"
          >
            {{ $t('close') }}
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="!emailRules.test(ownershipEmail)"
            @click="transferOwnership"
          >
            {{ $t('submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AppletPassword
      v-model="appletPasswordDialog"
      :hasConfirmPassword="true"
      @set-password="onClickSubmitPassword"
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

  @media only screen and (min-width: 1200px) {
    .laptop-hidden {
      display: none;
    } 
  }
  @media only screen and (max-width: 1199px ) {
    .laptop-only {
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
import encryption from "../Utils/encryption/encryption.vue";
import AppletName from "../Utils/dialogs/AppletName";
import ConfirmationDialog from '../Utils/dialogs/ConfirmationDialog';
import AppletPassword from "../Utils/dialogs/AppletPassword.vue";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/fr';

TimeAgo.addLocale(en);
TimeAgo.addLocale(fr);

export default {
  name: "AppletList",
  components: {
    AppletName,
    ConfirmationDialog,
    AppletPassword,
  },
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    applets: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      appletPasswordDialog: false,
      requestedAction: null,
      headers: [
        {
          text: this.$i18n.t('appletName'),
          align: 'center',
          sortable: true,
          value: 'name',
          width: '25%',
        },
        {
          text: this.$i18n.t('lastEdit'),
          align: 'center',
          sortable: true,
          value: 'updated',
          width: '30%'
        },
        {
          text: '',
          align: 'center',
          sortable: false,
          value: 'manage'
        }
      ],
      searchText: '',
      appletDuplicateDialog: false,
      appletEditDialog: false,
      appletDeleteDialog: false,
      ownershipDialog: false,
      ownershipEmail: '',
      emailRules: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
      newProtocolUrl: "",
      appletUploadDialog: false,
      timeAgo: new TimeAgo(this.$i18n.locale.replace('_', '-')),
      selectedRow: null,
    }
  },
  computed: {
    deleteAppletDialogTitle() {
      return this.$t('deleteApplet');
    },
    deleteAppletDialogText() {
      return this.$t('deleteAppletConfirmation');
    },
    accountApplets() {
      return this.$store.state.currentAccount.applets;
    },
    formattedApplets() {
      const formatted = [];
      for (let applet of this.applets) {
        if (applet.name.includes(this.searchText)) {
          formatted.push({
            ...applet,
            timeAgo: this.timeAgo.format(new Date(applet.updated), 'round')
          })
        }
      }
      return formatted;
    },
    currentApplet: {
      get() {
        return this.$store.state.currentAppletMeta;
      },
      set(applet) {
        this.$store.commit('setCurrentApplet', applet);
      }
    }
  },
  methods: {
    rowClicked(row) {
      this.selectedRow = row.id;
    },
    setAppletPassword(appletPassword) {
      let apiHost = this.$store.state.backend;
      let token = this.$store.state.auth.authToken.token;
      let appletId = this.selectedRow;

      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword: appletPassword,
        accountId: this.$store.state.currentAccount.accountId,
      });

      const encryptionForm = new FormData();
      encryptionForm.set(
        "encryption",
        JSON.stringify({
          appletPublicKey: Array.from(encryptionInfo.getPublicKey()),
          appletPrime: Array.from(encryptionInfo.getPrime()),
          base: Array.from(encryptionInfo.getGenerator()),
        })
      );

      api
        .setAppletEncryption({
          token,
          apiHost,
          data: encryptionForm,
          appletId,
        })
        .then(() =>
          api.getApplet({
            token,
            apiHost,
            id: appletId,
            allEvent: this.accountApplets.find(
              (value) => value.id == appletId
            ).allEvent,
          })
        )
        .then((resp) => {
          this.$store.commit("updateAppletData", resp.data);
          this.$emit("onAppletPasswordChanged");
        });
    },

    transferOwnership() {
      api
        .transferOwnership({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.selectedRow,
          email: this.ownershipEmail,
        })
        .then((resp) => {
          this.ownershipDialog = false;
          this.$emit("onOwnerShipInviteSuccessful", this.ownershipEmail);
        })
        .catch((err) => {
          this.$emit("onOwnerShipInviteError");
        });
    },

    deleteApplet() {
      api
        .deleteApplet({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.selectedRow,
        })
        .then((resp) => {
          this.$emit("refreshAppletList");
        });
    },

    editApplet() {
      this.currentApplet = this.formattedApplets.find(applet => applet.id === this.selectedRow);
      this.$router.push({
        name: 'Builder',
        params: { isEditing: true },
      }).catch(err => {});
    },

    onClickSubmitPassword(appletPassword) {
      this.appletPasswordDialog = false;
      this.requestedAction(appletPassword);
    },

    onSetAppletDuplicateName(appletName) {
      api
        .duplicateApplet({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.selectedRow,
          options: {
            name: appletName,
          },
        })
        .then((resp) => {
          this.appletDuplicateDialog = false;
          this.$emit('onDuplicateRequestReceived', resp.data.message);
        });
    },
    onUpdateAppletPassword() {
      this.appletPasswordDialog = true;
      this.requestedAction = this.setAppletPassword.bind(this);
    },
    onTransferOwnership(applet) {
      this.ownershipDialog = true;
    },
    onViewUsers(applet) {
      if (
        applet.roles.includes('owner') &&
        !applet.encryption
      ) {
        this.onUpdateAppletPassword();
      } else {
        this.currentApplet = applet;
        this.$router.push(`applet/${this.currentApplet.id}/users`).catch(err => {});
      }
    },
    onDeleteApplet(applet) {
      this.appletDeleteDialog = true;
    },
    onEditApplet(applet) {
      if (applet.hasUrl) {
        this.appletEditDialog = true;
      } else {
        this.editApplet();
      }
    },
    onViewGeneralCalendar(applet) {
      if (
        applet.roles.includes('owner') && !applet.encryption
      ) {
        this.onUpdateAppletPassword();
      } else {
        this.currentApplet = applet;

        this.$store.commit('setCurrentUsers', {});
        this.$router.push(`applet/${this.currentApplet.id}/schedule`).catch(err => {});
      }
    },
    onDuplicateApplet(applet) {
      api
        .validateAppletName({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          name: `${applet.name} (1)`
        })
        .then(resp => {
          this.appletDuplicateDialog = true;
          this.$refs.appletNameDialog.appletName = resp.data;
        })
    },
    onRefreshApplet(applet) {
      api
        .refreshApplet({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: applet.id,
        })
        .then((resp) => {
          this.$emit("onRefreshAppletRequestReceived", resp.data.message);
        });
    },
  },
};
</script>
