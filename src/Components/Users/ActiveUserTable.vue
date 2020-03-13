<template>
  <v-container>
    <ag-grid-vue
      class="ag-theme-bootstrap"
      :gridOptions="gridOptions"
      :columnDefs="columnDefs"
      :rowSelection="multiSelection"
      :rowMultiSelectWithClick="clickSelection"
      :pagination="pagination"
      :rowData="users"
      :modules="modules"
      :domLayout="domLayout"
      @first-data-rendered="onFirstDataRendered"
    />
  </v-container>
</template>

<script>
import {AgGridVue} from "@ag-grid-community/vue";
import {AllCommunityModules} from '@ag-grid-community/all-modules';
export default {
  name: 'ActiveUserTable',
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
          filter: true,
          resizable: true,
        },
        {
          headerName: 'Display Name',
          field: 'displayName',
          sortable: true,
          filter: true,
          resizable: true,
        },
      ],
      modules: AllCommunityModules,
      domLayout: 'autoHeight',
      multiSelection: 'multiple',
      pagination: true,
      gridOptions: null,
      clickSelection: true
    };
  },
  beforeMount() {
    this.gridOptions = {};
  },
  methods: {
    onFirstDataRendered(params) {
      params.api.sizeColumnsToFit();
    },
    getSelectedNodes() {
      const selectedUsers = this.gridOptions.api.getSelectedRows();

      if(selectedUsers.length) {
        this.$store.commit("setCurrentUsers", selectedUsers);
      }
      else {
        this.$store.commit("setCurrentUsers", this.users);
      }
    }
  },
}
</script>
