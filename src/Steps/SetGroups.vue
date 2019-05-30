<template>
  <v-container>
    <h1>Groups</h1>
    <p>
      Groups give you fine-grained control over data access.
      Reviewers assigned to a group can see data of all users in that group.
    </p>
    <div>
      <v-container>
        <v-layout>
          <v-flex class="mr-2" xs4>
            <v-text-field label="new group name" v-model="newGroupName"></v-text-field>
          </v-flex>
          <v-flex class="mr-2">
            <v-text-field label="description" v-model="newGroupDescription"></v-text-field>
          </v-flex>
          <v-flex xs1>
            <v-btn color="primary" fab depressed small @click="addGroup">
              <v-icon dark>add</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </div>
    <div>
      <v-data-table
        :headers="headers"
        :items="groupItems"
        class="elevation-1"
      >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.description }}</td>
        <td>
          <v-btn color="secondary" fab small depressed @click="removeGroup(props.index)">
            <v-icon dark>remove</v-icon>
          </v-btn>
        </td>
      </template>
      </v-data-table>

    </div>
  </v-container>
</template>

<script>
export default {
  name: 'groups',
  data: () => ({
    newGroupName: '',
    newGroupDescription: '',
    headers: [
      {
        text: 'Name',
        value: 'name',
        sortable: true,
        align: 'left',
      },
      {
        text: 'Description',
        value: 'description',
        sortable: false,
        align: 'left',
      },
      {text: 'remove'}
    ],
    groupItems: [
      {
        name: 'all',
        description: 'All users'
      },
      {
        name: 'testers',
        description: 'a subset of users who are testers'
      },
      {
        name: 'subjects',
        description: 'a subset of users who are the study subjects'
      },
    ],
  }),
  computed: {
    readyToContinue() {
      return this.groupItems.length > 0;
    },
  },
  methods: {
    continueAction() {

    },
    addGroup() {
      this.groupItems.push({
        name: this.newGroupName,
        description: this.newGroupDescription,
      })
    },
    removeGroup(idx) {
      this.groupItems.splice(idx, 1);
    }
  }
}
</script>
