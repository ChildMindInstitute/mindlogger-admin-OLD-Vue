<template>
	<v-tooltip top >
		<template v-slot:activator="{ on }">
			<div v-on="on" >
				 <v-btn @click="$emit('click')" :disabled="disabled">
		    		<v-icon :color="color" v-if="icon">{{icon}}</v-icon>
					  <img height="24" alt='' v-else v-bind:src="require(`@/assets/${imageName}`)"/>
		  		</v-btn>
			</div>
		</template>
		<slot name="tooltip">
			<span>{{ tooltip }}</span>
		</slot>
	</v-tooltip>
</template>

<script>
	export default {
		props: {
			tooltip: {
				type: String,
				required: false,
			},
			icon: {
				type: String,
				required: false,
			},
			imageName: {
				type: String,
				required: false,
			},
			disabled: {
				type: Boolean,
				default: false,
			},
			color: {
				type: String,
				default: 'secondary'
			}
		}
	}
</script>		