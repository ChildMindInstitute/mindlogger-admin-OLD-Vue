<template>
  <v-footer
    color="primary"
    padless
    dark
  >
    <div class="my-1 footer">
      <img
        class="logo mr-1"
        src="https://cmi-logos.s3.amazonaws.com/ChildMindInstitute_Logo_Horizontal_KO.png"
      />
      {{'© '}}
      <a
        href="https://childmind.org"
        class="mx-1"
        target='_blank'
      >
        {{' '}}
        Child Mind Institute{{' '}}
      </a>{{' '}}
      MATTER Lab 2022

      <div class="ml-8"><a href="https://mindlogger.org/terms" target="_blank">Terms of Service</a></div>
    </div>
  </v-footer>
</template>

<style scoped>
.logo {
  padding: 5px;
  height: 50px;
  width: 120px;
}

.footer {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  color: white;
  font-weight: 500;
}

.footer a {
  color: white;
}
</style>

<script>

export default {
  name: "Footer",
  data() {
    return {
    }
  },
};
</script>
