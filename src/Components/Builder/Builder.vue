<template>
  <v-content>
    <About
      v-if="aboutOpen"
    />
    <ProtocolBuilder
      v-else
    />
  </v-content>
</template>

<script>
import Components from 'protocol-builder';
import About from './AboutBuilder';
import PackageJson from '../../../package.json';

export default {
  name: 'Builder',
  components: {
    ...Components,
    About
  },
  data () {
    return {
      drawer: false,
      aboutOpen: false,
      package: PackageJson,
    };
  },
}
</script>
