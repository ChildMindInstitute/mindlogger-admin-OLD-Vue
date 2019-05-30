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
            <v-btn color="primary" fab depressed small @click="addGroup" :disabled="!validGroup.valid">
              <v-icon dark>add</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
        <v-layout>
          <v-flex>
            <p v-if="validGroup.message">
              <small>{{validGroup.message}}</small>
            </p>
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
import _ from 'lodash';

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
    groupItems: [],
  }),
  computed: {
    readyToContinue() {
      return this.groupItems.length > 0;
    },
    groups() {
      return this.$store.state.currentApplet.groups || [];
    },
    validGroup() {
      if (!this.newGroupName) {
        return {valid: false, message: ''};
      }
      const matches = _.filter(this.groupItems, g => g.name === this.newGroupName).length;
      if (matches) {
        return {valid: false, message: 'you need a unique group name'}
      }
      return {valid: true}
    },
  },
  watch: {
    groups() {
      this.groupItems = this.groups;
    },
  },
  mounted() {
    this.groupItems = this.groups;
  },
  methods: {
    continueAction() {

    },
    addGroup() {
      const newGroups = this.groupItems;

      newGroups.push({
        name: this.newGroupName,
        description: this.newGroupDescription,
      });
      this.$store.commit('setGroups', newGroups);
      this.newGroupName = '';
      this.newGroupDescription = '';
      // this.$forceUpdate();
    },
    removeGroup(idx) {
      const newGroups = this.groupItems;
      newGroups.splice(idx, 1);
      this.$store.commit('setGroups', newGroups);
      // this.$forceUpdate();
    }
  }
}
</script>
