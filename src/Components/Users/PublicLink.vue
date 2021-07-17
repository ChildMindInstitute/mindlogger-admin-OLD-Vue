<template>
  <div>
    <h1>
      {{ $t("publicLink") }}

      <v-tooltip
        v-if="!inviteLink"
        bottom
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="mx-4"
            color="primary"
            v-bind="attrs"
            v-on="on"
            @click="postAppletPublicLink()"
          >
            {{ $t("generate") }}
          </v-btn>
        </template>
        <span>{{ $t("createInviteLinkText") }}</span>
      </v-tooltip>
    </h1>

    <v-container>
      <v-row v-if="inviteLink">
        <v-col
            cols="12"
        >
          <p class="ma-0">{{ $t("shareLinkText") }}</p>
        </v-col>

        <v-col
            cols="11"
        >
          <v-text-field class="pa-0 ma-0"
              :value="inviteLink.url"
              ref="textToCopy"
              readonly="readonly"
          />
        </v-col>

        <v-col
            align="center"
            align-self="center"
            cols="1"
        >
          <v-btn icon small @click="copyText">
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="inviteLink">
        <v-col
            align-self="center"
            cols="12"
            md="4"
        >
          <v-btn color="error" @click="deleteAppletPublicLink()">
            {{ $t("deleteInviteLink") }}
          </v-btn>
        </v-col>

        <v-col
            cols="12"
            md="8"
        >
          <p class="ma-0">Delete this link no longer allow anyone to</p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { RolesMixin } from '../Utils/mixins/RolesMixin';

import api from "../Utils/api/api.vue";

export default {
  name: "InviteLink",
  mixins: [RolesMixin],
  data() {
    return {
      inviteLink: null
    }
  },
  computed: {
    currentAppletMeta() {
      return this.$store.state.currentAppletMeta;
    },
    apiHost() {
      return this.$store.state.backend;
    },
    token() {
      return this.$store.state.auth.authToken.token;
    },
  },
  methods: {
    copyText () {
      const textToCopy = this.$refs.textToCopy.$el.querySelector('input');
      textToCopy.select();
      document.execCommand("copy");
    },

    populateAppletPublicLink(invite) {
      this.inviteLink = invite && invite.data && invite.data.inviteId ? {
        ...invite.data,
        url: `${process.env.VUE_APP_WEB_URI}/#/join/${invite.data.inviteId}`
      } : null;
    },

    postAppletPublicLink() {
      api.appletPublicLink({
        method: "POST",
        apiHost: this.apiHost,
        token: this.token,
        appletId: this.currentAppletMeta.id
      }).then((invite) => this.populateAppletPublicLink(invite))
    },

    deleteAppletPublicLink() {
      api.appletPublicLink({
        method: "DELETE",
        apiHost: this.apiHost,
        token: this.token,
        appletId: this.currentAppletMeta.id
      }).then(() => this.inviteLink = null)
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
  },
  async mounted() {
    await this.getAppletPublicLink();
  }
}
</script>
