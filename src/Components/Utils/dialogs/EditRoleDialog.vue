<template>
  <v-dialog
    :value="value"
    max-width="500px"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title class="edit-card-title">
        {{ name }} ({{ email }})
      </v-card-title>

      <v-card-text>
        <v-expansion-panels
          v-model="panel"
          focusable
        >
          <v-expansion-panel
            v-for="profile in profileList"
            :key="profile.appletId"
            :disabled="!profile.editable"
          >
            <v-expansion-panel-header>
              {{ profile.appletName }}
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <div class="content-title">
                Applet Roles:
              </div>

              <v-combobox
                v-model="profile.roles"
                :items="allRoles"
                hide-selected
                label="Search Roles"
                multiple
                small-chips
                solo
              >
                <template v-slot:selection="{ attrs, item, parent, selected }">
                  <v-chip
                    v-bind="attrs"
                    :color="`lighten-3`"
                    :input-value="selected"
                    label
                    small
                  >
                    <span
                      v-if="item.name != 'reviewer'"
                      class="pr-2"
                    >
                      {{ item.title }}
                    </span>
                    <span v-else>
                      {{$t('reviewerFor')}}: <span
                        class="reviewer-button"
                        @click.stop="onOpenReviewerDialog"
                      >{{$t('clickHere')}}</span>
                    </span>
                    <v-icon
                      small
                      @click="parent.selectItem(item)"
                    >
                      close
                    </v-icon>
                  </v-chip>
                </template>
              </v-combobox>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          text
          @click="$emit('input', false)"
        >
          {{ $t('close') }}
        </v-btn>
        <v-btn
          color="primary"
          text
          @click="onSaveUserRole()"
        >
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <MRNSelectionDialog
      :key="reviewerDialogKey"
      v-model="reviewerRoleDialog"
      :profile="selectedProfile"
      @onSaveMRNList="onSaveMRNList"
      @onCloseMRNDialog="onCloseMRNDialog"
    />
  </v-dialog>
</template>

<style scoped>
  .reviewer-button {
    cursor: pointer;
    border: 1px solid white;
    border-radius: 10%;
  }

  .content-title {
    margin: 10px 0px;
  }
</style>

<script>
  import { rolesMixin } from '../../Users/rolesMixin';
  import MRNSelectionDialog from './MRNSelectionDialog';
  import api from "../api/api";

  const MAX_USER_NUMBER = 20;

  export default {
    name: 'EditRoleDialog',
    components: {
      MRNSelectionDialog
    },
    mixins: [rolesMixin],
    props: {
      employer: {
        type: Object,
        required: true,
      },
      value: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      let name = Object.keys(this.employer).length > 0 && Object.values(this.employer)[0].firstName || '';
      let email = Object.keys(this.employer).length > 0 && Object.values(this.employer)[0].email || '';

      return {
        name,
        email,
        allRoles: [],
        profileList: [],

        panel: 0,
        reviewerRoleDialog: false,
        selectedProfile: {},
        reviewerDialogKey: 0
      }
    },
    beforeMount() {
      const currentAccount = this.$store.state.currentAccount;

      this.allRoles = this.localizedRoles.filter(role => role.name != 'owner').map(role => ({
        text: role.title,
        ...role
      }));

      for (let appletId in this.employer) {
        const applet = currentAccount.applets.find(applet => applet.id === appletId);

        this.profileList.push({
          appletId,
          editable: !this.employer[appletId].roles.includes('manager') || applet.roles.includes('owner'),
          appletName: applet.name,
          ...this.employer[appletId],
          roles: this.employer[appletId].roles.map(role => this.allRoles.find(localized => localized.name === role))
        });
      }
    },
    methods: {
      onSaveUserRole() {
        const apiHost = this.$store.state.backend;
        const token = this.$store.state.auth.authToken.token;
        const tasks = [];

        for (let profile of this.profileList) {
          const newRoles = profile.roles.map(role => role.name);
          const oldRoles = this.employer[profile.appletId].roles;

          const roleInfo = newRoles.reduce((roleInfo, role) => ({
            ...roleInfo,
            [role]: role != 'reviewer' ? 1 : (profile.userList || []),
          }), {});

          for (let role of oldRoles) {
            if (roleInfo[role] !== undefined) {
              delete roleInfo[role];
            } else {
              roleInfo[role] = 0;
            }
          }

          if (profile.userListEdited && roleInfo['reviewer'] === undefined) {
            roleInfo['reviewer'] = profile.userList || [];
          }

          if (Object.keys(roleInfo).length) {
            tasks.push(api.updateUserRoles({ apiHost, token, appletId: profile.appletId, userId: profile['_id'], roleInfo }));
          }
        }

        Promise.all(tasks).then(() => {
          this.$emit('updated');
        });
      },
      onOpenReviewerDialog() {
        this.selectedProfile = this.profileList[this.panel];

        const appletId = this.selectedProfile.appletId;
        const reviewerId = this.selectedProfile['_id'];

        if (!this.selectedProfile.userList && this.employer[appletId].roles.includes('reviewer')) {
          const apiHost = this.$store.state.backend;
          const token = this.$store.state.auth.authToken.token;

          this.selectedProfile.userList = [];

          api.getUserList({ apiHost, token, appletId, reviewerId }).then((resp) => {
            this.selectedProfile.userList = resp.data.map(user => user.MRN).filter(value => value !== null && value !== undefined);
            this.openReviewerDialog();
          }).catch((e) => {
            console.error(e);
            this.openReviewerDialog();
          })
        } else {
          this.openReviewerDialog();
        }
      },

      openReviewerDialog() {
        this.$emit('input', false);
        this.reviewerRoleDialog = true;
        this.reviewerDialogKey++;
      },
      onSaveMRNList({ MRNs }) {
        this.selectedProfile.userList = MRNs;
        this.selectedProfile.userListEdited = true;

        this.$emit('input', true);
        this.reviewerRoleDialog = false;
      },
      onCloseMRNDialog() {
        this.$emit('input', true);
        this.reviewerRoleDialog = false;
      }
    }
  }
</script>
