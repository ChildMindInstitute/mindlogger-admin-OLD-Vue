<template>
  <div>
  </div>
</template>

<script>
import api from '../Utils/api/api';
import { AppletMixin } from '../Utils/mixins/AppletMixin';

export default {
  mixins: [AppletMixin],
  props: {
    responseId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      notes: []
    }
  },
  mounted() {
    api.getNotes(this.apiHost, this.token, this.currentAppletMeta.id, this.responseId).then(resp => {
      this.notes = resp.data;
    });
  }
}
</script>
