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
      <td v-if="header.value !== 'actions'" :key="header.text">
        <div class="d-flex item">
          <div v-if="header.isPrimaryColumn && item.isFolder" :style="rowStyle">
            <v-btn
              icon
              small
              @click="toggleExpanded"
            >
              <v-icon v-if="!item.isExpanded">mdi-folder-outline</v-icon>
              <v-icon v-else>mdi-folder-open-outline</v-icon>
            </v-btn>
          </div>
          <div v-else-if="header.isPrimaryColumn && !item.isFolder" :style="rowStyle">
            <v-btn small icon>
              <v-icon >mdi-pin</v-icon>
            </v-btn>
          </div>
          <v-text-field
              outlined
              @blur="item.isRenaming = false"
              @keydown.enter="item.isRenaming = false"
              v-model="item.name"
              v-if="item.isRenaming && header.isPrimaryColumn"
              hide-details
          ></v-text-field>
          <span v-else-if="header.value === 'updated'">
              {{ item.timeAgo }}
            </span>
          <span v-else>{{ item[header.value] }}</span>
          <span v-else @dblclick="isRenaming = true">{{
              item[header.value]
            }}</span>
        </div>
      </td>
    </template>
    <td style="text-align: center">
      <slot name="actions"></slot>
    </td>
  </tr>
</template>

<script>
/* eslint-disable */

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

    dragStart() {
      this.$emit("item-drag-started", this.item);
    },

    itemDropped() {
      this.isDragOver = false;
      this.$emit("item-dropped", this.item);
    },
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