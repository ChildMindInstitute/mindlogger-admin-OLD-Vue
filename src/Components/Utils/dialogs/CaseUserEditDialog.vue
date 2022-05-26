<template>
  <v-dialog
    max-width="600"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>
        {{ $t('selectAppletsForUser') }}
      </v-card-title>

      <v-card-text>
        <v-list
          subheader
          two-line
          flat
          class="mb-4"
        >
          <v-list-item-group
            v-model="selectedApplets"
            multiple
          >
            <v-list-item
              v-for="applet in formattedApplets"
              :key="applet.id"
            >
              <template v-slot:default="{ active, }">
                <v-list-item-action>
                  <v-checkbox
                    :input-value="active"
                    readonly
                  />
                </v-list-item-action>

                <v-list-item-content>
                  <v-list-item-title>
                    {{ applet.displayName }}
                    (
                      {{
                        applet.entryCount == 0 && 'no entries' ||
                        applet.entryCount == 1 && '1 entry' ||
                        `${applet.entryCount} entries`
                      }}
                    )
                  </v-list-item-title>
                  <v-list-item-subtitle>{{ applet.description }}</v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          :disabled="!selectedApplets.length"
          @click="onSubmit"
        >
          {{ $t('submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },
    caseApplets: {
      type: Array,
      required: true
    },
    userApplets: {
      type: Array,
      required: true
    },
    entries: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedApplets: []
    }
  },
  computed: {
    formattedApplets() {
      return this.caseApplets.map(applet => {
        const userApplet = this.userApplets.find(userApplet => userApplet.appletId == applet.id)

        let entryCount = 0;

        if (userApplet)
        {
          for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].profileId == userApplet.profileId) {
              entryCount++;
            }
          }
        }

        return {
          ...applet,
          entryCount
        }
      })
    }
  },
  watch: {
    userApplets() {
      this.selectedApplets = this.userApplets.map(applet =>
        this.caseApplets.findIndex(caseApplet => caseApplet.id == applet.appletId)
      );
    }
  },
  methods: {
    onSubmit() {
      this.$emit('change', this.selectedApplets.map(index => this.caseApplets[index].id));
    }
  }
}
</script>
