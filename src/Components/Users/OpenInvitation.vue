<template>
  <div>
    <h1>{{ $t("openInvitation") }}</h1>

    <v-container>
      <v-row>
        <v-col
            cols="12"
        >
          <p class="ma-0">{{ $t("shareLinkText") }}</p>
        </v-col>

        <v-col
            cols="11"
        >
          <v-text-field class="pa-0 ma-0"
              value="https://web.mindlogger.com/....."
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

        <v-col
            align-self="center"
            cols="12"
            md="4"
        >
          <v-btn color="error" @click="copyText">
            {{ $t("deleteOpenInvitation") }}
          </v-btn>
        </v-col>

        <v-col
            cols="12"
            md="8"
        >
          <p class="ma-0">{{ $t("deleteOpenInvitationText") }}</p>
        </v-col>


        <v-col
            align-self="center"
            cols="12"
            md="4"
        >
          <v-btn color="primary" @click="copyText">
            {{ $t("createOpenLink") }}
          </v-btn>
        </v-col>

        <v-col
            cols="12"
            md="8"
        >
          <p class="ma-0">{{ $t("createOpenLinkText") }}</p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { RolesMixin } from '../Utils/mixins/RolesMixin';

export default {
  name: "OpenInvitation",
  mixins: [RolesMixin],
  methods: {
    copyText () {
      const textToCopy = this.$refs.textToCopy.$el.querySelector('input');
      textToCopy.select();
      document.execCommand("copy");
    }
  }
}
</script>
