<template>
  <v-dialog
    max-width="600"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title class="link-user-title text-center">
        {{ $t('linkUser') }}
      </v-card-title>

      <v-card-text>
        <div class="link-user-text">
          {{ $t('linkAccountWithNewCase') }}
        </div>

        <v-radio-group v-model="linkUser">
          <v-radio
            label="Yes, I do"
            :value="true"
          />

          <v-radio
            label="No, I don't"
            :value="false"
          />
        </v-radio-group>

        <v-list
          v-if="linkUser"
          subheader
          two-line
          flat
          class="mb-4"
        >
          <v-subheader>{{ $t('selectApplets') }}</v-subheader>
          <v-list-item-group
            multiple
          >
            <v-list-item
              v-for="applet in schedulableApplets"
              :key="applet.id"
            >
              <v-list-item-action @click="onUpdateAppletStatus(applet)">
                <v-checkbox
                  :input-value="applet.selected"
                  readonly
                />
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title>{{ applet.displayName }}</v-list-item-title>
                <v-list-item-subtitle>{{ applet.description }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          :disabled="linkUser && !selectedCount"
          @click="onSubmit"
        >
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <AppletPassword
      ref="appletPasswordDialog"
      v-model="appletPasswordDialog.visible"
      :hasConfirmPassword="false"
      @set-password="onAppletPassword"
    />
  </v-dialog>
</template>

<style scoped>
.link-user-title {
  font-size: 28px !important;
}

.link-user-text {
  font-size: 18px;
}
</style>

<script>
import AppletPassword from "./AppletPassword";
import encryption from "../encryption/encryption";

export default {
  components: {
    AppletPassword,
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    passwords: {
      type: Object,
      required: true
    },
    casePassword: {
      type: String,
      required: true
    },
    caseId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      appletPasswordDialog: {
        visible: false,
        applet: {},
        defaultErrorMsg: ''
      },

      schedulableApplets: [],
      linkUser: true,
    }
  },

  computed: {
    accountApplets () {
      return this.$store.state.currentAccount.applets;
    },

    currentAccount () {
      return this.$store.state.currentAccount;
    },

    selectedCount () {
      let count = 0;

      for (let applet of this.schedulableApplets) {
        if (applet.selected) {
          count++;
        }
      }

      return count;
    }
  },

  mounted() {
    this.schedulableApplets = this.accountApplets.filter(applet => applet.roles.includes('coordinator')).map(applet => ({
      ...applet,
      selected: false,
    }))
  },

  methods: {
    onSubmit() {
      if (!this.linkUser) {
        this.$emit('input', false)
        return ;
      }

      const obj = {}, applets = [];
      for (let applet of this.schedulableApplets) {
        if (applet.selected) {
          obj[applet.id] = this.passwords[applet.id];

          applets.push(applet.id);
        }
      }

      const pass = encryption.encryptData({ text: JSON.stringify(obj), key: encryption.getHashed(this.casePassword) })
      const form = new FormData();
      form.set(
        'password',
        JSON.stringify(pass)
      );

      this.$emit('link', {
        form,
        applets
      });
    },

    onAppletPassword (appletPassword) {
      const applet = this.appletPasswordDialog.applet;

      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword,
        accountId: this.currentAccount.accountId,
        prime: applet.encryption.appletPrime,
        baseNumber: applet.encryption.base,
      });

      if (
        encryptionInfo
          .getPublicKey()
          .equals(Buffer.from(applet.encryption.appletPublicKey))
      ) {
        this.appletPasswordDialog.visible = false;

        this.$emit('updatePassword', {
          appletId: applet.id,
          password: appletPassword
        })

        this.$set(applet, 'selected', true)
      } else {
        this.$refs.appletPasswordDialog.defaultErrorMsg = this.$t('incorrectAppletPassword');
      }
    },

    onUpdateAppletStatus (applet) {
      if (
        this.passwords[applet.id]
      ) {
        this.$set(applet, 'selected', !applet.selected);
      } else {
        this.$set(this, 'appletPasswordDialog', {
          visible: true,
          applet
        })
      }
    }
  }
}
</script>
