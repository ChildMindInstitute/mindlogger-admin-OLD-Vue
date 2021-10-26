<template>
  <v-dialog
      max-width="600px"
      :value="value"
      persistent
  >
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('transferAppletOwnership') }}</span>
      </v-card-title>
      <v-card-text>
        {{ $t('transferOwnershipConfirmation') }}
        <v-row>
          <v-col cols="12">
            <v-text-field
                v-model="ownershipEmail"
                class="ownershipField"
                :label="$t('ownerEmail')"
                required
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn
            color="blue darken-1"
            text
            @click="$emit('close', ownershipEmail)"
        >
          {{ $t('close') }}
        </v-btn>
        <v-btn
            color="blue darken-1"
            text
            :disabled="!emailRules.test(ownershipEmail)"
            @click="$emit('submit', ownershipEmail)"
        >
          {{ $t('submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
export default {
  name: 'AppletName',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    ownershipEmail: '',
    emailRules: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
  }),
};
</script>
