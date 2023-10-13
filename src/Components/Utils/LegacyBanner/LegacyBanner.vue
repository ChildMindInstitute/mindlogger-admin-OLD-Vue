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
        <span class="bold">{{ $t('bannerTextBold') }}</span>
        <span>{{ $t('bannerText') }}</span>
        <a
          href="https://admin.mindlogger.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ $t('bannerLink') }}
        </a>
      </p>
      <v-btn
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
  data() {
    const {bar, top} = this.$vuetify.application;
    const headerHeight = top + bar;

    return {
      showBanner: true,
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
.legacy-banner {
  position: relative;
  z-index: 1;
  background-color: #fff;
}

.legacy-banner-inner {
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

.bold {
  font-weight: 700;
}

.legacy-banner-img {
  margin-right: 12px;
}

p {
  margin-bottom: 0;
}

span {
  margin-right: 6px;
}

a {
  color: #00639a;
  transition: opacity 0.3s;
}

a:hover {
  opacity: 0.8;
}

.close-icon {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
}

@media only screen and (max-width: 640px) {
  .legacy-banner {
    font-size: 14px;
  }
}
</style>
