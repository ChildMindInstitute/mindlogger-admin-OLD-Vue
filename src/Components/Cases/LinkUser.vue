<template>
  <div
    class="pa-6 wrapper"
  >
    <div class="new-users">
      <div class="list-title">
        Link New User:
      </div>

      <v-list
        subheader
        two-line
        flat
        class="user-list mb-4"
      >
        <template
          v-for="(applet, index) in schedulableApplets"
        >
          <div
            v-if="applet.newUsers.length"
            :key="applet.id"
          >
            <v-subheader>
              {{ applet.displayName }}
            </v-subheader>

            <v-list-item-group>
              <v-list-item
                v-for="user in applet.newUsers"
                :key="user.profileId"
                :class="user == selectedNewUser ? 'selected' : ''"
                class="mx-1"

                @click="selectedNewUser = user"
              >
                <v-list-item-content class="ml-4">
                  {{ user.MRN }}
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>

            <v-divider
              v-if="index != schedulableApplets.length - 1"
            />
          </div>
        </template>
      </v-list>
    </div>

    <div class="applets">
      <div class="list-title">
        Applets:

        <v-btn
          fab
          x-small
          color="primary"
          class="ml-4"
          :disabled="schedulableApplets.length == caseApplets.length"
          @click="onAddAppletsToCase"
        >
          <v-icon>
            mdi-plus
          </v-icon>
        </v-btn>
      </div>

      <v-list
        subheader
        two-line
        flat
        class="applet-list mb-4"
      >
        <v-list-item-group
          v-model="selectedApplets"
          multiple
        >
          <v-list-item
            v-for="applet in caseApplets"
            :key="applet.id"
          >
            <template v-slot:default="{ active, }">
              <v-list-item-action>
                <v-checkbox
                  :input-value="active"
                  color="primary"
                />
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ applet.displayName }}</v-list-item-title>
              </v-list-item-content>
            </template>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <div class="list-actions">
        <v-btn
          color="primary"
          @click="selectAllApplets"
        >
          {{ $t('selectAll') }}
        </v-btn>

        <v-btn
          color="primary"
          @click="linkUser"
        >
          {{ $t('link') }}
        </v-btn>
      </div>
    </div>

    <v-spacer />

    <div class="linked-users">
      <div class="list-title">
        Current Linked Users:
      </div>

      <v-list
        subheader
        two-line
        flat
        class="applet-list mb-4"
      >
        <v-list-item-group>
          <v-list-item
            v-for="user in linkedUsers"
            :key="user.id"
            :class="user == selectedLinkedUser ? 'selected' : ''"
            class="ma-1"
            @click="selectedLinkedUser = user"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ user.MRN }}

                <span class="more-info">
                  ({{ user.applets.length }} applet{{ user.applets.length > 1 ? 's' : '' }})
                </span>
              </v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-btn
                icon
                @click="caseUserEditDialog=true"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <div class="list-actions">
        <v-btn
          color="primary"
          @click="unLinkUser"
        >
          {{ $t('unlink') }}
        </v-btn>
      </div>
    </div>

    <InformationDialog
      v-model="information.visible"
      :title="information.dialogTitle"
      :dialog-text="information.dialogText"
    />

    <CaseUserEditDialog
      v-model="caseUserEditDialog"
      :case-applets="caseApplets"
      :user-applets="selectedLinkedUser && selectedLinkedUser.applets || []"
      :entries="entries"
      @change="editLinkedUser"
    />

    <AppletPassword
      ref="casePasswordDialog"
      v-model="casePasswordDialog"
      :default-title="$t('casePassword')"
      :has-confirm-password="false"
      @set-password="setCasePassword"
    />

    <CaseAppletAddDialog
      v-model="caseAppletAddDialog"
      :passwords="passwords"
      :case-password="casePassword"
      :case-applets="caseApplets"
      @updatePassword="updatePassword"
      @submit="addAppletsToCase"
    />
  </div>
</template>

<style scoped>
.user-list, .applet-list {
  outline: auto gray;
  height: 400px;
  overflow-y: scroll;
}

.wrapper {
  display: flex;
  margin: auto;
  max-width: 1120px;
}

.new-users, .applets {
  width: 22%;
  max-width: 320px;
}

.linked-users {
  width: 32%;
  max-width: 350px;
}

.new-users, .applets, .linked-users {
  margin: 0px 20px;
}

.list-title {
  margin-bottom: 10px;
}

.selected {
  background: rgb(228, 237, 247);
}

.list-actions {
  display: flex;
  justify-content: space-between;
}

.more-info {
  margin-left: 10px;
}

</style>

<script>
import { CaseMixin } from "../Utils/mixins/CaseMixin";
import api from "../Utils/api/api";
import encryption from "../Utils/encryption/encryption";
import InformationDialog from "../Utils/dialogs/InformationDialog";
import CaseUserEditDialog from "../Utils/dialogs/CaseUserEditDialog";
import AppletPassword from "../Utils/dialogs/AppletPassword";
import CaseAppletAddDialog from "../Utils/dialogs/CaseAppletAddDialog";

export default {
  components: {
    InformationDialog,
    CaseUserEditDialog,
    AppletPassword,
    CaseAppletAddDialog
  },

  mixins: [CaseMixin],

  props: {
    loading: {
      type: Boolean,
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
      loadingMRNs: true,
      accountUsers: [],

      selectedNewUser: null,
      selectedLinkedUser: null,
      schedulableApplets: [],
      selectedApplets: [],

      information: {
        visible: false,
        dialogTitle: '',
        dialogText: ''
      },

      caseUserEditDialog: false,
      casePasswordDialog: false,
      caseAppletAddDialog: false,
    }
  },

  computed: {
    caseApplets () {
      const applets = [];

      if (this.currentCase.applets) {
        for (let appletId of this.currentCase.applets) {
          const applet = this.schedulableApplets.find(applet => applet.id == appletId)

          if (applet) {
            applets.push(applet)
          }
        }
      }

      return applets
    },

    apiHost () {
      return this.$store.state.backend;
    },

    token () {
      return this.$store.state.auth.authToken.token;
    }
  },

  watch: {
    loading() {
      if (!this.loading) {
        this.onLoad();
      }
    }
  },

  methods: {
    onLoad () {
      api.getAccountUserList({
        apiHost: this.apiHost,
        token: this.token,
        role: 'user',
        MRN: '',
        pagination: {
          allow: false
        },
        sort: {
          allow: false
        }
      }).then(resp => {
        this.schedulableApplets = this.getSchedulableApplets(
          this.getFormattedUsers(resp.data.items)
        )

        this.accountUsers = resp.data.items;
        this.loadingMRNs = false;
      })
    },

    getSchedulableApplets (users) {
      const newUsers = {};

      for (let user of users) {
        if (!user.linked) {
          newUsers[user.appletId] = newUsers[user.appletId] || [];
          newUsers[user.appletId].push(user);
        }
      }

      return this.accountApplets.filter(
        applet => applet.roles.includes('coordinator') || applet.roles.includes('manager')
      ).map(applet => ({
        ...applet,
        newUsers: ( newUsers[applet.id] || [] ),
      }))
    },

    getFormattedUsers (users) {
      const formattedUsers = [];

      const selectedUsers = {};

      for (let user of this.linkedUsers) {
        for (let i = 0; i < user.applets.length; i++) {
          selectedUsers[user.applets[i].profileId] = true;
        }
      }

      for (let i = 0; i < users.length; i++) {
        let linked = false;

        for (const appletId in users[i]) {
          if (selectedUsers[users[i][appletId]._id]) {
            linked = true;
            break;
          }
        }

        for (const appletId in users[i]) {
          const applet = this.accountApplets.find(
            applet => applet.id === appletId && ( applet.roles.includes('manager') || applet.roles.includes('coordinator') )
          );
          const profile = users[i][appletId];

          if (!profile.fake)
          {
            formattedUsers.push(
              {
                index: i,
                appletId,
                appletName: applet.displayName,
                MRN: profile.MRN,
                profileId: profile._id,
                linked
              }
            )
          }
        }
      }

      return formattedUsers
    },

    selectAllApplets () {
      this.selectedApplets = []

      for (let i = 0; i < this.schedulableApplets.length; i++) {
        this.selectedApplets.push(i)
      }
    },

    linkUser () {
      if (!this.selectedNewUser || !this.selectedApplets.length) {
        this.$set(this, 'information', {
          visible: true,
          dialogTitle: this.$t('failedToLink'),
          dialogText: this.$t('selectUserAndApplets')
        })

        return ;
      }

      api.linkUser(
        this.apiHost,
        this.token,
        this.currentCase._id,
        this.selectedNewUser.profileId,
        this.selectedApplets.map(index => this.schedulableApplets[index].id),
        this.selectedNewUser.MRN
      ).then(resp => {
        const linkedUser = resp.data;

        this.$store.commit('linkNewUser', linkedUser);

        const linkedAccounts = []

        for (let i = 0; i < this.accountUsers.length; i++) {
          const profiles = Object.values(this.accountUsers[i])

          // a user might have several applet profiles
          for (let profile of profiles) {
            if (linkedUser.applets.some(applet => applet.profileId == profile._id)) {
              linkedAccounts.push(i);
              break;
            }
          }
        }

        for (let applet of this.schedulableApplets) {
          for (let i = 0; i < applet.newUsers.length; i++) {
            if (linkedAccounts.includes(applet.newUsers[i].index)) {
              applet.newUsers.splice(i, 1);
              break;
            }
          }
        }
      })
    },

    unLinkUser () {
      if (!this.selectedLinkedUser) {
        this.$set(this, 'information', {
          visible: true,
          dialogTitle: this.$t('failedToUnlink'),
          dialogText: this.$t('selectUser')
        })

        return ;
      }

      api.unlinkUser(this.apiHost, this.token, this.currentCase._id, this.selectedLinkedUser._id).then(() => {
        const index = this.linkedUsers.indexOf(this.selectedLinkedUser);

        if (index >= 0) {
          this.$store.commit('unlinkUser', index);
          this.selectedLinkedUser = null;
        }
      })
    },

    editLinkedUser (applets) {
      api.updateLinkedUser(this.apiHost, this.token, this.currentCase._id, this.selectedLinkedUser._id, applets).then(resp => {
        const index = this.linkedUsers.indexOf(this.selectedLinkedUser);

        if (index >= 0) {
          this.$store.commit('updateLinkedUser', {
            index,
            obj: resp.data
          })
        }
      }).finally(() => {
        this.caseUserEditDialog = false
      })
    },

    onAddAppletsToCase () {
      if (this.casePassword) {
        this.caseAppletAddDialog = true;
      } else {
        this.casePasswordDialog = true;
      }
    },

    setCasePassword (password) {
      try {
        const decrypted = encryption.decryptData({ text: this.currentCase.password, key: encryption.getHashed(password) })

        this.$emit('updatePasswords', JSON.parse(decrypted));
        this.$emit('setCasePassword', password);
        this.casePasswordDialog = false;
        this.caseAppletAddDialog = true;
      } catch (e) {
        this.$refs.casePasswordDialog.defaultErrorMsg = this.$t('incorrectCasePassword');
      }
    },

    updatePassword ({ appletId, password }) {
      this.$emit('updatePasswords', {
        ...this.passwords,
        [appletId]: password
      });
    },

    addAppletsToCase ({ applets, form }) {
      this.caseAppletAddDialog = false;

      api.addAppletsToCase(this.apiHost, this.token, this.currentCase._id, applets, form).then(resp => {
        this.$store.commit('setCurrentCase', {
          ...resp.data,
          entries: this.entries,
          users: this.linkedUsers
        });

        this.$set(this, 'information', {
          visible: true,
          dialogTitle: this.$t('caseUpdate'),
          dialogText: this.$t('caseUpdateSuccess', { name: this.currentCase.caseId })
        })
      })
    }
  }
}
</script>
