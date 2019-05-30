<template>
  <v-container>
    <slot name="header"></slot>
    <v-layout>
      <v-flex>
        <v-select label="add to selected to group"
         :disabled="!selected.length"
         :items="groups">
         </v-select>
      </v-flex>
      <v-flex>
        <v-btn small fab :disabled="!selected.length" color="secondary">
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
              <span v-if="props.item.status === 'accepted'">
                {{ props.item.status }}
              </span>
              <span v-else>
                {{ props.item.status }}
                <v-btn small color="secondary" outline>resend</v-btn>
              </span>
            </td>
            <td>
              <span v-for="(chip, index) in props.item.groups" :key="`chip${index}`">
                <v-chip close
                 v-model="chip.active">
                  {{chip.name}}
                </v-chip>
              </span>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
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
        <v-btn large color="success" @click="addUser">
          Invite
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
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
    search: '',
    pagination: {
      sortBy: 'email',
      descending: false,
    },
    newUserGroup: '',
    newUserEmail: '',
    selected: [],
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
  methods: {
    toggleAll () {
      if (this.selected.length) this.selected = []
      else this.selected = this.items.slice()
    },
    changeSort (column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending
      } else {
        this.pagination.sortBy = column
        this.pagination.descending = false
      }
    },
    addUser() {
      this.$emit('addUser', this.newUserEmail, this.newUserGroup);
    },
  }
}
</script>
