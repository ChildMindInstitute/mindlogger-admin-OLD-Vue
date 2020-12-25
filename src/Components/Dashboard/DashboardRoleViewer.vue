<template>
  <div>
  	
  	<user-table
      :employees="formattedEmployers"
      :headers="headers"
      :tableOptions="{}"
      :isLoading="loading"
      :addActionsColumn="true"
      @viewUser="viewUser"
      @editRoles="onEditRoles"
      @exportData="onExportUserData"
      @editAppletAccess="editAppletAccess"
      @openCalendar="openCalendar"
      @pinstatuschanged="isPinnedStatusChanged"
       :serverItemsCount="0" >

      <template v-slot:search>
        <div class="filter">
          <v-text-field
            v-model="searchQuery"
            :label="$t('search')"
            prepend-inner-icon="mdi-magnify"
            class="search-input"
            outlined
            hide-details
            small />
        </div>
      </template>

      <template v-slot:loader>
        <div v-if="isBusy" class="my-3" >
            <v-progress-linear indeterminate  class="mx-auto" style="width: 50%"></v-progress-linear>
            <p class="text-center"><small>{{loaderMessage}}</small></p>
        </div>
      </template>
     </user-table>
    <EditUserAccessDialog
    	v-if="userEditDialog.visible"
        :user="userEditDialog.user"
        v-model="userEditDialog.visible"
        />

    <SchedulingDialog
    	v-if="userScheduleDialog.visible"
        :user="userScheduleDialog.user"
        v-model="userScheduleDialog.visible"
        @onViewCalendar="viewCalendar" />

    <ExportDataDialog
    	v-if="userExportDialog.visible"
        :user="userExportDialog.user"
        v-model="userExportDialog.visible"
        @onExportData="onDataRequest" />

    <ViewDataDialog
    	   v-if="userViewDialog.visible"
        :user="userViewDialog.user"
        @onViewData="onDataRequest"
        v-model="userViewDialog.visible" />

    <AppletPassword
    	v-if="appletPasswordDialog.visible"
        ref="appletPasswordDialog"
        v-model="appletPasswordDialog.visible"
        :hasConfirmPassword="false"
        @set-password="onAppletPassword"/>

  	<EditRoleDialog
  		v-if="editRoleDialog.visible"
  		v-model="editRoleDialog.visible"
  		:employer="editRoleDialog.employee"
  		 @updated="onEditRoleSuccessfull"
  	/>
  </div>
</template>
<script>

import RoleViewViewModel from "@/Components/Dashboard/RoleViewerViewModel.js";
import EditUserAccessDialog from "../Utils/dialogs/EditUserAccessDialog";
import ViewDataDialog from "../Utils/dialogs/ViewDataDialog";
import SchedulingDialog from "../Utils/dialogs/SchedulingDialog";
import ExportDataDialog from "../Utils/dialogs/ExportDataDialog";
import EditRoleDialog from "../Utils/dialogs/EditRoleDialog";
import AppletPassword from "@/Components/Utils/dialogs/AppletPassword";
import {AppletMixin} from "@/Components/Utils/mixins/AppletMixin";
import UserTable from "@/Components/Dashboard/UserTable.vue";


export default {
  name: "DashboardRoleViewer",
  extends: RoleViewViewModel,
  mixins: [AppletMixin],
  components: {
    EditUserAccessDialog,
    ViewDataDialog,
    SchedulingDialog,
    ExportDataDialog,
    UserTable,
    AppletPassword,
    EditRoleDialog,
  },
  data ()
  {
    return {
      updateUserList: null,
      userEditDialog: {
        visible: false,
        user: {},
      },
      editRoleDialog: {
        visible: false,
        employer: {},
      },
      userViewDialog: {
        visible: false,
        user: {},
      },
      userExportDialog: {
        visible: false,
        user: {},
      },
      userScheduleDialog: {
        visible: false,
        user: {}
      },

      appletPasswordDialog: {
        visible: false,
        profile: {},
        appletId: null,
        requestedAction: null,
      },
    }
  },
}
</script>

