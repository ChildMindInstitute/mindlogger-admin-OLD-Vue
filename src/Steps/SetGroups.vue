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
    /**
     * placeholder variable for group name
     */
    newGroupName: '',
    /**
     * placeholder variable for group description
     */
    newGroupDescription: '',
    /**
     * headers for the table component
     */
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
    /**
     * placeholder for items in the table
     * e.g. group names and group description
     */
    groupItems: [],
  }),
  computed: {
    /**
     * shortcut for current applet
     */
    currentApplet() {
      return this.$store.state.currentApplet;
    }, 
    /**
     * there needs to be at least 1 group to continue
     */
    readyToContinue() {
      return this.groupItems.length > 0;
    },
    /**
     * grab the groups from the store
     */
    groups() {
      if (this.currentApplet) {
        return this.$store.state.currentApplet.groups || [];
      }
      return [];
    },
    /**
     * only let people add to a group if
     * 1. it has a name
     * 2. it is a unique name
     */
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
    /**
     * if the groups value in the store changes, update the items in the table.
     */
    groups() {
      this.groupItems = this.groups;
    },
  },
  /**
   * set the table's items from the groups in the store
   */
  mounted() {
    this.groupItems = this.groups;
  },
  methods: {
    /**
    * TODO: save the groups when the user continues
    */
    continueAction() {

    },
    /**
     * add a new group to the table and update the store.
     */
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
    /**
     * remove a group by its index and update the store.
     */
    removeGroup(idx) {
      const newGroups = this.groupItems;
      newGroups.splice(idx, 1);
      this.$store.commit('setGroups', newGroups);
      // this.$forceUpdate();
    }
  }
}
</script>
