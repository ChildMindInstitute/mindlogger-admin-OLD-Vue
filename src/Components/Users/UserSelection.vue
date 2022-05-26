<template>
  <v-combobox
    :value="value"
    :items="items"
    :hint="hint"
    :label="$t('userList')"
    :rules="rules"
    multiple
    small-chips
    required
    @input="$emit('input', $event)"
    @focus="onOpenUserList"
  >
    <template v-slot:prepend-item>
      <v-list-item
        class="list-header"
      >
        <v-list-item-action>
          <v-checkbox
            v-model="allSelected"
            :indeterminate="inDeterminate"
          />
        </v-list-item-action>

        <v-list-item-title>User code</v-list-item-title>
      </v-list-item>
    </template>
    <template v-slot:selection="{ attrs, item, parent, selected }">
      <v-chip
        v-bind="attrs"
        :color="`lighten-3`"
        :input-value="selected"
        label
        small
      >
        <span class="pr-2">
          {{ item }}
        </span>
        <v-icon
          small
          @click="parent.selectItem(item)"
        >
          close
        </v-icon>
      </v-chip>
    </template>
  </v-combobox>
</template>

<style scoped>
  .list-header {
    border-bottom: 2px solid grey;
  }
</style>

<script>
import api from "../Utils/api/api";

export default {
  props: {
    value: {
      type: Array,
      required: true,
    },
    appletId: {
      type: String,
      required: true
    },
    rules: {
      type: Array,
      required: false,
      default: () => ([])
    },
    hint: {
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      items: []
    };
  },
  computed: {
    inDeterminate() {
      if (this.value.length !== this.items.length && this.value.length) {
        return true;
      }
      return false;
    },
    allSelected: {
      get() {
        return this.value.length === this.items.length;
      },
      set(value) {
        if (value) {
          this.$emit('input', [...this.items]);
        } else {
          this.$emit('input', []);
        }
      }
    }
  },
  mounted() {
    this.onOpenUserList();
  },
  methods: {
    onOpenUserList() {
      return api.getAccountUserList({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: this.appletId,
        role: 'user'
      }).then((resp) => {
        this.items = [];
        for (let user of resp.data.items) {
          this.items.push(Object.values(user)[0].MRN);
        }
      });
    }
  }
}
</script>
