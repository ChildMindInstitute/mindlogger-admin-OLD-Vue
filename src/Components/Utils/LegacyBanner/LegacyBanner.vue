<template>
  <div
    :style="styles"
    class="legacy-banner"
  >
    <img
      :src="require('@/assets/exclamation-circle.svg')"
      alt="alert"
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
  </div>
</template>

<script>
export default {
  name: "LegacyBanner",
  data() {
    return {};
  },
  computed: {
    styles() {
      const { bar, top } = this.$vuetify.application

      return {
        marginTop: `${top + bar}px`,
      }
    },
  },
};
</script>

<style scoped>
.legacy-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 72px;
  padding: 12px 16px;
  background-color: rgba(223, 172, 3, 0.30);
  color: #1a1c1e;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.15px;
}

.bold {
  font-weight: 700;
}

img {
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

@media only screen and (max-width:640px) {
  .legacy-banner {
    font-size: 14px;
  }
}
</style>
