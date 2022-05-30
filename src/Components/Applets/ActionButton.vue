<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <div v-on="on">
        <v-btn
          :disabled="disabled"
          @click="$emit('click')"
        >
          <v-icon
            v-if="icon"
            :color="color"
            :style="`transform: rotate(${rotation})`"
          >
            {{ icon }}
          </v-icon>
          <img
            v-else
            height="24"
            alt=""
            :style="`transform: rotate(${rotation})`"
            :src="require(`@/assets/${imageName}`)"
          >
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
			},
			rotation: {
				type: String,
				default: '0deg'
			}
		}
	}
</script>