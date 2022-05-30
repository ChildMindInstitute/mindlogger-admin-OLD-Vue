<template>
  <v-dialog
    max-width="600"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>
        {{ $t('selectAppletsForCase') }}
      </v-card-title>

      <v-card-text>
        <v-list
          subheader
          two-line
          flat
          class="mb-4"
        >
          <v-list-item-group
            multiple
          >
            <v-list-item
              v-for="applet in applets"
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
          @click="onSubmit"
        >
          {{ $t('submit') }}
        </v-btn>
      </v-card-actions>

      <AppletPassword
        ref="appletPasswordDialog"
        v-model="appletPasswordDialog.visible"
        :hasConfirmPassword="false"
        @set-password="onAppletPassword"
      />
    </v-card>
  </v-dialog>
</template>

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

    caseApplets: {
      type: Array,
      required: true
    },

    passwords: {
      type: Object,
      required: true
    },

    casePassword: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      applets: [],
      appletPasswordDialog: {
        visible: false,
        applet: {},
        defaultErrorMsg: ''
      },
    }
  },

  computed: {
    currentAccount () {
      return this.$store.state.currentAccount;
    },

    schedulableApplets () {
      return this.$store.state.currentAccount.applets.filter(
        applet => applet.roles.includes('coordinator') || applet.roles.includes('manager')
      )
    },
  },

  watch: {
    caseApplets() {
      this.initAppletList();
    },
  },

  mounted() {
    this.initAppletList();
  },

  methods: {
    initAppletList () {
      this.applets = []

      for (let applet of this.schedulableApplets) {
        const caseApplet = this.caseApplets.find(caseApplet => caseApplet.id == applet.id)

        if (!caseApplet) {
          this.applets.push({
            ...applet,
            selected: false
          });
        }
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

    onSubmit () {
      const obj = {}, applets = [];

      for (let applet of this.applets) {
        if (applet.selected) {
          obj[applet.id] = this.passwords[applet.id];

          applets.push(applet.id);
        }
      }

      for (let applet of this.caseApplets) {
        obj[applet.id] = this.passwords[applet.id];
      }

      const pass = encryption.encryptData({
        text: JSON.stringify(obj),
        key: encryption.getHashed(this.casePassword)
      })

      const form = new FormData();
      form.set(
        'password',
        JSON.stringify(pass)
      );

      this.$emit('submit', {
        form,
        applets
      });
    }
  }
}
</script>
