<template>
  <v-dialog
    max-width="800"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-text>
        <h3>Applet Password</h3>
          
        <v-text-field
          v-model="password.data"
          label="Enter password"
          :append-icon="password.value ? 'mdi-eye' : 'mdi-eye-off'"
          :type="password.value ? 'password' : 'text'"
          @click:append="() => (password.value = !password.value)"
        />

        <v-text-field
          v-model="confirmPassword.data"
          label="Confirm password"
          :append-icon="confirmPassword.value ? 'mdi-eye' : 'mdi-eye-off'"
          :type="confirmPassword.value ? 'password' : 'text'"
          @click:append="() => (confirmPassword.value = !confirmPassword.value)"
        />

        <div
          v-if="error"
          class="error mb-4"
        >
          {{ error }}
        </div>

        <v-btn
          color="primary"
          :disabled="!!error"
          @click="onClickSubmitPassword"
        >
          Submit
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
    export default {
        name: 'AppletPassword',
        props: {
            value: {
                type: Boolean,
                required: true
            }
        },
        data: () => ({
            password: {
                data: '',
                value: true
            },
            confirmPassword: {
                data: '',
                value: true
            },
        }),
        computed: {
            error() {
                return this.errorPassword(this.password.data) || this.errorConfirmPassword(this.confirmPassword.data);
            }
        },
        methods: {
            errorPassword(value) {
                const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
                if (pattern.test(value)) {
                    return false;
                }

                return "Min. 8 characters with at least one capital letter, a number and a special character.";
            },
            errorConfirmPassword(value) {
                if (value == this.password.data) {
                    return false;
                }
                return 'Password does not match';
            },
            onClickSubmitPassword() {
                this.$emit('set-password', this.password.data);
            }
        }
    }
</script>