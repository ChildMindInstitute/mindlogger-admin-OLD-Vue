<template>
  <v-dialog
    max-width="600"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>
        {{ $t('createCaseId') }}
      </v-card-title>

      <v-card-text>
        <v-combobox
          v-model="caseID"
          class="mb-2"
          :items="items"
          label="ID of case"
          dense
        />

        <v-text-field
          v-model="password.data"
          :label="$t('enterPassword')"
          :append-icon="password.value ? 'mdi-eye' : 'mdi-eye-off'"
          :type="password.value ? 'password' : 'text'"
          @click:append="() => (password.value = !password.value)"
        />

        <v-text-field
          v-model="confirmPassword.data"
          :label="$t('confirmPassword')"
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
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          color="primary"
          :disabled="!!error"
          @click="onSubmit"
        >
          {{ $t('submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.applet-list {
  border: 1px solid gray;
  border-radius: 5px;
}
</style>

<script>
import api from "../api/api";

export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },
  },

  data() {
    return {
      caseID: '',
      MRNs: [],

      password: {
        data: '',
        value: true,
      },
      confirmPassword: {
        data: '',
        value: true,
      },

      users: []
    }
  },

  computed: {
    accountApplets () {
      return this.$store.state.currentAccount.applets;
    },

    items () {
      return this.MRNs.map(d => d.MRN)
    },

    error () {
      return (this.errorPassword(this.password.data) || this.errorConfirmPassword(this.confirmPassword.data));
    },
  },

  mounted() {
    api.getAccountUserList({
      apiHost: this.$store.state.backend,
      token: this.$store.state.auth.authToken.token,
      role: 'user',
      MRN: '',
      pagination: { allow: false },
      sort: { allow: false }
    }).then(resp => this.updateMRNList(resp.data.items))
  },

  methods: {
    errorPassword (value) {
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
      if (pattern.test(value)) {
        return false;
      }

      return this.$t('invalidAppletPasswordFormat');
    },

    errorConfirmPassword (value) {
      if (value == this.password.data) {
        return false;
      }

      return this.$t('passwordDontMatch');
    },

    updateMRNList (users) {
      const MRNList = [];
      for (let i = 0; i < users.length; i++) {
        for (const appletId in users[i]) {
          const applet = this.accountApplets.find(applet => applet.id === appletId);
          const profile = users[i][appletId];

          if (applet.roles.includes('coordinator') && !profile.fake) {
            MRNList.push({
              index: i,
              appletId,
              MRN: profile.MRN,
              profileId: profile._id
            })
          }
        }
      }

      this.MRNs = MRNList;
    },

    onSubmit () {
      this.$emit('create', {
        caseID: this.caseID,
        password: this.password.data,
        ...( this.MRNs.find(obj => obj.MRN == this.caseID) || {} )
      })
    },
  }
}
</script>
