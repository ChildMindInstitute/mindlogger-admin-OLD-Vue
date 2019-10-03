<template>
  <v-container>
    <slot name="header"></slot>
    <v-layout>
      <v-flex>
        <v-select label="add to selected to group"
         :disabled="!selected.length"
         v-model="selectedGroup"
         :items="groups">
         </v-select>
      </v-flex>
      <v-flex>
        <v-btn small fab :disabled="!selected.length" color="secondary" @click="addGroupToSelected">
          <v-icon>add</v-icon>
        </v-btn>
      </v-flex>
      <v-flex>
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout class="mt-3">
      <v-flex>
        <v-data-table :items="items"
         :headers="headers" :search="search"
         :pagination.sync="pagination" v-model="selected"
         select-all item-key="email" class="elevation-1">

          <template slot="headers" slot-scope="props">
            <tr>
              <th>
                <v-checkbox
                  :input-value="props.all"
                  :indeterminate="props.indeterminate"
                  primary
                  hide-details
                  @click.native="toggleAll"
                ></v-checkbox>
              </th>
              <th
                v-for="header in props.headers"
                :key="header.text"
                :class="['column sortable ', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                @click="changeSort(header.value)"
              >
                <v-icon small>arrow_upward</v-icon>
                {{ header.text }}
              </th>
            </tr>
          </template>

          <template slot="items" slot-scope="props">
            <td>
              <v-checkbox
                v-model="props.selected"
                primary
                hide-details
              ></v-checkbox>
            </td>
            <td>{{ props.item.email }}</td>
            <td>
              <ul class="nobullets">
                <li v-for="group in props.item.groups" :key="group.name">
                  <span v-if="group.status === 'active'">
                    {{group.role}} &#8212; {{ group.status }}
                  </span>
                  <span v-else>
                    {{group.role}} &#8212; {{ group.status }}
                    <v-btn small color="secondary" outline @click="resendClicked(props.item.email, group.role)">resend</v-btn>
                  </span>
                </li>
              </ul>
              <!-- {{ props.item.groups[0].status }} -->

            </td>
            <td>
              <span v-for="(chip, index) in props.item.groups" :key="`chip${index}`">
                <v-chip :close="chip.role !== 'user'" @input="deleteGroup(chip, props.item)"
                 v-model="chip.active">
                  {{chip.role}}
                </v-chip>
              </span>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
              <v-card class="mt-3">
            <v-card-text>
    <div class="mt-3 pt-3">
      <slot name="add"></slot>
    </div>
    <v-layout class="mt-3">
      <v-flex xs6 mr-3 pr-3>
        <v-text-field label="add new user by email" v-model="newUserEmail"></v-text-field>
      </v-flex>
      <v-flex xs4 mr-3 pr-3>
          <v-select label="group"
          v-model="newUserGroup"
         :items="groups">
         </v-select>
      </v-flex>
      <v-flex xs2>
        <v-btn large color="success" @click="addUser" :disabled="!validAdd">
          Invite
        </v-btn>
      </v-flex>
    </v-layout>
            </v-card-text></v-card>
  </v-container>
</template>
<style>
  ul.nobullets {
    list-style: none;
    text-align: center;
    list-style-position: inside;
  }
</style>
<script>
/**
 * this is a stateless component that renders a table with sorting and search
 * and the ability to add tags (e.g. groups) to users in the table
 * it will be used by the SetUsers component and the future SetReviewers component
 */
export default {
  name: 'UserTable',
  props: {
    groups: {
      type: Array,
    },
    items: {
      type: Array,
    },
  },
  data: () => ({
    /**
     * placeholder for the search text field that filters the table
     */
    search: '',
    /**
     * set the sorting parameters
     */
    pagination: {
      sortBy: 'email',
      descending: false,
    },
    /**
     * placeholder for a new user's group
     */
    newUserGroup: '',
    /**
     * placeholder for a new user's email
     */
    newUserEmail: '',
    /**
     * users that are selected in the table
     */
    selected: [],
    /**
     * placeholder for the group to add to the selected users
     */
    selectedGroup: '',
    /**
     * headers for the table
     */
    headers: [{
      text: 'user',
      value: 'email',
    },
    {
      text: 'status',
      value: 'status',
    },
    {
      text: 'groups',
      value: 'groups',
      sortable: false,
    }]
  }),
  computed: {
    /**
     * only allow adding to the table if
     * there is a valid email address and a group defined.
     * TODO: be a bit smarter on how you determine if an email address is valid
     * TODO: add a check for repeats: only allow unique email addresses to be added.
     */
    validAdd() {
      if (this.newUserEmail.indexOf('@') > 0 && this.newUserGroup) {
        return true;
      }
      return false;
    }
  },
  methods: {
    /**
     * the select all checkbox
     * TODO: add in the search filter so that we only select
     * users that match the search term (if it has been defined)
     */
    toggleAll () {
      if (this.selected.length) this.selected = []
      else this.selected = this.items.slice()
    },
    /**
     * method to change the direction of sorting
     */
    changeSort (column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending
      } else {
        this.pagination.sortBy = column
        this.pagination.descending = false
      }
    },
    /**
     * method to add a new user, clearing the form fields
     * after submitted.
     * This component emits an 'addUser' event, which the parent component
     * needs to handle appropriately.
     */
    addUser() {
      this.$emit('addUser', this.newUserEmail, this.newUserGroup);
      this.newUserGroup = '';
      this.newUserEmail = '';
    },
    /**
     * method to add a group to the selected set of users.
     * all it does is tell the parent component to handle it
     * by emitting an 'addGroupToSelected' event.
     */
    addGroupToSelected() {
      this.$emit('addGroupToSelected', this.selectedGroup, this.selected);
    },
    /**
     * method to resend an email when the 'resend' button is clicked for
     * a pending user.
     *
     * this component emits the sendInvitationEmail event that needs to be handled
     * by the parent
     */
    resendClicked(email, group) {
      this.$emit('sendInvitationEmail', email, group);
    },
    /**
     * delete group membership
     */
    deleteGroup(groupInfo, userInfo) {
      //console.log('you want to delete', val, item);
      this.$emit('removeFromGroup', groupInfo, userInfo);
    },
  }
}
</script>
