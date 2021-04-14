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
    @click="folderSelected"
  >
    <template v-for="header in headers">
      <td v-if="header.value !== 'actions'" :key="header.text" >
        <div class="d-flex item">
          <div v-if="header.isPrimaryColumn" :style="rowStyle" >
            <v-btn icon small class="mr-1">
              <v-icon v-if="!item.isExpanded" >mdi-folder-outline</v-icon>
              <v-icon v-else>mdi-folder-open-outline</v-icon>
            </v-btn>
          </div>
          <v-text-field
              outlined
              @click.stop.self
              @blur="finishRenaming"
              @keydown.enter="onSaveFolder(item)" 
              v-model="item.name"
              v-if="item.isRenaming && header.isPrimaryColumn"
              hide-details
          />
          <span v-else-if="header.value === 'updated'">
              {{ formatTimeAgo(item) }}
          </span>
          <span v-else style="text-transform: capitalize" @dblclick="isRenaming = true">{{ item[header.value] }} <small style="color: steelblue">({{appletCount}} applets)</small></span>
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

export default {
  name: "folder-item",
  components: {
    "folder-item": this,
  },
  mixins: [AppletMixin],
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
    isRenaming: false,
    isDragOver: false,
    showLastModified: true,
  }),
	computed : {
    appletCount() {
      return this.item.items.filter(item => !item.isFolder && item.roles.length).length;
    },
    rowStyle() {
      return {
        "margin-left": `${this.item.depth * 2}em`,
      }
    },
  },
  methods: {
    finishRenaming() {
      this.item.isRenaming = false
      this.$emit('rename-completed', this.item);
    },
    onSaveFolder(item) {
      this.item.isRenaming = false
      this.$emit('rename-completed', this.item);
      this.$emit('save-folder', item)
    },
    folderSelected() {
      this.$emit("expand-node", this.item);
      this.$emit("folder-selected", this.item);
    },

    dragStart(event) {

      if (this.item.isRenaming) {
        event.preventDefault();
        return;
      }

      if (this.item.isNew) {
        event.preventDefault();
        this.$emit("unsaved-folder-operation", this.item);
        return;
      }
      
      this.$emit("item-drag-started", this.item);
    },

    itemDropped() {
      this.isDragOver = false;
      if (this.item.isNew) {
        this.$emit("unsaved-folder-operation", this.item);
        return;
      }
      this.$emit("item-dropped", this.item);
    },
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