<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="users"
      class="elevation-1"
    >
      <template
        slot="items"
        slot-scope="props"
      >
        <td>{{ props.item._id }}</td>
        <td>
          {{ props.item.displayName }}
        </td>
      </template>
    </v-data-table>
  </v-container>
</template>
<style>

</style>
<script>

export default {
  name: 'ActiveUserTable',
  props: {
    users: {
      type: Array,
      default: function () {
        return []
      },
    },
  },
  data: () => ({
    headers: [
      {
        text: 'ID',
        align: 'left',
        sortable: false,
        value: '_id'
      },
      { text: 'Display Name', value: 'displayName' },
    ],
  })
}
</script>
