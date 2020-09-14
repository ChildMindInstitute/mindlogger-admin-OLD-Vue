<script>
/**
 * Admin-panel API routes
 */
import axios from "axios";

const signIn = ({ apiHost, user, password }) =>
  axios({
    method: "get",
    url: `${apiHost}/user/authentication`,
    headers: { "Girder-Authorization": `Basic ${btoa(`${user}:${password}`)}` },
  });

const signUp = ({ apiHost, body }) =>
  axios({
    method: "post",
    url: `${apiHost}/user`,
    params: {
      ...body,
      admin: true,
    },
  });

const resetPassword = ({ apiHost, body }) =>
  axios({
    method: "put",
    url: `${apiHost}/user/password/temporary`,
    params: {
      ...body,
    },
  });

const setSchedule = ({ apiHost, token, id, data }) =>
  axios({
    method: "put",
    url: `${apiHost}/applet/${id}/schedule`,
    headers: {
      "Girder-Token": token,
    },
    data,
  });

const getSchedule = ({ apiHost, token, id }) =>
  axios({
    method: "get",
    url: `${apiHost}/applet/${id}/schedule?getAllEvents=true`,
    headers: {
      "Girder-Token": token,
    },
  });

const getAccounts = ({ apiHost, token }) =>
  axios({
    method: "get",
    url: `${apiHost}/user/accounts`,
    headers: {
      "Girder-Token": token,
    },
  });

const switchAccount = ({ apiHost, token, accountId }) =>
  axios({
    method: "put",
    url: `${apiHost}/user/switchAccount`,
    headers: {
      "Girder-Token": token,
    },
    params: {
      accountId,
    },
  });

const setAccountName = ({ apiHost, token, accountName }) =>
  axios({
    method: "put",
    url: `${apiHost}/user/accountName`,
    headers: {
      "Girder-Token": token,
    },
    params: {
      accountName,
    },
  });

const getApplet = ({ apiHost, token, allEvent, id }) =>
  axios({
    method: "get",
    url: `${apiHost}/applet/${id}?retrieveSchedule=true&retrieveAllEvents=${allEvent}&retrieveItems=true`,
    headers: {
      "Girder-Token": token,
    },
  });

const getActivityByUrl = ({ apiHost, token, url }) =>
  axios({
    method: "get",
    url: `${apiHost}/activity`,
    headers: {
      "Girder-Token": token,
    },
    params: {
      url,
    },
  });

const getUserResponses = ({ apiHost, token, appletId, users, fromDate, toDate }) => axios({
  method: 'get',
  url: `${apiHost}/response/${appletId}`,
  headers: {
    'Girder-Token': token,
  },
  params: { users: JSON.stringify(users), fromDate, toDate },
});

const addNewApplet = ({ apiHost, token, protocolUrl, email, data }) =>
  axios({
    method: "POST",
    url: `${apiHost}/applet/`,
    headers: {
      "Girder-Token": token,
    },
    params: {
      protocolUrl,
      email,
    },
    data,
  });

const refreshApplet = ({ apiHost, token, appletId }) =>
  axios({
    method: "PUT",
    url: `${apiHost}/applet/${appletId}/refresh`,
    headers: {
      "Girder-Token": token,
    },
  });

const revokeAppletUser = ({
  apiHost,
  token,
  appletId,
  profileId,
  deleteResponse,
}) =>
  axios({
    method: "DELETE",
    url: `${apiHost}/applet/${appletId}/deleteUser`,
    headers: {
      "Girder-Token": token,
    },
    params: {
      profileId,
      deleteResponse,
    },
  });

const getGroupMemberships = ({ apiHost, token, appletId }) =>
  axios({
    method: "GET",
    url: `${apiHost}/applet/${appletId}/roles`,
    headers: {
      "Girder-Token": token,
    },
  });

const getAppletUsers = ({ apiHost, token, appletId }) =>
  axios({
    method: "GET",
    url: `${apiHost}/applet/${appletId}/users?retrieveRoles=true`,
    headers: {
      "Girder-Token": token,
    },
  });

const getUserList = ({ apiHost, token, appletId, reviewerId }) =>
  axios({
    method: "GET",
    url: `${apiHost}/applet/${appletId}/reviewer/userList`,
    headers: {
      "Girder-Token": token,
    },
    params: {
      reviewerId,
    },
  });

const updateUserRoles = ({ apiHost, token, appletId, userId, roleInfo }) =>
  axios({
    method: "PUT",
    url: `${apiHost}/applet/${appletId}/updateRoles`,
    headers: {
      "Girder-Token": token,
    },
    params: {
      userId,
      roleInfo,
    },
  });

const deleteUserFromRole = ({ apiHost, token, groupId, userId }) => {
  const f = new FormData();
  f.append("userId", userId);
  return axios({
    method: "DELETE",
    url: `${apiHost}/group/${groupId}/member`,
    headers: {
      "Girder-Token": token,
    },
    data: f,
  });
};

const postAppletInvitation = ({ apiHost, token, appletId, options }) =>
  axios({
    method: "POST",
    url: `${apiHost}/applet/${appletId}/invite`,
    headers: {
      "Girder-Token": token,
    },
    params: options,
  });

const deleteApplet = ({ apiHost, token, appletId }) =>
  axios({
    method: "DELETE",
    url: `${apiHost}/applet/${appletId}`,
    headers: {
      "Girder-Token": token,
    },
  });

const createApplet = ({ apiHost, token, email, data }) =>
  axios({
    method: "POST",
    url: `${apiHost}/applet/fromJSON`,
    headers: {
      "Girder-Token": token,
    },
    params: {
      email,
    },
    data,
  });

const updateRegistration = ({ apiHost, token, groupId, open }) =>
  axios({
    method: "PUT",
    url: `${apiHost}/group/${groupId}?openRegistration=${open}`,
    headers: {
      "Girder-Token": token,
    },
  });

const getAppletsForUser = ({ apiHost, token, user, role = null }) =>
  axios({
    method: "get",
    url: `${apiHost}/user/applets?role=${role}`,
    headers: {
      "Girder-Token": token,
    },
  });

const getAppletInvitation = ({ apiHost, token, appletId, options }) =>
  axios({
    method: "POST",
    url: `${apiHost}/applet/${appletId}/inviteUser`,
    headers: {
      "Girder-Token": token,
    },
    params: { ...options, users: JSON.stringify(options.users) },
  });

const getUsersData = ({ apiHost, token, appletId, options }) =>
  axios({
    method: "GET",
    url: `${apiHost}/applet/${appletId}/data`,
    headers: {
      "Girder-Token": token,
    },
    params: options,
  });

const duplicateApplet = ({ apiHost, token, appletId, options }) =>
  axios({
    method: "POST",
    url: `${apiHost}/applet/${appletId}/duplicate`,
    headers: {
      "Girder-Token": token,
    },
    params: options,
  });


const replaceResponseData = ({ apiHost, token, appletId, data }) => axios({
  method: 'put',
  url: `${apiHost}/response/${appletId}`,
  headers: {
    'Girder-Token': token,
  },
  data
});

export default {
  signIn,
  signUp,
  setSchedule,
  getSchedule,
  getAccounts,
  switchAccount,
  setAccountName,
  addNewApplet,
  resetPassword,
  getGroupMemberships,
  deleteUserFromRole,
  updateUserRoles,
  getAppletUsers,
  postAppletInvitation,
  revokeAppletUser,
  deleteApplet,
  createApplet,
  refreshApplet,
  getApplet,
  getUserList,
  updateRegistration,
  getActivityByUrl,
  getUserResponses,
  getAppletInvitation,
  getUsersData,
  getAppletsForUser,
  duplicateApplet,
  replaceResponseData,
};
</script>
