<template>
  <v-data-table
      :headers="headers"
      :items="visibleItems"
      sort-by="calories"
      class="elevation-4"
  >
    <template v-slot:item="{ item }">
      <applet-item
          v-on:expand-node="toggleExpand"
          :headers="headers"
          v-on:newfolder-created="onNewFolderCreated"
          v-on:item-drag-started="dragStarted"
          v-on:item-dropped="itemDropped"
          :item="item"
          :key="item.id"
      >
        <template v-slot:actions v-if="!item.isFolder">
          <v-btn fab text small class="mx-1" color="red"
          ><v-icon>mdi-trash-can-outline</v-icon></v-btn
          >
          <v-btn text small class="mx-1"
          ><v-icon>mdi-folder-refresh-outline</v-icon></v-btn
          >
          <v-btn text small class="mx-1">Select</v-btn>
          <v-btn text small class="mx-1"
          ><v-icon>mdi-content-copy</v-icon></v-btn
          >
        </template>
      </applet-item>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary"> No data </v-btn>
    </template>
  </v-data-table>
</template>

<script>
import AppletItem from "./AppletItem";
/* eslint-disable */

export default {
  name: "applet-directory",
  components: {
    "applet-item": AppletItem,
  },
  data: () => ({
    headers: [
      {
        text: "Name",
        sortable: true,
        value: "name",
        isPrimaryColumn: true,
      },
      {
        text: "Description",
        value: "description",
      },
      {
        text: "Actions",
        value: "actions",
      },
    ],
    showSelectAll: true,
    directoryLookUp: {},
    flattenedDirectoryItems: [],
    visibleItems: [],
    draggedItem: undefined,
  }),

  mounted() {
    this.items.forEach((item) => {
      this.flattenDirectory(item);
    });
    this.visibleItems = this.flattenedDirectoryItems.filter(
        (item) => item.isVisible
    );
  },

  methods: {

  },
  props: {
    items: {
      type: Array,
      required: true,
      default: () => {},
    },
  },
};
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #eee !important;
}

.d-flex {
  align-items: center;
}

img {
  margin-right: 0.5em;
}
</style>