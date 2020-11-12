<template>
  <span
    v-if="params.value"
    class="btn-user-request"
    @click="userRequestHandler"
  >
    {{ $t('refreshRequest') }}
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
    
    userRequestHandler(event) {
      this.params.clicked(
        this.params.data
      );
    },
  }
});
</script>

<style scoped lang="scss">
.btn-user-request {
  color: red;
  justify-content: center;
  cursor: pointer;
}
</style>