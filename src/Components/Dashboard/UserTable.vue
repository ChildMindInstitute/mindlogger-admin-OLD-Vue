<template>
	<div>
		<slot name="search">
		</slot>

		<slot name="loader">
		</slot>

		<v-data-table :headers="getComputedHeaders"
				  :items="employees"
				  :loading="isLoading"
				  :footer-props="{
				    itemsPerPageText: $t('rowsPerPage'),
				    itemsPerPageAllText: $t('all')}" >

				  <template v-slot:item.pinned="{ item }">
				  	<v-btn icon small depressed @click="$emit('pinstatuschanged', item)">
				  		<v-icon color="primary" v-if="item.pinned">mdi-pin</v-icon>
				  		<v-icon color="#474747" v-else >mdi-pin-off</v-icon>
				  	</v-btn>	
				  </template>	


				<template v-slot:item.actions="{ item }">
					<table-actions :user="item"
							:showRoleEdit="true"
							@openCalendar="$emit('openCalendar', item)"
							@viewUser="$emit('viewUser', item)"
							@exportData="$emit('exportData', item)"
							@editAppletAccess="$emit('editAppletAccess', item)"
							@editRoles="$emit('editRoles', item)" />
				</template>	
		</v-data-table>

	</div>
	
</template>

<script>
	import TableActions from "./TableActions.vue";


	export default {
		components: {
			TableActions
		},

		props: {
			employees: {
				type: Array,
				required: true,
				default: () => []
			},

			serverItemsCount: {
				type: Number,
				required: true,
				default: 0
			},

			isLoading: {
				type: Boolean,
				default: false,
			},

			footerConfiguration: {
				type: Object,
				default: () => {}
			},

			headers: {
				type: Array,
				default: () => []
			},

			tableOptions: {
				type: Object,
				default: () => {}
			},

			canPinItem: {
				type: Boolean,
				default: true,
			},

			addActionsColumn: {
				type: Boolean,
				default: false
			},
		},

		computed : {
	    	getComputedHeaders() {
	    		const headers = [];

	    		if (this.canPinItem)
	    			headers.push({
				        text: this.$i18n.t('pinStatus'),
				        align: 'center',
				        sortable: false,
				        value: 'pinned',
				        width: 20,
			      	})

	    		headers.push(...this.headers);

	    		if (this.addActionsColumn)
	    			headers.push(
				     {
				          text: '',
				          align: 'center',
				          sortable: false,
				          value: 'actions',
				          width: '10%',
			      	});

	    		return headers;
	    	}
	    }
	}
</script>

<style scoped>
	
  .cell {
    text-align: center;
  }

  .filter .search-input {
    margin: 10px;
    width: 25%;
    display: inline-block;
  }
  .filter span {
    color: rgb(159, 110, 240);
    font-weight: 600;
    margin-left: 20px;
  }

  @media only screen and (max-width: 767px) {
    .filter .search-input {
      width: 80%;
    }
    .filter span {
      display: none;
    }
  }
</style>