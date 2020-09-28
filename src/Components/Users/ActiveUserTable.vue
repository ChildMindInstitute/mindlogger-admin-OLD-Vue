<template>
  <v-container>
    <ag-grid-vue
      class="ag-theme-balham"
      :gridOptions="gridOptions"
      :frameworkComponents="frameworkComponents"
      :columnDefs="columnDefs"
      :rowSelection="multiSelection"
      :rowMultiSelectWithClick="clickSelection"
      :pagination="pagination"
      :rowData="userData"
      :modules="modules"
      :domLayout="domLayout"
      @first-data-rendered="onFirstDataRendered"
    />
    <v-dialog
      v-model="editRoleDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="edit-card-title">
          Edit roles
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="currentUserRoles"
            :items="computedItems"
            label="Select"
            multiple
            chips
            :required="currentUserRoles"
            :item-disabled="['editor']"
            :hint="currentUserRoles.length ? '' : 'At least one role is required'"
            persistent-hint
          />
          <v-combobox
            v-if="currentUserRoles.includes('reviewer')"
            v-model="currentUserList"
            hint="Add or remove users for reviewer role"
            label="User list"
            multiple
            small-chips
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="editRoleDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!currentUserRoles.length"
            text
            @click="onSaveUserRole()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="passwordDialog"
      persistent
      max-width="450px"
    >
      <v-card>
        <v-card-title class="edit-card-title">
          <span class="headline">Are you sure?</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="password"
                  label="Confirm password"
                  type="password"
                  required
                />
                <div
                  v-if="error"
                  class="error"
                >
                  {{ error }}
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click="passwordDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="onConfirmPassword()"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.container {
  padding: 0px;
}
</style>

<script>
import { AgGridVue } from "@ag-grid-community/vue";
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import BtnCellRenderer from "./BtnCellRenderer.vue";
import api from '../Utils/api/api.vue';
import UserRequestCellRenderer from './UserRequestCellRenderer';

export default {
  name: "ActiveUserTable",
  components: {
    AgGridVue,
  },
  props: {
    users: {
      type: Array,
      default: function() {
        return [];
      },
    },
    appletId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      currentUserList: [],
      currentUserRoles: [],
      userData: [],
      userCellData: null,
      columnDefs: null,
      frameworkComponents: null,
      modules: AllCommunityModules,
      domLayout: "autoHeight",
      multiSelection: "multiple",
      pagination: true,
      gridOptions: null,
      clickSelection: true,
      editRoleDialog: false,
      passwordDialog: false,
      userRoleData: ["coordinator", "editor", "reviewer", "manager"],
      disabledRoles: ["coordinator", "editor", "reviewer"],
      password: "",
      error: "",
    };
  },
  computed: {
    isManager() { 
      return this.$store.state.currentAccount.applets['manager'];
    },
    isCoordinator() { 
      return this.$store.state.currentAccount.applets['coordinator'];
    },
    computedItems() {
      return this.userRoleData.map((item) => {
        return {
          text: item,
          disabled: this.disabledRoles.includes(item),
        };
      });
    },
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },
  beforeMount() {
    this.gridOptions = {};
    this.userData = this.users.map((user) => {
      let roles = [];
      if (user.roles.length === 1 && user.roles[0] === "user") {
        roles.push("user");
      } else if (user.roles.includes("owner")) {
        roles.push("owner");
      } else if (user.roles.includes("manager")) {
        roles.push("manager");
      } else {
        roles = user.roles.filter((role) => role != "user");
      }
      return {
        displayName: user.displayName,
        email: user.email,
        mrn: user.MRN,
        _id: user._id,
        refreshRequest: user.refreshRequest && user.refreshRequest.userPublicKey ? user.refreshRequest : null,
        roles,
      };
    });
    const { isManager, isCoordinator } = this;

    this.columnDefs = [
      {
        headerName: "Name",
        field: "displayName",
        sortable: true,
        filter: true,
        resizable: true,
        cellStyle: { justifyContent: "center" },
      },
      {
        headerName: "Roles",
        field: "roles",
        sortable: true,
        filter: true,
        resizable: true,
        cellStyle: { justifyContent: "center" },
      },
      {
        headerName: "Email",
        field: "email",
        sortable: true,
        filter: true,
        resizable: true,
        cellStyle: { justifyContent: "center" },
      },
    ];

    if (isManager || isCoordinator) {
      this.columnDefs.push({
        headerName: "",
        field: "athelete",
        maxWidth: 200,
        cellStyle: { display: "flex", justifyContent: "center" },
        cellRenderer: "btnCellRenderer",
        cellRendererParams: {
          clicked: this.onClickedHander,
          isManager: isManager,
        },
      });
    }

    const encryption = this.currentApplet.applet.encryption;
    if (this.currentApplet.roles.includes('manager') && encryption && encryption.appletPrime ) {
      this.columnDefs.splice( 2, 0, {
        headerName: '',
        field: 'refreshRequest',
        maxWidth: 200,
        cellStyle: {display: 'flex', justifyContent: 'center'},
        cellRenderer: 'UserRequestCellRenderer',
        cellRendererParams: {
          clicked: this.onReUploadResponse
        },
      });
    }
    this.frameworkComponents = {
      btnCellRenderer: BtnCellRenderer,
      UserRequestCellRenderer
    };
  },
  methods: {
    /**
     * Edit/delete action handler
     * @param {obj} data Data of the cell
     * @param {obj} action Action type (edit/delete)
     * @return {void}
     */

    async onClickedHander({ data, action }) {
      this.userCellData = JSON.parse(data);
      this.currentUserRoles = this.userCellData.roles;

      if (action === "delete") {
        await this.onDeleteRole(this.userCellData);
      } else if (action === "edit") {
        this.onEditRole(this.userCellData);
      } else if (action === "deleteUser") {
        this.revokeAppletUser(this.userCellData._id, false);
      } else if (action === "deleteData") {
        this.passwordDialog = true;
      }
    },

    /**
     * Confirm password to remove user and data
     *
     * @return {void}
     */

    onConfirmPassword() {
      this.error = "";
      if (!this.password) {
        this.error = "No password";
      }

      api
        .signIn({
          apiHost: this.$store.state.backend,
          user: this.$store.state.userEmail,
          password: this.password,
        })
        .then((resp) => {
          this.revokeAppletUser(this.userCellData._id);
          this.passwordDialog = false;
        })
        .catch((e) => {
          this.error = "Incorrect password";
        });
    },

    /**
     * Delete roles of an applet
     * @param {obj} userCellData Data of the specific user
     * @return {void}
     */

    async onDeleteRole(userCellData) {
      const response = await this.$dialog.warning({
        title: "",
        color: "#1976d2",
        text: "Are you sure to remove this Role?",
        persistent: false,
        actions: {
          No: "No",
          Yes: {
            color: "#1976d2",
            text: "Yes",
          },
        },
      });

      if (response === "Yes") {
        this.revokeAppletUser(this.userCellData._id);
      }
    },

    /**
     * Edit roles of an applet
     * @param {obj} userCellData Data of the specific user
     * @return {void}
     */

    onEditRole(userCellData) {
      this.userCellData.userList = [];
      if (userCellData.roles.includes("reviewer")) {
        api
          .getUserList({
            apiHost: this.$store.state.backend,
            token: this.$store.state.auth.authToken.token,
            appletId: this.appletId,
            reviewerId: userCellData._id,
          })
          .then((response) => {
            this.currentUserList = response.data.map((user) => user.MRN);
            this.userCellData.userList = this.currentUserList;
            this.editRoleDialog = true;
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        this.currentUserList = [];
        this.editRoleDialog = true;
      }
    },

    onReUploadResponse(user) {
      this.$emit('reUploadResponse', user);
    },

    /**
     * Save updated user roles
     *
     * @return {void}
     */

    onSaveUserRole() {
      const roleInfo = {};
      if (this.currentUserRoles.includes("manager")) {
        this.currentUserRoles.length = 0;
        this.currentUserRoles.push("manager");
      }

      // Add the .equals method to Array's prototype to call it on any array
      Array.prototype.equals = function(array) {
        // if the other array is a falsy value, return
        if (!array) return false;
        // compare lengths - can save a lot of time
        if (this.length !== array.length) return false;
        for (var i = 0, l = this.length; i < l; i += 1) {
          if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i])) {
              return false;
            }
          } else if (this[i] !== array[i]) {
            return false;
          }
        }
        return true;
      };
      // Hide method from for-in loops
      Object.defineProperty(Array.prototype, "equals", { enumerable: false });

      if (this.currentUserRoles.equals(this.userCellData.roles)) {
        const newUserList = [];
        if (this.userCellData.userList.equals(this.currentUserList)) {
          this.editRoleDialog = false;
          return;
        }
        this.currentUserList.forEach((userMrn) => {
          this.userData.forEach((user) => {
            if (user.mrn === userMrn) {
              newUserList.push(user._id);
            }
          });
        });

        roleInfo["reviewer"] = newUserList;
      } else {
        this.currentUserRoles.forEach((role) => {
          this.userCellData.roles.forEach((role) => {
            if (!this.currentUserRoles.includes(role)) {
              if (role === "manager") {
                if (roleInfo["coordinator"] !== 1) {
                  roleInfo["coordinator"] = 0;
                }
                if (roleInfo["editor"] !== 1) {
                  roleInfo["editor"] = 0;
                }
                if (roleInfo["reviewer"] !== 1) {
                  roleInfo["reviewer"] = 0;
                }
              }
              roleInfo[role] = 0;
            }
          });
          if (!this.userCellData.roles.includes(role)) {
            if (role === "reviewer") {
              const newUserList = [];
              this.currentUserList.forEach((userMrn) => {
                this.userData.forEach((user) => {
                  if (user.mrn === userMrn) {
                    newUserList.push(user._id);
                  }
                });
              });
              roleInfo[role] = newUserList;
            } else {
              roleInfo[role] = 1;
            }
          }
        });
      }

      this.updateUserRoles(roleInfo);
    },

    /**
     * Update user roles
     * @param {obj} roleInfo the changed (added/removed) user roles.
     * @return {void}
     */

    updateUserRoles(roleInfo) {
      api
        .updateUserRoles({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.appletId,
          userId: this.userCellData._id,
          roleInfo,
        })
        .then((response) => {
          this.userCellData.roles = this.currentUserRoles;
          const newData = this.userData.map((user) => {
            if (user.email === this.userCellData.email) {
              return this.userCellData;
            }
            return user;
          });
          this.userData = newData;
          this.editRoleDialog = false;
        })
        .catch((error) => {
          console.log(error);
          this.editRoleDialog = false;
        });
    },

    /**
     * Revoke user access to specific applet
     * @param {obj} profileId userId to be revoked
     * @return {void}
     */

    revokeAppletUser(profileId, deleteResponse = true) {
      api
        .revokeAppletUser({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.appletId,
          profileId,
          deleteResponse,
        })
        .then((response) => {
          let newData = [];
          this.userData.forEach((user) => {
            if (user._id !== profileId) {
              newData.push(user);
            }
          });
          this.userData = newData;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    onFirstDataRendered(params) {
      params.api.sizeColumnsToFit();
    },
    getSelectedNodes() {
      const selectedUsers = this.gridOptions.api
        .getSelectedRows()
        .map(function(val, index) {
          return val._id;
        });
      this.$store.commit("setCurrentUsers", selectedUsers);
    },
  },
};
</script>

<style scoped>
.edit-card-title {
  color: white;
  background: #1976d2;
}

.error {
  color: "red";
}
</style>
