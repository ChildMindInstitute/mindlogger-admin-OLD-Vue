<template>

	<div
		v-if="visible"
		class="ds-week"
	>

		<template v-for="(day, i) in days">

			<ds-day
					v-bind="{$scopedSlots}"
					v-on="$listeners"
					:key="i"
					:day="day"
					:calendar="calendar"
					:placeholder="placeholder"
					:placeholder-for-create="placeholderForCreate"
			></ds-day>

		</template>

	</div>

	<div
		v-else
		class="ds-week"
	>
		<v-progress-circular
			class="d-block ma-auto mt-2"
			color="black"
			indeterminate
			:size="50"
		>
		</v-progress-circular>
	</div>

</template>

<script>
import { Calendar, CalendarEvent } from 'dayspan'
import DsDay from './Day'

export default {

	name: 'dsDayRow',
  components: {
    DsDay
  },
	props:
		{
			days:
				{
					required: true,
					type: Array
				},

			calendar:
				{
					required: true,
					type: Calendar
				},

			placeholder:
				{
					type: CalendarEvent
				},

			placeholderForCreate:
				{
					type: Boolean,
					default: false
				}
		},
	data() {
		return {
			visible: false,
		}
	},

	mounted() {
		if (('IntersectionObserver' in window)) {
			const observer = new IntersectionObserver((entries) => {
				if (entries[0].intersectionRatio <= 0) {
				  return;
				}

				if (!this.visible) {
				  this.visible = true;
				}
			});

			observer.observe(this.$el);
		} else {
			this.visible = true;
		}
	},

	methods:
		{}
}
</script>

<style scoped lang="scss">

	.ds-week {
		display: flex;
		flex: 1 1 0%;
		min-height: 400px;
	}

</style>
