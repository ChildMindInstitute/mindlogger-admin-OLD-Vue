<template>
  <v-dialog
    max-width="800"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-text>
        <h1 class="welcome">
          {{ $t("welcomeMindLogger") }}
        </h1>

        <h3>{{ $t("uploadActivitySet") }}</h3>
        <v-text-field
          v-model="newProtocolURL"
          :label="$t('activitySetUrl')"
        />
        <v-btn
          color="primary"
          :disabled="!newProtocolURL"
          @click="onClickAdd"
        >
          {{ $t("add") }}
        </v-btn>
        <h3>{{ $t("quickAdd") }}</h3>
        <p>
          {{ $t("jsonLdFiles") }}
        </p>
        <p
          v-for="activityInfo in sampleProtocols"
          :key="activityInfo.name"
        >
          <a @click="newProtocolURL = activityInfo.url">
            {{ activityInfo.name }}
          </a>
        </p>
        <h3>{{ $t("buildNewActivity") }}</h3>
        <p>
          {{ $t("buildNewActivityScratch") }}
        </p>
        <router-link
          to="/build"
          target="_blank"
        >
          <v-btn color="primary">
            {{ $t("launchBuilder") }}
          </v-btn>
        </router-link>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
  .welcome {
    text-align: center;
    margin: 10px 0px;
    color: rgb(50, 50, 50);
  }
</style>

<script>

import config from "../../../config";

export default {
  name: 'AppletUpload',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    sampleProtocols: config.protocols,
    newProtocolURL: "",
  }),
  methods: {
    onClickAdd() {
      this.$emit('add-applet', this.newProtocolURL);
    },
  },
};
</script>
