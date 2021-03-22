<template>
		<div>
		<span class="laptop-only ">

			<action-button :tooltip="$t('viewUsers')" icon="mdi-account-multiple" @click="onViewUsers(item)"
					v-if="canViewUsers" />

			<action-button :tooltip="$t('viewCalendar')" icon="mdi-calendar-month" @click="onViewGeneralCalendar(item)"
					v-if="canViewGeneralCalendar" />

			<action-button :tooltip="$t('editApplet')" icon="mdi-square-edit-outline" @click="onEditApplet(item)"
					v-if="canEditApplet" />

			<action-button :tooltip="$t('duplicateApplet')" imageName="copy-clipart.png" @click="onDuplicateApplet(item)"
					v-if="canDuplicate" />
			<action-button :tooltip="$t('deleteApplet')" icon="mdi-delete" @click="onDeleteApplet(item)"
					v-if="canDeleteApplet" />

			<action-button :tooltip="$t('refreshApplet')" icon="mdi-refresh" @click="onRefreshApplet(item)"
					v-if="canRefresh" />

			<action-button :tooltip="$t('transferOwnership')" imageName="transfer-ownership.png" @click="onTransferOwnership(item)"
					v-if="canTransferOwnership"/> 

			<action-button :tooltip="$t('removeFromFolder')" imageName="folder-eject.png" @click="removeFromFolder"
					v-if="canRemoveFromFolder"/>

			<action-button :tooltip="$t('shareWithLibrary')" icon="mdi-web" @click="onShareWithLibrary"
					v-if="canShareWithLibrary"/>
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

                <v-list-item v-if="canRemoveFromFolder" @click="removeFromFolder">
                  <v-list-item-title>{{ $t('removeFromFolder') }}</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="canShareWithLibrary" @click="onShareWithLibrary">
                  <v-list-item-title>{{ $t('shareWithLibrary') }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </span>

    </div>
</template>

<script>
import ActionButton from "./ActionButton.vue";
import { RolesMixin } from '../Utils/mixins/RolesMixin';
export default {
	components: {
		ActionButton
	},
	mixins: [RolesMixin],
	props: {
		item: {
			type: Object,
			required: true
		}
	},
	computed : {
		canViewUsers() {
			return this.hasRoles(this.item, 'reviewer', 'manager', 'coordinator');
		},

		canViewGeneralCalendar() {
			return this.hasRoles(this.item, 'manager', 'coordinator');
		},

		canEditApplet() {
			return this.hasRoles(this.item, 'editor', 'manager');
		},

		canDeleteApplet() {
			return this.hasRoles(this.item, 'manager');
		},

		canDuplicate() {
			return this.hasRoles(this.item, 'editor', 'manager');
		},

		canRefresh() {
			return this.item.hasUrl && this.hasRoles(this.item, 'editor', 'manager');
		},

		canTransferOwnership() {
			return this.hasRoles(this.item, 'owner');
		},

		canRemoveFromFolder() {
			return this.item.parentId && this.hasRoles(this.item, 'coordinator', 'editor', 'reviewer', 'manager');
		},

		canShareWithLibrary() {
			return this.hasRoles(this.item, 'owner', 'manager');
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

		removeFromFolder() {
			this.publishEvent("removeFromFolder");
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
		},

		onShareWithLibrary() {
			this.publishEvent("onShareWithLibrary");
		},

	}
}

</script>

<style scoped>
.laptop-hidden {
	display: none !important;
}
.laptop-only {
	display: none !important;
}
 @media only screen and (min-width: 1200px) {
    .laptop-only {
      display: flex !important;
    }
  }
  @media only screen and (max-width: 1199px ) {
    .laptop-hidden {
      display: flex !important;
    }
  }
</style>