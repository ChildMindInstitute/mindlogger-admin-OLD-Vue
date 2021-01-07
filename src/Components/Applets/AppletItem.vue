<template>
  <tr
    draggable
    @dragover.prevent
    @drop.stop="itemDropped"
    @dragstart.stop="dragStart"
    @dragenter.stop.prevent="isDragOver = true"
    @dragleave.stop.prevent="isDragOver = false"
    @dragover.stop="isDragOver = true"
    :class="{ 'drop-target': isDragOver, 'selected': selectedRowId === item.id }"
    @click="rowSelected"
  >
    <template v-for="header in headers">
      <td v-if="header.value !== 'actions'" :key="header.text" >
        <div class="d-flex item">
          <div v-if="header.isPrimaryColumn && item.isFolder" :style="rowStyle" >
            <v-btn icon small class="mr-1" @click="toggleExpanded" >
              <v-icon v-if="!item.isExpanded" >mdi-folder-outline</v-icon>
              <v-icon v-else>mdi-folder-open-outline</v-icon>
            </v-btn>
          </div>
          <div v-else-if="header.isPrimaryColumn && !item.isFolder && item.parentId" :style="rowStyle">
            <v-btn icon small depressed @click="$emit('pinStatusChanged', item)" class="mr-3">
              <v-icon color="primary" v-if="item.pinOrder > 0">mdi-pin</v-icon>
              <v-icon color="#474747" v-else >mdi-pin-off</v-icon>
            </v-btn>  
          </div>
          <div v-else-if="header.isPrimaryColumn && !item.isFolder && !item.parentId" :style="rowStyle">
              <v-avatar color="purple lighten-3" size="30" class="mr-2" style="color:white">{{item.name[0]}}</v-avatar> 
          </div>

          <v-text-field
              outlined
              @click.stop.self
              @blur="finishRenaming"
              @keydown.enter="onSaveFolder(item)" 
              v-model="item.name"
              v-if="item.isRenaming && header.isPrimaryColumn"
              hide-details
          ></v-text-field>
          <span v-else-if="header.value === 'updated'">
              {{ formatTimeAgo(item) }}
          </span>
          <span v-else  style="text-transform: capitalize">{{ item[header.value] }} <small style="color: steelblue" v-if="item.isFolder">({{appletCount}} applets)</small></span>
          <span v-else @dblclick="isRenaming = true">{{
              item[header.value]
            }} </span>

        </div>
      </td>
    </template>
    <td style="text-align: center; display:flex; align-self: center">
      <slot name="actions"></slot>
    </td>
  </tr>
</template>

<script>
/* eslint-disable */

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/fr';
TimeAgo.addLocale(en);
TimeAgo.addLocale(fr);

export default {
  name: "applet-item",
  components: {
    "applet-item": this,
  },
  data: () => ({
    isRenaming: false,
    rowStyle: {},
    isDragOver: false,
    showLastModified: true,
    selectedRowId: {}
  }),

  mounted() {
    this.rowStyle = {
      "margin-left": this.item.isFolder
          ? `${this.item.depth * 2}em`
          : `${this.item.depth * 3.1}em`,
    };
  },

  methods: {
    toggleExpanded() {
      this.$emit("expand-node", this.item);
    },
    finishRenaming() {
      this.item.isRenaming = false
      this.$emit('rename-completed', this.item);
    },
    onSaveFolder(item)
    {
      this.item.isRenaming = false
      this.$emit('rename-completed', this.item);
      this.$emit('save-folder', item)
    },
    rowSelected()
    {
      this.selectedRowId = this.item
      if (this.item.isFolder)
      {
        this.toggleExpanded();
      }
      this.$emit("row-selected", this.item);
    },
    newFolderCreated() {
      this.$emit("newfolder-created", this.item);
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
      if (this.item.isFolder && this.item.isNew) {
        this.$emit("unsaved-folder-operation", this.item);
        return;
      }
      this.$emit("item-dropped", this.item);
    },

    formatTimeAgo(item) {
      if (!item.updated) return "";
      const formatted = new TimeAgo(this.$i18n.locale.replace('_', '-')).format(new Date(item.updated), 'round');

      return formatted;
    }
  },

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

  computed : {
    appletCount() {
      return this.item.items.filter(item => !item.isFolder).length;
    }
  },

  watch: {
    item: {
      deep: true,
      handler() {
        this.rowStyle = {
          "margin-left": this.item.isFolder
              ? `${this.item.depth * 2}em`
              : `${this.item.depth * 3.1}em`,
        };
      },
    },
  }
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