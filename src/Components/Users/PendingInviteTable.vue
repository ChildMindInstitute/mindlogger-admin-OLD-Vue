<template>
  <v-container>
    <ag-grid-vue
      class="ag-theme-balham"
      :gridOptions="gridOptions"
      :columnDefs="columnDefs"
      :rowData="rowData"
      :modules="modules"
      :domLayout="domLayout"
      @first-data-rendered="onFirstDataRendered"
    />
  </v-container>
</template>

<style scoped>
.container {
  padding: 0px;
}
</style>

<script>
import moment from "moment";
import { AgGridVue } from "@ag-grid-community/vue";
import { AllCommunityModules } from "@ag-grid-community/all-modules";
export default {
  name: "PendingInviteTable",
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
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: this.$i18n.t("institutionalID"),
          field: "mrn",
          sortable: true,
          filter: true,
          resizable: true
        },
        {
          headerName: this.$i18n.t("firstName"),
          field: "firstName",
          sortable: true,
          filter: true,
          resizable: true
        },
        {
          headerName: this.$i18n.t("lastName"),
          field: "lastName",
          sortable: true,
          filter: true,
          resizable: true
        },
        {
          headerName: this.$i18n.t("userType"),
          field: "userType",
          sortable: true,
          filter: true,
          resizable: true
        },
        {
          headerName: this.$i18n.t("invitationLink"),
          field: "invitationLink",
          sortable: true,
          filter: true,
          resizable: true
        },
        {
          headerName: this.$i18n.t("dateTimeInvited"),
          field: "dateTime",
          sortable: true,
          filter: true,
          resizable: true
        }
      ],
      modules: AllCommunityModules,
      gridOptions: {},
      domLayout: "autoHeight",
    };
  },
  computed: {
    rowData: function() {
      const dat = [];
      this.users.forEach((invitation) => {
        dat.push({
          mrn: invitation.MRN,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          userType: invitation.role,
          invitationLink: `${process.env.VUE_APP_WEB_URI}/#/invitation/${
            invitation._id
          }`,
          dateTime: moment(invitation.created).format("YYYY-MM-DD hh:mm:ss"),
        });
      });
      return dat;
    },
  },
  mounted() {
    this.autoSizeAll();
  },
  methods: {
    onFirstDataRendered(params) {
      params.api.sizeColumnsToFit();
    },
    autoSizeAll() {
      var allColumnIds = [];
      this.gridOptions.columnApi.getAllColumns().forEach(function(column) {
        allColumnIds.push(column.colId);
      });

      this.gridOptions.columnApi.autoSizeColumns(allColumnIds, true);
    },
  },
};
</script>
