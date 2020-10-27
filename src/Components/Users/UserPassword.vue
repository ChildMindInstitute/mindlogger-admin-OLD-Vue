<template>
  <v-dialog max-width="800" :value="value" @input="$emit('input', $event)">
    <v-card>
      <v-card-text>
        <template v-if="error === ''">
          <h3>{{ $t('userPassword') }}</h3>

          <v-text-field
            v-model="password.data"
            label="Enter password"
            :append-icon="password.value ? 'mdi-eye' : 'mdi-eye-off'"
            :type="password.value ? 'password' : 'text'"
            @click:append="() => (password.value = !password.value)"
          />

          <v-btn color="primary" @click="onClickSubmitPassword">
            {{ $t('submit') }}
          </v-btn>
        </template>
        <template v-else>
          <div v-if="error" class="mb-4">
            {{ error }}
          </div>
          <v-btn color="primary" @click="onClickRemoveError">
            {{ $t('close') }}
          </v-btn>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'UserPassword',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    error: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    password: {
      data: '',
      value: true,
    },
  }),
  methods: {
    onClickSubmitPassword() {
      this.$emit('set-password', this.password.data);
    },
    onClickRemoveError() {
      this.$emit('remove-error');
    },
  },
};
</script>
