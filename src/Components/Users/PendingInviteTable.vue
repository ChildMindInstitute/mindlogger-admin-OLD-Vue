<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="rowData"
      :loading="loading"
      :footer-props="{
        itemsPerPageText: $t('rowsPerPage'),
        itemsPerPageAllText: $t('all'),
      }"
      :no-data-text="$t('noData')"
    />
  </v-container>
</template>

<style scoped>
.container {
  padding: 0px;
}
</style>

<script>
import moment from "moment";
import { RolesMixin } from '../Utils/mixins/RolesMixin';

export default {
  name: "PendingInviteTable",
  mixins: [RolesMixin],
  props: {
    users: {
      type: Array,
      default: function() {
        return [];
      },
    },
    loading: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      headers: [
        {
          text: this.$i18n.t("secretUserId"),
          value: "mrn",
          sortable: true,
        },
        {
          text: this.$i18n.t("firstName"),
          value: "firstName",
          sortable: true,
        },
        {
          text: this.$i18n.t("lastName"),
          value: "lastName",
          sortable: true,
        },
        {
          text: this.$i18n.t("userType"),
          value: "userType",
          sortable: true,
        },
        {
          text: this.$i18n.t("invitationLink"),
          value: "invitationLink",
          sortable: true,
        },
        {
          text: this.$i18n.t("dateTimeInvited"),
          value: "dateTime",
          sortable: true,
        }
      ]
    };
  },
  computed: {
    rowData: function() {
      const dat = [];
      this.users.forEach((invitation) => {
        dat.push({
          mrn: invitation.MRN,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          userType: this.localizedRoles.find(role => role.name == invitation.role).title,
          invitationLink: `${process.env.VUE_APP_WEB_URI}/#/invitation/${
            invitation._id
          }`,
          dateTime: moment(invitation.created).format("YYYY-MM-DD hh:mm:ss"),
        });
      });
      return dat;
    },
  },
};
</script>
