<template>
  <div>
    <h1>
      {{ $t("publicLink") }}

      <v-tooltip
        v-if="!publicLink"
        bottom
      >
        <template v-slot:activator="{ on, attrs }">
          <div
            style="display: inline-block;"
            v-on="on"
          >
            <v-btn
              class="mx-4"
              color="primary"
              v-bind="attrs"
              :disabled="!isAvailable"
              @click="publicLinkDialog = true"
            >
              {{ $t("generate") }}
            </v-btn>
          </div>
        </template>
        <span v-if="isAvailable">{{ $t("createInviteLinkText") }}</span>
        <span v-else>
          This applet contains items that are not supported by the public link feature. Please update your applet to remove unsupported item types.
          <br>
          Types supported: Radio button, Checkbox, Slider, Text, Age Selector, Dropdown list, Duration picker and Cumulative score item
        </span>
      </v-tooltip>
    </h1>

    <v-container>
      <v-row v-if="publicLink">
        <v-col
          cols="12"
        >
          <p
            v-if="publicLink.requireLogin"
            class="ma-0"
          >
            {{ $t("shareLinkText") }}
          </p>

          <p
            v-else
            class="ma-0"
          >
            Share the following link for users to take assessment without account.
          </p>
        </v-col>

        <v-col
          cols="11"
        >
          <v-text-field
            ref="textToCopy"
            class="pa-0 ma-0"
            :value="publicLink.url"
            readonly="readonly"
          />
        </v-col>

        <v-col
          align="center"
          align-self="center"
          cols="1"
        >
          <v-btn
            icon
            small
            @click="copyText"
          >
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="publicLink">
        <v-col
          align-self="center"
          cols="12"
          md="4"
        >
          <v-btn
            color="error"
            @click="deleteAppletPublicLink()"
          >
            {{ $t("deleteInviteLink") }}
          </v-btn>
        </v-col>

        <v-col
          cols="12"
          md="8"
        >
          <p class="ma-0">
            Delete this link no longer allow anyone to access url
          </p>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog
      v-model="publicLinkDialog"
      max-width="800"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t('publicLink') }}
        </v-card-title>

        <v-card-text>
          {{ $t('requireCreateAccount') }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="primary darken-1"
            text
            @click="postAppletPublicLink(true)"
          >
            {{ $t('Yes') }}
          </v-btn>

          <v-btn
            color="primary darken-1"
            text
            @click="postAppletPublicLink(false)"
          >
            {{ $t('No') }}
          </v-btn>

          <v-btn
            color="primary darken-1"
            text
            @click="publicLinkDialog=false"
          >
            {{ $t('cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { RolesMixin } from '../Utils/mixins/RolesMixin';

import api from "../Utils/api/api.vue";
import _ from 'lodash';

export default {
  name: "InviteLink",
  mixins: [RolesMixin],
  data() {
    return {
      publicLink: null,
      publicLinkDialog: false
    }
  },
  computed: {
    currentAppletMeta() {
      return this.$store.state.currentAppletMeta;
    },
    currentAppletData() {
      return this.$store.state.currentAppletData;
    },
    apiHost() {
      return this.$store.state.backend;
    },
    token() {
      return this.$store.state.auth.authToken.token;
    },
    isAvailable () {
      // const inputTypes = ["radio", "checkbox", "slider", "text", "ageSelector", "dropdownList", "duration"]
      // const items = Object.values(this.currentAppletData.items);
      // for (const item of items) {
      //   const inputType = _.get(item, ['reprolib:terms/inputType', 0, '@value']);
      //   if (!inputTypes.includes(inputType)) {
      //     return false;
      //   }
      // }
      return true;
    }
  },
  async mounted() {
    await this.getAppletPublicLink();
  },
  methods: {
    copyText () {
      const textToCopy = this.$refs.textToCopy.$el.querySelector('input');
      textToCopy.select();
      document.execCommand("copy");
    },

    populateAppletPublicLink(invite) {
      if (!invite || !invite.data || !invite.data.inviteId) {
        return null;
      }

      let url = `${process.env.VUE_APP_WEB_URI}/join/${invite.data.inviteId}`;

      if (invite.data.requireLogin === false) {
        url = `${process.env.VUE_APP_WEB_URI}/applet/public/${invite.data.inviteId}`;
      }

      this.publicLink = {
        ...invite.data,
        url
      }
    },

    postAppletPublicLink(requireLogin) {
      this.publicLinkDialog = false;

      api.appletPublicLink({
        method: "POST",
        apiHost: this.apiHost,
        token: this.token,
        appletId: this.currentAppletMeta.id,
        requireLogin
      }).then((invite) => {
        this.populateAppletPublicLink(invite)
        this.analytics.track('Public Link sent successfully');
      })
    },

    deleteAppletPublicLink() {
      api.appletPublicLink({
        method: "DELETE",
        apiHost: this.apiHost,
        token: this.token,
        appletId: this.currentAppletMeta.id
      }).then(() => this.publicLink = null)
    },

    async getAppletPublicLink() {
      const invite = await api.appletPublicLink({
        method: "GET",
        apiHost: this.apiHost,
        token: this.token,
        appletId: this.currentAppletMeta.id
      });

      this.populateAppletPublicLink(invite);
    }
  }
}
</script>
