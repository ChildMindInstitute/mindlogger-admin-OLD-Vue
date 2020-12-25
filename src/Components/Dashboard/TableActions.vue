<template>
  	<div class="d-flex">
		<v-tooltip v-if="user.scheduling && user.scheduling.length > 0" top >
			<template v-slot:activator="{ on }">
				<v-btn v-on="on" fab small depressed @click="$emit('openCalendar', user)">
					<v-icon color="#474747"> mdi-calendar-month </v-icon>
				</v-btn>
			</template>
			<span>{{ $t('viewCalendar') }}</span>
		</v-tooltip>

		<v-tooltip v-if="user.viewable.length > 0" top>
			<template v-slot:activator="{ on }">
				<v-btn v-on="on" fab small depressed @click="$emit('viewUser', user)">
					<v-icon color="secondary"> mdi-chart-bar </v-icon>
				</v-btn>
			</template>
			<span>{{ $t('viewData') }}</span>
		</v-tooltip>


		<v-tooltip v-if="user.viewable.length" top>
			<template v-slot:activator="{ on }">
				<v-btn v-on="on" fab small depressed @click="$emit('exportData', user)">
					<v-icon class="export-icon" color="secondary lighter-2">mdi-export</v-icon>
				</v-btn>
			</template>
			<span>{{ $t('exportData') }}</span>
		</v-tooltip>

		<v-tooltip v-if="user.editable.length > 0" top >
			<template v-slot:activator="{ on }">
				<v-btn v-on="on" fab small depressed @click="$emit('editAppletAccess', user)">
					<v-icon color="red"> mdi-apps </v-icon>
				</v-btn>
			</template>
			<span>{{ $t('editAccess') }}</span>
		</v-tooltip>

		<v-tooltip v-if="user.editable.length & showRoleEdit" top>
          <template v-slot:activator="{ on }">
            <v-btn fab small depressed v-on="on" @click="$emit('editRoles', user)">
              <v-icon color="primary" class="darken-4">mdi-account-lock-outline</v-icon>
            </v-btn>
          </template>
			<span>{{ $t('editRoles') }}</span>
        </v-tooltip>
	</div>
</template>

<script>
	export default {
		props: {
			user: {
				required: true,
				type: Object,
				default: () => {}
			},

			showRoleEdit: {
				type: Boolean,
				default: false
			}
		}
	}
</script>