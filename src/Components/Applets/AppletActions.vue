<template>
    <div >
		<span class="laptop-only d-flex">

			<action-button :tooltip="$t('viewUsers')" icon="mdi-account-multiple" @click="onViewUsers(item)"
					v-if="canViewUsers" color="purple" />

			<action-button :tooltip="$t('viewCalendar')" icon="mdi-calendar-month" @click="onViewGeneralCalendar(item)"
					v-if="canViewGeneralCalendar" />
        
			<action-button :tooltip="$t('editApplet')" icon="mdi-square-edit-outline" @click="onEditApplet(item)"
					v-if="canEditApplet" />
					
			<action-button :tooltip="$t('duplicateApplet')" imageName="copy-clipart.png"  @click="onDuplicateApplet(item)"
					v-if="canDuplicate" />
			<action-button :tooltip="$t('deleteApplet')" icon="mdi-delete" @click="onDeleteApplet(item)"
					v-if="canDeleteApplet" color="red" />


			<action-button :tooltip="$t('refreshApplet')" icon="mdi-refresh" @click="onRefreshApplet(item)"
					  v-if="canRefresh" color="primary lighten-2" />           	

		  	<action-button :tooltip="$t('transferOwnership')"  imageName="transfer-ownership.png" @click="onTransferOwnership(item)"
					   v-if="canTransferOwnership"/> 
     		
		</span>
		<span class="laptop-hidden">
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                    color="primary"
                    dark
                    v-bind="attrs"
                    v-on="on"
                >
                  {{ $t('manage') }}
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-if="canViewUsers" @click="onViewUsers(item)">
                  <v-list-item-title>{{ $t('viewUsers') }}</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="canViewGeneralCalendar" @click="onViewGeneralCalendar(item)" >
                  <v-list-item-title>{{ $t('viewCalendar') }}</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="canEditApplet" @click="onEditApplet(item)" >
                  <v-list-item-title>{{ $t('editApplet') }}</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="canDeleteApplet" @click="onDeleteApplet(item)">
                  <v-list-item-title>{{ $t('deleteApplet') }}</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="canDuplicate" @click="onDuplicateApplet(item)" >
                  <v-list-item-title>{{ $t('duplicateApplet') }}</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="canRefresh" @click="onRefreshApplet(item)" >
                  <v-list-item-title>{{ $t('refreshApplet') }}</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="canTransferOwnership" @click="onTransferOwnership(item)">
                  <v-list-item-title>{{ $t('transferOwnership') }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
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
		canViewUsers() {
			const item = this.item;
			return item.roles.includes('coordinator') || item.roles.includes('reviewer') || item.roles.includes('manager');
		},

		canViewGeneralCalendar() {
			const item = this.item;
			return item.roles.includes('coordinator') || item.roles.includes('manager');
		},

		canEditApplet() {
			const item = this.item;
			return item.roles.includes('editor') || item.roles.includes('manager');
		},

		canDeleteApplet() {
			const item = this.item;
			return item.roles.includes('manager');
		},

		canDuplicate() {
			const item = this.item;
			return item.roles.includes('editor') || item.roles.includes('manager');
		},

		canRefresh() {
			const item = this.item;
			return item.hasUrl && (item.roles.includes('editor') || item.roles.includes('manager'));
		},

		canTransferOwnership() {
			const item = this.item;
			return item.roles.includes('owner');
		}
	},

	methods: {
		publishEvent(name) {
			this.$emit(name, this.item);
		},

		onViewUsers() {
			this.publishEvent("onViewUsers");
		},

		onViewGeneralCalendar() {
			this.publishEvent("onViewGeneralCalendar");
		},

		onEditApplet() {
			this.publishEvent("onEditApplet");
		},

		onDeleteApplet() {
			this.publishEvent("onDeleteApplet");
		},

		onDuplicateApplet() {
			this.publishEvent("onDuplicateApplet");
		},

		onRefreshApplet() {
			this.publishEvent("onRefreshApplet");
		},

		onTransferOwnership() {
			this.publishEvent("onTransferOwnership");
		}

	}
}

</script>

<style scoped>

  @media only screen and (min-width: 1200px) {
    .laptop-hidden {
      display: none;
    }
  }
  @media only screen and (max-width: 1199px ) {
    .laptop-only {
      display: none;
    }
  }

</style>	