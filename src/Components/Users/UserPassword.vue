<template>
  <v-dialog max-width="800" :value="value" @input="$emit('input', $event)">
    <v-card>
      <v-card-text>
        <h3>User Password</h3>

        <v-text-field
          v-model="password.data"
          label="Enter password"
          :append-icon="password.value ? 'mdi-eye' : 'mdi-eye-off'"
          :type="password.value ? 'password' : 'text'"
          @click:append="() => (password.value = !password.value)"
        />
        <!-- 
        <div v-if="error" class="error mb-4">
          {{ error }}
        </div> -->

        <v-btn color="primary" @click="onClickSubmitPassword">
          Submit
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "UserPassword",
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    password: {
      data: "",
      value: true,
    },
  }),
  methods: {
    onClickSubmitPassword() {
      this.$emit("set-password", this.password.data);
    },
  },
};
</script>
