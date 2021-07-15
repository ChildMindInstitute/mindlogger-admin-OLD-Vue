<template>
	
	<div >
		<span class="d-flex">
			<action-button icon="mdi-content-save" :tooltip="$t('save')" 
						@click="$emit('onSave', item)" v-if="item.isNew" />

			<action-button icon="mdi-delete" :disabled="item.isFolder && appletCount > 0" 
				@click="$emit('onDelete', item)" >
				<template v-slot:tooltip>
				 	<span v-if="item.isFolder && appletCount > 0">{{$t('deleteFolderWarning')}}</span>
					<span v-else-if="item.isFolder">{{$t('delete')}}</span>
				</template>
			</action-button>

			<action-button icon="mdi-square-edit-outline"  :tooltip="$t('edit')" 
						@click="item.isRenaming = true" />
		</span>
	</div>
</template>

<script>
import ActionButton from "./ActionButton.vue";
export default {
	components: {
		ActionButton
	},
	props: {
		item: {
			type: Object,
			required: true
		}
	},
	computed : {
    appletCount() {
      return this.item.items.filter(item => !item.isFolder).length;
    },
	},
}

</script>