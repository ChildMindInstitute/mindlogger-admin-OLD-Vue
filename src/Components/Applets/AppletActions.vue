<template>
  <div>
    <span class="laptop-only ">

      <action-button
        v-if="canViewUsers"
        :tooltip="$t('viewUsers')"
        icon="mdi-account-multiple"
        @click="onViewUsers(item)"
      />

      <action-button
        v-if="canViewGeneralCalendar"
        :tooltip="$t('viewCalendar')"
        icon="mdi-calendar-month"
        @click="onViewGeneralCalendar(item)"
      />

      <action-button
        v-if="canEditApplet"
        :tooltip="$t('editApplet')"
        icon="mdi-square-edit-outline"
        :disabled="item.editing"
        @click="onEditApplet(item)"
      />

      <action-button
        v-if="!canEditApplet && item.welcomeApplet"
        :tooltip="$t('viewApplet')"
        icon="mdi-book-open-variant"
        @click="onEditApplet(item)"
      />

      <action-button
        v-if="canDuplicate"
        :tooltip="$t('duplicateApplet')"
        imageName="copy-clipart.png"
        @click="onDuplicateApplet(item)"
      />
      <action-button
        v-if="canDeleteApplet"
        :tooltip="$t('deleteApplet')"
        icon="mdi-delete"
        @click="onDeleteApplet(item)"
      />

      <action-button
        v-if="canRefresh"
        :tooltip="$t('refreshApplet')"
        icon="mdi-refresh"
        @click="onRefreshApplet(item)"
      />

      <action-button
        v-if="canTransferOwnership"
        :tooltip="$t('transferOwnership')"
        imageName="transfer-ownership.png"
        @click="onTransferOwnership(item)"
      />

      <action-button
        v-if="canRemoveFromFolder"
        :tooltip="$t('removeFromFolder')"
        imageName="folder-eject.png"
        @click="removeFromFolder"
      />

      <action-button
        v-if="canShareWithLibrary"
        :tooltip="$t('shareWithLibrary')"
        icon="mdi-web"
        @click="onShareWithLibrary"
      />

      <action-button
        v-if="canCreateWelcomeApplet"
        :tooltip="item.welcomeApplet ? $t('concealApplet') : $t('publishApplet')"
        :rotation="item.welcomeApplet ? '180deg' : '0deg'"
        icon="mdi-publish"
        @click="onSwitchWelcomeApplet"
      />
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
          <v-list-item
            v-if="canViewUsers"
            @click="onViewUsers(item)"
          >
            <v-list-item-title>{{ $t('viewUsers') }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="canViewGeneralCalendar"
            @click="onViewGeneralCalendar(item)"
          >
            <v-list-item-title>{{ $t('viewCalendar') }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="canEditApplet"
            @click="onEditApplet(item)"
          >
            <v-list-item-title>{{ $t('editApplet') }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="canDeleteApplet"
            @click="onDeleteApplet(item)"
          >
            <v-list-item-title>{{ $t('deleteApplet') }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="canDuplicate"
            @click="onDuplicateApplet(item)"
          >
            <v-list-item-title>{{ $t('duplicateApplet') }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="canRefresh"
            @click="onRefreshApplet(item)"
          >
            <v-list-item-title>{{ $t('refreshApplet') }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="canTransferOwnership"
            @click="onTransferOwnership(item)"
          >
            <v-list-item-title>{{ $t('transferOwnership') }}</v-list-item-title>
          </v-list-item>

          <v-list-item @click="removeFromFolder">
            <v-list-item-title>{{ $t('removeFromFolder') }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="canShareWithLibrary"
            @click="onShareWithLibrary"
          >
            <v-list-item-title>{{ $t('shareWithLibrary') }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="canCreateWelcomeApplet"
            @click="onSwitchWelcomeApplet"
          >
            <v-list-item-title>{{ item.welcomeApplet ? $t('concealApplet') : $t('publishApplet') }}</v-list-item-title>
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
		user() {
      return this.$store.state.auth.user;
		},

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
		},

		canCreateWelcomeApplet() {
			return this.hasRoles(this.item, 'owner') && this.user && this.user.admin;
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
			if (this.item.parentId) {
				this.publishEvent("removeFromFolder");
			} else {
				this.publishEvent("onDeleteApplet");
			}
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

		onSwitchWelcomeApplet() {
			this.publishEvent("onSwitchWelcomeApplet")
		}
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