<script>
/**
 * Admin-panel API routes
 */
import axios from 'axios';
// import _ from 'lodash';

const setSchedule = ({ apiHost, token, id, data }) => axios({
  method: 'put',
  url: `${apiHost}/${id}/constraints`,
  headers: {
    'Girder-Token': token,
  },
  data,
});

/**
 * TODO: fill in this route to add a new Applet with an
 * activity set URL
 */
const addNewApplet = ({ apiHost, token, name, activitySetUrl }) => axios({
method: 'POST',
  url: `${apiHost}/applet/`,
  headers: {
    'Girder-Token': token,
  },
  params: {
    // user,
    // name,
    activitySetUrl,
  },
})

const getGroupMemberships = ({ apiHost, token, appletId }) => axios({
  method: 'GET',
  url: `${apiHost}/applet/${appletId}/roles`,
  headers: {
    'Girder-Token': token,
  },
});

const inviteToRoleByEmail = ({ apiHost, token, groupId, email }) => axios({
  method: 'POST',
  url: `${apiHost}/group/${groupId}/invitation`,
  headers: {
    'Girder-Token': token,
  },
  params: {
    email,
  }
});

export default {
  setSchedule,
  addNewApplet,
  getGroupMemberships,
  inviteToRoleByEmail,
}
</script>
 