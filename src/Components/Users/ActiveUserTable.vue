<template>
  <v-container>
    <ag-grid-vue
      class="ag-theme-balham"
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

<style scoped>
  .container {
    padding: 0px;
  }
</style>

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
      const selectedUsers = this.gridOptions.api.getSelectedRows().map(function(val, index) {
        return val._id;
      });

      this.$store.commit("setCurrentUsers", selectedUsers);
    }
  },
}
</script>
