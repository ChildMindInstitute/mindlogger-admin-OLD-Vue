<template>
  <span
    v-if="!params.data.roles.includes('owner') && params.data.roles != 'user'"
    class="btn-align"
  >
    <v-btn
      icon
      small
      color="primary"
      class="btn-edit"
      @click.stop="btnEditedHandler($event)"
    >
      <v-icon>edit</v-icon>
    </v-btn>
    <v-btn
      icon
      small
      color=""
      @click.stop="btnDeletedHandler()"
    >
      <v-icon>delete</v-icon>
    </v-btn>
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
      this.params.clicked({
        data: JSON.stringify(this.params.data), 
        action: 'edit'
      });
    },
    
    /**
     * Delete action handler
     *
     * @return {void}
     */
    
    btnDeletedHandler() {
      this.params.clicked({
        data: JSON.stringify(this.params.data), 
        action: 'delete'
      });
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