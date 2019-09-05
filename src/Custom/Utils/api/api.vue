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

const refreshApplet = ({ apiHost, token, appletId }) => axios({
  method: 'GET',
  url: `${apiHost}/applet/${appletId}?refreshCache=true`,
  headers: {
    'Girder-Token': token,
  },
})

const getGroupMemberships = ({ apiHost, token, appletId }) => axios({
  method: 'GET',
  url: `${apiHost}/applet/${appletId}/roles`,
  headers: {
    'Girder-Token': token,
  },
});

const getGroupTable = ({ apiHost, token, appletId }) => axios({
  method: 'GET',
  url: `${apiHost}/applet/${appletId}/users`,
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

const deleteUserFromRole = ({ apiHost, token, groupId, userId }) => {
  const f = new FormData()
  f.append('userId', userId);
  return axios({
    method: 'DELETE',
    url: `${apiHost}/group/${groupId}/member`,
    headers: {
      'Girder-Token': token,
    },
    data: f,
  })
};

const deleteApplet = ({ apiHost, token, appletId }) => axios({
  method: 'DELETE',
  url: `${apiHost}/applet/${appletId}`,
  headers: {
    'Girder-Token': token,
  },
})

const updateRegistration = ({ apiHost, token, groupId, open }) => axios({
  method: 'PUT',
  url: `${apiHost}/group/${groupId}?openRegistration=${open}`,
  headers: {
    'Girder-Token': token,
  },
})

export default {
  setSchedule,
  addNewApplet,
  getGroupMemberships,
  inviteToRoleByEmail,
  deleteUserFromRole,
  getGroupTable,
  deleteApplet,
  refreshApplet,
  updateRegistration,
}
</script>
