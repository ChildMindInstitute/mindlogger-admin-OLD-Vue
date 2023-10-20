<template>
  <div
    v-if="showBanner"
    id="legacy-banner"
    :style="styles"
    class="legacy-banner"
  >
    <div class="legacy-banner-inner">
      <img
        :src="require('@/assets/exclamation-circle.svg')"
        alt="alert"
        class="legacy-banner-img"
      >
      <p>
        <span
          v-if="!isPreLaunch"
          class="bold"
        >
          {{ $t('bannerTextBold') }}
        </span>
        <span>{{ $t(`bannerText.${isPreLaunch ? 'preLaunch' : 'postLaunch'}`) }}</span>
        <a
          :href="isPreLaunch ? preLaunchLink : postLaunchLink"
          target="_blank"
          rel="noopener noreferrer"
        >{{ $t(`bannerLink.${isPreLaunch ? 'preLaunch' : 'postLaunch'}`) }}</a>
      </p>
      <v-btn
        v-if="showCloseIcon"
        class="close-icon"
        icon
        @click="closeBanner"
      >
        <img
          :src="require('@/assets/close-icon.svg')"
          alt="close-icon"
        >
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "LegacyBanner",
  props: {
    showCloseIcon: {
      type: Boolean,
      default: false
    },
    isPreLaunch: {
      type: Boolean,
      default: true
    },
  },
  data() {
    const {bar, top} = this.$vuetify.application;
    const headerHeight = top + bar;

    return {
      showBanner: true,
      preLaunchLink: "https://mindlogger.atlassian.net/servicedesk/customer/kb/view/338264121",
      postLaunchLink: "https://admin.mindlogger.org/",
      styles: {
        margin: `${headerHeight}px 0 -${headerHeight}px`,
      }
    }
  },
  methods: {
    closeBanner() {
      this.showBanner = false;
    }
  }
};
</script>

<style scoped>
.v-application .legacy-banner {
  position: relative;
  z-index: 1;
  background-color: #fff;
}

.v-application .legacy-banner .legacy-banner-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 72px;
  padding: 12px 72px;
  color: #1a1c1e;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.15px;
  background-color: rgba(223, 172, 3, 0.30);
}

.v-application .legacy-banner .bold {
  font-weight: 700;
}

.v-application .legacy-banner .legacy-banner-img {
  margin-right: 12px;
}

.v-application .legacy-banner p {
  margin-bottom: 0;
}

.v-application .legacy-banner span {
  margin-right: 6px;
}

.v-application .legacy-banner a {
  color: #00639a;
  transition: opacity 0.3s;
}

.v-application .legacy-banner a:hover {
  opacity: 0.8;
}

.v-application .legacy-banner .close-icon {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
}

@media only screen and (max-width: 640px) {
  .v-application .legacy-banner-inner {
    font-size: 14px;
  }
}
</style>
