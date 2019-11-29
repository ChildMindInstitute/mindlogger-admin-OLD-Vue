<template>
  <v-container>
    <ag-grid-vue
      class="ag-theme-balham"
      :columnDefs="columnDefs"
      :rowData="users"
      :modules="modules"
      :domLayout="domLayout"
    />
  </v-container>
</template>

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
          field: '_id',
          sortable: true,
          filter: true
        },
        {
          headerName: 'Invited By',
          field: 'invitedBy.displayName',
          sortable: true,
          filter: true
        },
      ],
      modules: AllCommunityModules,
      domLayout: 'autoHeight',
    };
  },
  mounted() {
    console.log(this.users);
  }
}
</script>
