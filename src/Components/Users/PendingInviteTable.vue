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
        <td>{{ `https://web.mindlogger.org/#/invitation/${props.item._id}` }}</td>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  name: 'PendingInviteTable',
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
        value: '_id',
      },
      {
        text: 'Invitation Link',
        value: 'invitationLink',
      },
    ],
  }),
}
</script>
