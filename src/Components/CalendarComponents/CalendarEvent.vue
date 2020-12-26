<template>
	<div class="ds-calendar-event-menu" >
		<v-menu
				:content-class="contentClass"
				:disabled="!hasPopover"
				v-model="menu"
				v-bind="popoverProps">
			<template v-slot:activator={}>
				<v-card class="ds-calendar-event" dark flat
					 :style="style"
					 @click.stop="openEventDialog">

						<span v-if="showName">
							<slot name="eventTitle" v-bind="{calendarEvent, hasPrefix, getPrefix, details}">

							<v-icon class="ds-ev-icon"
									v-if="hasIcon"
									size="14"
									:style="{color: details.forecolor}">
								{{ details.icon }}
							</v-icon>
							<span v-if="hasPrefix">
								{{ getPrefix }}
							</span>
							<strong class="ds-ev-title">{{ details.title }}</strong>
							<span class="ds-ev-description">{{ details.description }}</span>

							</slot>
						</span>

						<span v-else>
							<slot name="eventEmpty" v-bind="{calendarEvent, details}">&nbsp;</slot>
						</span>

				</v-card>
			</template>

			<slot name="eventPopover" v-bind="{calendarEvent, calendar, edit, details, close}"></slot>

		</v-menu>

	</div>
</template>

<script>
import {Calendar, CalendarEvent, Day, Functions as fn} from 'dayspan'
import {getEventColor} from "@/Components/CalendarComponents/activityColorPalette.js";

export default {

	name: 'dsCalendarEvent',

	props:
		{
			calendarEvent:
				{
					required: true,
					type: CalendarEvent
				},

			calendar:
				{
					required: true,
					type: Calendar
				},

			index:
				{
					type: Number,
					default () {
						return this.$dsDefaults().index
					}
				},

			popoverProps:
				{
					validate (x) {
						return this.$dsValidate(x, 'popoverProps')
					},
					default () {
						return this.$dsDefaults().popoverProps
					}
				},

			isPlaceholderWithDay:
				{
					type: Day
				}
		},

	computed:
		{
			style () {
				const newStyle = this.isPlaceholderWithDay ?
					this.$dayspan.getStylePlaceholderFull(this.details, this.calendarEvent, this.index, this.isPlaceholderWithDay) :
					this.$dayspan.getStyleFull(this.details, this.calendarEvent, this.index);
				if (newStyle.right) {
					newStyle.right = 0
				}
				const activityColor = getEventColor(this.details.activity_id)
				if (activityColor)
        {
          newStyle.background = this.getHexColor(activityColor);
        }
				return newStyle;
			},

			contentClass () {
				return this.$dayspan.fullscreenPopovers ? 'ds-fullscreen' : ''
			},

			sameDayEvents () {
				return this.calendarEvent.event.schedule.iterateSpans(this.calendarEvent.day, true).list()
			},

			hasPrefix () {
				return !this.calendarEvent.fullDay && this.sameDayEvents.length > 0
			},

			hasIcon () {
				return !!(this.$dayspan.supports.icon && this.details.icon)
			},

			getPrefix () {
				return this.$dayspan.getPrefix(this.calendarEvent, this.sameDayEvents)
			},

			showName () {
				return this.isPlaceholderWithDay ?
					this.isPlaceholderWithDay.sameDay(this.calendarEvent.start) :
					this.calendarEvent.starting || (
						this.calendar &&
						!this.calendar.filled.contains(this.calendarEvent.time.start) &&
						this.calendar.filled.start.sameDay(this.calendarEvent.day)
					)
			},

			hasPopover () {
				return !!this.$scopedSlots.eventPopover
			},

			details () {
				return this.calendarEvent.event.data
			}
		},

	data: vm => ({
		menu: false
	}),

	methods:
		{
			close () {
				this.menu = false
			},

      getHexColor(colorName) {
        return _.filter(this.$dayspan.colors, c => c.text === colorName)[0].value;
      },

			edit () {
				if (this.handlesEvents()) {
					this.$emit('edit', this.calendarEvent)
				}
			},

			openEventDialog ($event) {
				$event.stopPropagation();
				this.edit();
			},

			mouseEnterEvent ($event) {
				if (this.handlesEvents($event)) {
					this.$emit('mouse-enter-event', this.getEvent('mouse-enter-event', $event))
				}
			},

			mouseLeaveEvent ($event) {
				if (this.handlesEvents($event)) {
					this.$emit('mouse-leave-event', this.getEvent('mouse-leave-event', $event))
				}
			},

			mouseDownEvent ($event) {
				// if (this.handlesEvents($event)) {
				// 	this.$emit('mouse-down-event', this.getEvent('mouse-down-event', $event))
				// }
			},

			mouseUpEvent ($event) {
				// if (this.handlesEvents($event)) {
				// 	this.$emit('mouse-up-event', this.getEvent('mouse-up-event', $event))
				// }
			},

			handlesEvents ($event) {
				var handles = !this.isPlaceholderWithDay

				if (handles && $event) {
					$event.stopPropagation()
				}

				return handles
			},

			getEvent (type, $event, extra = {}) {
				return fn.extend({

					type: type,
					calendarEvent: this.calendarEvent,
					calendar: this.calendar,
					details: this.details,
					left: $event.button === 0,
					right: $event.button === 1,
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

	.ds-calendar-event-menu {
		width: 100%;
		height: 18px;
    margin-top: 2px;
    margin-bottom: 2px;
		pointer-events: none;
		position: relative;
	}

	.ds-calendar-event {
		top: 0px !important;
		color: white;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding-left: 0.5em;
		font-size: 12px;
		cursor: pointer;
		position: absolute;
		user-select: none;
		display: block;
		margin: 0;
		border-radius: 2px;
		pointer-events: all;
	}

</style>
