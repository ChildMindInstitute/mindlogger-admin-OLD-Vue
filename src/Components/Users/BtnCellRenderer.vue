<template>
  <span
    v-if="!params.data.roles.includes('owner')"
    class="btn-align"
  >
    <v-btn
      icon
      small
      color="primary"
      class="btn-edit"
      :disabled="params.data.roles == 'user'"
      @click.stop="btnEditedHandler($event)"
    >
      <v-icon v-if="params.data.roles != 'user'">edit</v-icon>
    </v-btn>
    <v-btn
      v-if="params.data.roles != 'user'"
      icon
      small
      color=""
      @click.stop="btnDeletedHandler()"
    >
      <v-icon>delete</v-icon>
    </v-btn>

    <v-menu 
      v-if="params.data.roles == 'user'"
      offset-y
    >
      <template v-slot:activator="{ attrs, on }">
        <v-btn
          icon
          small
          color=""
          v-bind="attrs"
          v-on="on"
        >
          <v-icon>delete</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          link
          @click="btnDeletedHandler('deleteUser')"
        >
          <v-list-item-title> Remove user </v-list-item-title>
        </v-list-item>
        <v-list-item 
          link
          @click="btnDeletedHandler('deleteData')"
        >
          <v-list-item-title> Remove user & data </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </span>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  methods: {
    /**
     * Edit action handler
     *
     * @return {void}
     */
    
    btnEditedHandler(event) {
      if (this.params.data.roles != 'user') {
        this.params.clicked({
          data: JSON.stringify(this.params.data), 
          action: 'edit'
        });
      } else {
        this.params.clicked({
          data: JSON.stringify(this.params.data), 
          action: 'userEdit'
        });
      }
    },
    
    /**
     * Delete action handler
     *
     * @return {void}
     */
    
    btnDeletedHandler(action = 'delete') {
      this.params.clicked({
        data: JSON.stringify(this.params.data), 
        action,
      });

      // if (this.params.data.roles != 'user') {
      //   this.params.clicked({
      //     data: JSON.stringify(this.params.data), 
      //     action: 'delete'
      //   });
      // } else {
      //   this.params.clicked({
      //     data: JSON.stringify(this.params.data), 
      //     action: 'userDelete'
      //   });
      // }
    }
  }
});
</script>

<style scoped lang="scss">
.btn-align {
  width: 100%;
  display: flex;
  justify-content: center;
}
.btn-edit {
  margin-right: 15px;
}
</style>