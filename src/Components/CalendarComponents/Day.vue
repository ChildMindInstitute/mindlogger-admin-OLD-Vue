<template>

	<div class="ds-day"
		 :class="classesDay"
		 @click.stop="add"
>

		<div :class="classesHeader">

			<a class="ds-dom" href
			   :class="classesDayOfMonth"
			   @click.stop.prevent="viewDay"
			   @mousedown.stop>
				{{ dayOfMonth }}
			</a>

			<span class="ds-first-day" v-if="showMonth">
				{{ month }}
			</span>

		</div>

		<template v-for="(event, i) in visibleEvents">

			<ds-calendar-event
					v-bind="{$scopedSlots}"
					v-on="$listeners"
					:key="event.id"
					:calendar-event="event"
					:calendar="calendar"
					:index="i"
			></ds-calendar-event>

		</template>

		<div v-if="hasPlaceholder">

			<ds-calendar-event-placeholder
					v-bind="{$scopedSlots}"
					v-on="$listeners"
					:day="day"
					:placeholder="placeholder"
					:placeholder-for-create="placeholderForCreate"
					:calendar="calendar"
					:index="visibleEvents.length"
			></ds-calendar-event-placeholder>

		</div>

	</div>

</template>

<script>
import { Day, Calendar, CalendarEvent, Functions as fn } from 'dayspan'
import DsCalendarEvent from './CalendarEvent'
import DsCalendarEventPlaceholder from './CalendarEventPlaceholder'

export default {

	name: 'dsDay',
  components: {
		DsCalendarEvent,
		DsCalendarEventPlaceholder,
  },
	props:
		{
			day:
				{
					required: true,
					type: Day
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
				},

			formats:
				{
					validate (x) {
						return this.$dsValidate(x, 'formats')
					},
					default () {
						return this.$dsDefaults().formats
					}
				}
		},

	computed:
		{
			classesDay () {
				return {
					'ds-today': this.day.currentDay,
					'ds-first-day-day': this.day.dayOfMonth === 1,
					'ds-out-calendar': !this.day.inCalendar
				}
			},

			classesHeader () {
				return {
					'ds-out-calendar': !this.day.inCalendar
				}
			},

			classesDayOfMonth () {
				return {
					'ds-today-dom': this.day.currentDay
				}
			},

			showMonth () {
				return this.day.dayOfMonth === 1
			},

			dayOfMonth () {
				return this.day.dayOfMonth
			},

			month () {
				return this.day.format(this.formats.month)
			},

			hasPlaceholder () {
				return this.placeholder &&
					this.placeholder.time.matchesDay(this.day)
			},

			visibleEvents () {
				return this.day.events.filter(this.isVisible)
			}
		},

	methods:
		{
			isVisible (calendarEvent) {
				if (!calendarEvent.starting)
					return false;
				if (this.$dayspan.features.hideOnMove &&
					this.placeholder &&
					this.placeholder.event === calendarEvent.event) {
					return false
				}

				const userIds = Object.keys(this.$store.state.currentUsers);

				if (!userIds.length && !calendarEvent.event.data.users) {
					return true;
				}
				
				if(userIds.length 
					&& calendarEvent.event.data.users.length 
					&& userIds.sort().join(',') !== calendarEvent.event.data.users.sort().join(',')) {
					return false
				}

				if (!calendarEvent.event.data.users || calendarEvent.event.data.users.some(user => !userIds.includes(user))) {
					return false
				}
				return true
			},

			add () {
				this.$emit('add', this.day)
			},

			viewDay (event) {
				// this.$emit('view-day', this.day)
			},

			mouseEnterDay ($event) {
				this.$emit('mouse-enter-day', this.day)
			},

			mouseLeaveDay ($event) {
				this.$emit('mouse-leave-day', this.day)
			},

			mouseDownDay ($event) {
				this.$emit('mouse-down-day', this.getEvent('mouse-down-day', $event))
			},

			mouseUpDay ($event) {
				this.$emit('mouse-up-day', this.getEvent('mouse-up-day', $event))
			},

			getEvent (type, $event, extra = {}) {
				return fn.extend({

					type: type,
					day: this.day,
					calendar: this.calendar,
					left: $event.button === 0 && $event.buttons > 0,
					right: $event.button === 1 && $event.buttons > 0,
					handled: false,
					$event: $event,
					$vm: this,
					$element: this.$el

				}, extra)
			}
		}
}
</script>

<style scoped lang="scss">

	.ds-day {
		flex: 1;
		width: 0;
		border-right: #e0e0e0 1px solid;
		border-bottom: #e0e0e0 1px solid;
		padding: 4px;
		overflow: hidden;
		user-select: none;

		.ds-dom {
			text-decoration: none;
			color: #212121;
			width: 24px;
			height: 24px;
			line-height: 24px;
			text-align: center;
			user-select: none;

			&:hover {
				text-decoration: underline;
			}

			&.ds-today-dom {
				border-radius: 12px;
				background-color: #4285f4;
				color: white;
				display: inline-block;
				position: relative;
				z-index: 1;
			}
		}

		.ds-hide-event {
			display: none;
		}
	}

	.ds-out-calendar {
		color: #757575;
	}

</style>
