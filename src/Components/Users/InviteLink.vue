<template>
  <div>
    <h1>{{ $t("inviteLink") }}</h1>

    <v-container>
      <v-row v-if="inviteLink !== undefined">
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

      <v-row v-if="inviteLink !== undefined">
        <v-col
            align-self="center"
            cols="12"
            md="4"
        >
          <v-btn color="error" @click="deleteAppletInviteLink()">
            {{ $t("deleteInviteLink") }}
          </v-btn>
        </v-col>

        <v-col
            cols="12"
            md="8"
        >
          <p class="ma-0">{{ $t("deleteInviteLinkText") }}</p>
        </v-col>
      </v-row>

      <v-row v-if="inviteLink === undefined">
        <v-col
            align-self="center"
            cols="12"
            md="4"
        >
          <v-btn color="primary" @click="postAppletInviteLink()">
            {{ $t("createInviteLink") }}
          </v-btn>
        </v-col>

        <v-col
            cols="12"
            md="8"
        >
          <p class="ma-0">{{ $t("createInviteLinkText") }}</p>
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
      inviteLink: undefined
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

    populateAppletInviteLink(invite) {
      this.inviteLink = invite && invite.data && invite.data.inviteId ? {
        ...invite.data,
        url: `${process.env.VUE_APP_WEB_URI}/#/join/${invite.data.inviteId}`
      } : undefined;
    },

    postAppletInviteLink() {
      api.appletInviteLink({
        method: "POST",
        apiHost: this.apiHost,
        token: this.token,
        appletId: this.currentAppletMeta.id
      }).then((invite) => this.populateAppletInviteLink(invite))
    },

    deleteAppletInviteLink() {
      api.appletInviteLink({
        method: "DELETE",
        apiHost: this.apiHost,
        token: this.token,
        appletId: this.currentAppletMeta.id
      }).then(() => this.inviteLink = undefined)
    },

    async getAppletInviteLink() {
      const invite = await api.appletInviteLink({
        method: "GET",
        apiHost: this.apiHost,
        token: this.token,
        appletId: this.currentAppletMeta.id
      });

      this.populateAppletInviteLink(invite);
    }
  },
  async mounted() {
    await this.getAppletInviteLink();
  }
}
</script>
