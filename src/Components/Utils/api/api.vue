<script>
/**
 * Admin-panel API routes
 */
import axios from 'axios';

const signIn = ({ apiHost, user, password }) => axios({
  method: 'get',
  url: `${apiHost}/user/authentication`,
  headers: { 'Girder-Authorization': `Basic ${btoa(`${user}:${password}`)}` },
});

const signUp = ({apiHost, body}) => axios({
  method: 'post',
  url: `${apiHost}/user`,
  params: {
    ...body,
    admin: true,
  },
});

const setSchedule = ({ apiHost, token, id, data }) => axios({
  method: 'put',
  url: `${apiHost}/applet/${id}/schedule`,
  headers: {
    'Girder-Token': token,
  },
  data,
});

const getSchedule = ({ apiHost, token, id }) => axios({
  method: 'get',
  url: `${apiHost}/applet/${id}/schedule?get_all_events=true`,
  headers: {
    'Girder-Token': token,
  },
});

const addNewApplet = ({ apiHost, token, protocolUrl }) => axios({
method: 'POST',
  url: `${apiHost}/applet/`,
  headers: {
    'Girder-Token': token,
  },
  params: {
    protocolUrl,
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

const getAppletUsers = ({ apiHost, token, appletId }) => axios({
  method: 'GET',
  url: `${apiHost}/applet/${appletId}/users`,
  headers: {
    'Girder-Token': token,
  },
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

const getAppletsForUser = ({ apiHost, token, user, role = null }) => axios({
  method: 'get',
  url: `${apiHost}/user/applets?role=${role}`,
  headers: {
    'Girder-Token': token,
  },
});

const getAppletInvitation = ({ apiHost, token, appletId, options }) => axios({
  method: 'POST',
  url: `${apiHost}/applet/${appletId}/invite`,
  headers: {
    'Girder-Token': token,
  },
  params : options,
});

export default {
  signIn,
  signUp,
  setSchedule,
  getSchedule,
  addNewApplet,
  getGroupMemberships,
  deleteUserFromRole,
  getAppletUsers,
  deleteApplet,
  refreshApplet,
  updateRegistration,
  getAppletsForUser,
  getAppletInvitation
}
</script>
