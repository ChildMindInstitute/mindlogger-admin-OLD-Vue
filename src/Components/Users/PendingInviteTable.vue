<template>
  <v-container>
    <ag-grid-vue
      class="ag-theme-balham"
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
import {AgGridVue} from "@ag-grid-community/vue";
import {AllCommunityModules} from '@ag-grid-community/all-modules';
export default {
  name: 'PendingInviteTable',
  components: {
    AgGridVue
  },
  props: {
    users: {
      type: Array,
      default: function () {
        return []
      },
    },
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          sortable: true,
          filter: true,
          resizable: true,
        },
        {
          headerName: 'Invited By',
          field: 'invitedByName',
          sortable: true,
          filter: true,
          resizable: true,
        },
        {
          headerName: 'Invitation Link',
          field: 'invitationLink',
          sortable: true,
          filter: true,
          resizable: true,
        },
      ],
      modules: AllCommunityModules,
      domLayout: 'autoHeight',
    };
  },
  computed: {
    rowData: function() {
      const dat = [];
      this.users.forEach(invitation => {
        dat.push({
          'id': invitation._id,
          'invitedByName': invitation.invitedBy.displayName,
          'invitationLink': `web.mindlogger.org/#/invitation/${invitation._id}`,
        });
      });
      return dat;
    }
  },
  methods: {
    onFirstDataRendered(params) {
      params.api.sizeColumnsToFit();
    },
  },
}
</script>
