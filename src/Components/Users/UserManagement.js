import encryption from "../Utils/encryption/encryption";
import { AppletMixin } from "../Utils/mixins/AppletMixin";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/fr';

TimeAgo.addLocale(en);
TimeAgo.addLocale(fr);

export default {
  mixins: [AppletMixin],

  data: function () {
    return {
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
      editRoleDialog: {
        visible: false,
        employer: {},
        key: 0
      },
      appletPasswordDialog: {
        visible: false,
        profile: {},
        appletId: null,
        requestedAction: null,
      },
      users: [],
      timeAgo: new TimeAgo(this.$i18n.locale.replace('_', '-')),
    }
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

  methods: {
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
        user: row.deletable.reduce((data, appletId) => ({
          ...data,
          [appletId]: this.users[row.id][appletId]
        }), {}),
        key: this.userEditDialog.key + 1
      });
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

      this.isExporting = true,
      this.exportUserData(applet)
        .then(response => {
          this.isExporting = false;
        });
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

    onEditAccess(item) {
      this.$set(this, 'editRoleDialog', {
        visible: true,
        employer: this.users[item.id],
        key: this.editRoleDialog.key+1
      });
    },

    getUserStatus(user) {
      let editable = [], viewable = [], deletable = [], scheduling = [];

      let refreshRequest = false, hasIndividualEvent = false;
      let updated = null;

      for (let appletId in user) {
        let profile = user[appletId];
        const applet = this.accountApplets.find(applet => applet.id === appletId);

        /** reviewers can view users, and also his data */
        if (profile.viewable) {
          viewable.push(appletId);
        }

        /** manager can delete anyone except other managers, coordinator can only delete users */
        if (
          profile.roles && applet.roles.includes('coordinator') && !profile.roles.includes('owner') &&
          (
            applet.roles.includes('owner') || 
            (!applet.roles.includes('manager') && profile.roles.length == 1 || applet.roles.includes('manager') && !profile.roles.includes('manager'))
          )
        ) {
          deletable.push(appletId);
        }

        /** coordinator can update schedule for anyone */
        if (applet.roles.includes('coordinator')) {
          scheduling.push(appletId);
        }

        /** manager can update others' roles */
        if (
          profile.roles && !profile.roles.includes('owner') && 
          (!profile.roles.includes('manager') || applet.roles.includes('owner'))
        ) {
          editable.push(appletId);
        }

        if (this.currentAppletMeta) {
          refreshRequest = profile.refreshRequest;
          hasIndividualEvent = profile.hasIndividualEvent;
        }

        if (
          profile.updated && 
          (!updated || new Date(updated).getTime() < new Date(profile.updated).getTime())
        ) {
          updated = profile.updated;
        }
      }

      return {
        editable,
        viewable,
        deletable,
        scheduling,
        refreshRequest,
        currentScheduleStatus: hasIndividualEvent ? this.$i18n.t('individualSchedule') : this.$i18n.t('generalSchedule'),
        updated,
        timeAgo: updated && this.timeAgo.format(new Date(updated), 'round'),
      }
    }
  }
}
