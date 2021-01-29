<template>
  <tr
    draggable
    @dragover.prevent
    @drop.stop="itemDropped"
    @dragstart.stop="dragStart"
    @dragenter.stop.prevent="isDragOver = true"
    @dragleave.stop.prevent="isDragOver = false"
    @dragover.stop="isDragOver = true"
    :class="{ 'drop-target': isDragOver }"
    @mouseover="appletHovered"
  >
    <template v-for="header in headers">
      <td v-if="header.value !== 'actions'" :key="header.text" @click="appletClicked">
        <div class="d-flex item">
          <template v-if="header.isPrimaryColumn">
            <div v-if="item.parentId" :style="rowStyle">
              <v-btn icon small depressed @click="$emit('pinStatusChanged', item)" class="mr-3">
                <v-icon color="primary" v-if="item.pinOrder > 0">mdi-pin</v-icon>
                <v-icon color="#474747" v-else >mdi-pin-off</v-icon>
              </v-btn>  
            </div>
            <div v-else :style="rowStyle">
              <v-avatar color="blue" size="30" class="mr-2" style="color:white">{{item.name[0]}}</v-avatar> 
            </div>
          </template>
          <span v-if="header.value === 'updated'">
              {{ formatTimeAgo(item) }}
          </span>
          <span v-else  style="text-transform: capitalize">{{ item[header.value] }}</span>
        </div>
      </td>
    </template>
    <td style="text-align: center;  align-self: center">
      <slot name="actions"></slot>
    </td>
  </tr>
</template>

<script>
/* eslint-disable */

import { AppletMixin } from '../Utils/mixins/AppletMixin';
import { RolesMixin } from '../Utils/mixins/RolesMixin';

export default {
  name: "applet-item",
  components: {
    "applet-item": this,
  },
  mixins: [AppletMixin, RolesMixin],
  props: {
    item: {
      type: Object,
      required: true,
      default: () => {},
    },
    headers: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data: () => ({
    isDragOver: false,
    showLastModified: true,
  }),
	computed : {
    rowStyle() {
      return {
        "margin-left": `${this.item.depth * 3.1}em`,
      }
    },
  },
  methods: {
    dragStart(event) {
      this.$emit("item-drag-started", this.item);
    },

    itemDropped() {
      this.isDragOver = false;
      this.$emit("item-dropped", this.item);
    },

		canViewUsers() {
			return this.hasRoles(this.item, 'reviewer', 'manager', 'coordinator');
		},
    appletClicked() {
      if (this.canViewUsers()) {
        this.$emit('applet-clicked', this.item);
      } else {
        console.log('Permission denied');
      }
    },
    appletHovered() {
      this.$emit('applet-hovered', this.item);
    }
  },
};
</script>

<style scoped lang="scss">
.last-modified {
  display: none;
}
tr {
  cursor: pointer;
  user-select: none;
}
tr:hover {
  background-color: #f0f0f0;
}
tr.selected {
  background-color: rgb(239, 245, 255);
}

.drop-target {
  background: steelblue !important;
  color: white;
}

.item {
  cursor: pointer;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently */
}

.d-flex {
  align-items: center;
}

img {
  margin-right: 0.5em;
}
</style>