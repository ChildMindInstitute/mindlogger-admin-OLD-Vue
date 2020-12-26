import api from "../Utils/api/api.vue";
import { RolesMixin } from "../Utils/mixins/RolesMixin";

export default {
  name: "RoleViewerViewModel",
  mixins: [RolesMixin],
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    employees: {
      type: Array,
      required: true
    },
    roleType: {
      type: String,
      required: true
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
        text: this.$i18n.t('email'),
        align: 'center',
        sortable: true,
        value: 'email',
      },
    ];

    return {
      headers,
      searchQuery: '',
      isBusy: false,
      loaderMessage: "Please wait...",
      selectedRow: null,
      selectedEmployers: [],
    };
  },
  computed: {
    token() {
      return this.$store.state.auth.authToken.token;
    },
    apiHost() {
      return this.$store.state.backend;
    },
    currentUsers() {
      return this.$store.state.currentUsers;
    },
    accountApplets() {
      return this.$store.state.currentAccount.applets;
    },
    currentAccount() {
      return this.$store.state.currentAccount;
    },

    getRolesPerApplet() {
      const appletRoles = {};
      for (let applet of this.accountApplets) {
        appletRoles[applet.id] = applet.roles;
      }
      return appletRoles;
    },

    formattedEmployers() {
      const formatted = [];
      const appletRoles = this.getRolesPerApplet;
      for (let i = 0; i < this.employees.length; i++) {
        const employer = this.employees[i];
        const data = Object.values(employer)[0];
        if (!data.roles.includes(this.roleType))
        {
          continue;
        }
        let updated = null, refreshRequest = false;
        let selected = false, pinned = false, hasIndividualEvent = false;

        let viewable = [], editable = [], scheduling = [];
        for (let appletId in employer) {
          let profile = employer[appletId];
          /** managers' roles are editable by only owner */
          if (!profile.roles.includes('owner') && (!profile.roles.includes('manager') || appletRoles[appletId].includes('owner'))) {
            editable.push(appletId);
          }
          const applet = this.accountApplets.find(applet => applet.id === appletId);
          if (profile.updated && (!updated || new Date(updated).getTime() < new Date(profile.updated).getTime())) {
            updated = profile.updated;
          }
          pinned = profile.pinned;
          if (profile.viewable) {
            viewable.push(appletId);
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

        if (data.firstName.includes(this.searchQuery) || data.lastName.includes(this.searchQuery) || data.email.includes(this.searchQuery)) {
          const formattedInfo = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            roles: this.localizedRoles.filter(role => role.name !== 'user' && data.roles.includes(role.name)).map(role => role.title),
            currentScheduleStatus: hasIndividualEvent ? this.$t('individualSchedule') : this.$t('generalSchedule'),
            updated,
            pinned,
            viewable,
            editable,
            scheduling,
            selected,
            refreshRequest,
            _id: data._id
          };
          if (data.roles.includes('owner')) {
            formattedInfo.roles = [this.$t('owner')];
          }
          formatted.push(formattedInfo);
        }
      }
      return formatted;
    },
  },

  methods: {
    beginLoading(message) {
      this.loaderMessage = message;
      this.isBusy = true;
    },

    finishLoading() {
      this.isBusy = false;
      this.loaderMessage = "";
    },

    openCalendar(user) {
      const canGoToCalendar = user.scheduling.length === 1 && user.hasIndividualEvent //better variable name that explains the reason for this comparison will help
      const appletId = user.scheduling[0];
      if (canGoToCalendar) {
        this.routeToCalendar(appletId, user);
      } else {
        this.openCalendarDialog(user);
      }
    },

    openCalendarDialog(user) {
      this.userScheduleDialog.visible = true;
      this.userScheduleDialog.user = user.scheduling.reduce((data, appletId) => ({
            ...data,
            [appletId]: user
      }), {});
    },

    viewUser(user) {
      if (user.viewable.length > 1) {
          this.userViewDialog.visible = true;
          this.userViewDialog.user = user.viewable.reduce((data, appletId) => ({
                ...data,
                [appletId]: user
          }), {});
      } else {
        this.onDataRequest({
          appletId: user.viewable[0],
          profile: user, //this.users[row.id][row.viewable[0]],
          viewing: true
        });
      }
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

    onExportUserData(user) {
      this.$store.commit('setCurrentUsers', {
        [user._id]: user
      });
      if (user.viewable.length > 1) {
        this.userExportDialog.visible = true;
        this.userExportDialog.user = user.scheduling.reduce((data, appletId) => ({
              ...data,
              [appletId]: user
        }), {});
      } else {
        this.onDataRequest({
          appletId: user.viewable[0],
          profile: user,
          viewing: false
        });
      }
    },

    editAppletAccess(user) {
      this.userEditDialog.visible = true;
      this.userEditDialog.user = user.editable.reduce((data, appletId) => ({
            ...data,
            [appletId]: user
      }), {});
    },

    onEditRoles(user) {
      this.editRoleDialog.visible = true;
      this.editRoleDialog.employee = user.editable.reduce((data, appletId) => ({
            ...data,
            [appletId]: user
      }), {});

    },

    onEditRoleSuccessfull() {
      this.editRoleDialog.visible = false;
      this.$emit('onEditRoleSuccessfull');
    },

    exportData() {
      const applet = this.accountApplets.find(applet => applet.id === this.appletPasswordDialog.appletId);

      this.exportUserData(applet);
    },

    viewCalendar({ appletId, profile }) {
      const applet = this.currentAccount.applets.find(applet => applet.id === appletId);
      this.$store.commit('setCurrentApplet', applet);
      this.$store.commit('setCurrentUsers', {
        [profile['_id']]: profile
      });
      this.$router.push(`/applet/${applet.id}/schedule`).catch(err => {});
    },


    onDataRequest({ appletId, profile, viewing }) {
      const appletMeta = this.accountApplets.find(applet => applet.id === appletId);

      let preprocess = !this.isLatestApplet(appletMeta) ? this.loadApplet(appletId) : Promise.resolve();

      preprocess.then(() => {
        const appletData = this.$store.state.allApplets[appletId];
        const encryptionInfo = appletData.applet.encryption;

        this.appletPasswordDialog.visible = false;
        this.appletPasswordDialog.appletId = appletId;
        this.appletPasswordDialog.profile = profile;
        this.appletPasswordDialog.requestedAction = viewing ? this.gotoDashboard.bind(this) : this.exportData.bind(this);

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


    routeToCalendar(appletId, user) {
        const applet = this.currentAccount.applets.find(applet => applet.id === appletId);
        this.$store.commit('setCurrentApplet', applet);
        this.$store.commit('setCurrentUsers', {
          [user._id]: user
        });
        this.$router.push(`/applet/${applet.id}/schedule`).catch(err => {});
    },

    isPinnedStatusChanged(user) {
      const newState = !user.pinned;
      const profileId = user._id
      this.beginLoading(`${this.$t('pinUpdateMessage')} ${user.firstName} ${user.lastName} ${this.$t('pleaseWait')}`)

      const updatePayload = {
        apiHost: this.apiHost,
        token: this.token,
        profileId: profileId,
        newState: user.pinned,
      };

      api.updatePin(updatePayload).then(() => {
        user.pinned = newState; //Only wait for succesful backend call before updating user state.
        this.finishLoading();
      });
    },
  },

  render() {}
};

