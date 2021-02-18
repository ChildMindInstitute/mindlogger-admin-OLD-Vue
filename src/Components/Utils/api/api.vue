<script>
/**
 * Admin-panel API routes
 */
import axios from "axios";
import store from '../../../State/state';

const signIn = ({ apiHost, user, password }) =>
  axios({
    method: "get",
    url: `${apiHost}/user/authentication`,
    headers: { "Girder-Authorization": `Basic ${btoa(`${user}:${password}`)}` },
    params: {
      lang: store.state.currentLanguage.substr(0, 2),
    },
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
    url: `${apiHost}/applet/${id}/setSchedule`,
    headers: {
      "Girder-Token": token,
    },
    data,
  });
const getUserDetails = ({ apiHost, token }) =>
  axios({
    method: "get",
    url: `${apiHost}/user/me`,
    headers: {
      "Girder-Token": token,
    },
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

const transferOwnership = ({ apiHost, token, appletId, email }) =>
  axios({
    method: "put",
    url: `${apiHost}/applet/${appletId}/transferOwnerShip`,
    headers: {
      "Girder-Token": token,
    },
    params: {
      email,
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
      lang: store.state.currentLanguage,
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
    params: {
      lang: store.state.currentLanguage,
    }
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
      lang: store.state.currentLanguage,
    },
    data,
  });

const updateApplet = ({ apiHost, token, data, appletId }) =>
  axios({
    method: "PUT",
    url: `${apiHost}/applet/${appletId}/fromJSON`,
    headers: {
      "Girder-Token": token,
    },
    data,
  })

const prepareApplet = ({ apiHost, token, data, appletId }) =>
  axios({
    method: "PUT",
    url: `${apiHost}/applet/${appletId}/prepare`,
    headers: {
      "Girder-Token": token,
    },
    data,
  })

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

const updateItemTemplates = ({ apiHost, token, data }) =>
  axios({
    method: "PUT",
    url: `${apiHost}/item/templates`,
    headers: {
      "Girder-Token": token,
    },
    data
  });

const getItemTemplates = ({ apiHost, token }) =>
  axios({
    method: "GET",
    url: `${apiHost}/item/templates`,
    headers: {
      "Girder-Token": token,
    },
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
    params: {
      ...options,
      lang: store.state.currentLanguage,
    },
  });


const replaceResponseData = ({ apiHost, token, appletId, user, data }) => axios({
  method: 'put',
  url: `${apiHost}/response/${appletId}`,
  headers: {
    'Girder-Token': token,
  },
  data,
  params: {
    user
  }
});

const setAppletEncryption = ({ apiHost, token, appletId, data }) => axios({
  method: 'put',
  url: `${apiHost}/applet/${appletId}/encryption`,
  headers: {
    'Girder-Token': token,
  },
  data
});

const getAppletVersions = ({ apiHost, token, appletId }) => axios({
  method: 'get',
  url: `${apiHost}/applet/${appletId}/versions`,
  headers: {
    'Girder-Token': token
  }
});

const getProtocolData = ({ apiHost, token, appletId, versions }) => axios({
  method: 'get',
  url: `${apiHost}/applet/${appletId}/protocolData`,
  headers: {
    'Girder-Token': token
  },
  params: { versions: JSON.stringify(versions) },
})


const validateAppletName = ({ apiHost, token, name }) => axios({
  method: 'get',
  url: `${apiHost}/applet/validateName`,
  headers: {
    'Girder-Token': token
  },
  params: { name }
});

const updateRetainingSettings = ({ apiHost, token, appletId, options }) =>
  axios({
    method: "POST",
    url: `${apiHost}/applet/${appletId}/setRetention`,
    headers: {
      "Girder-Token": token,
    },
    params: options,
  });

const getAccountUserList = ({ apiHost, token, appletId, role, MRN, pagination, sort }) => axios({
  method: 'get',
  url: `${apiHost}/account/users`,
  headers: {
    'Girder-Token': token
  },
  params: {
    appletId, role, MRN, pagination, sort
  },
});

const getInvitations = ({ apiHost, token, appletId }) => axios({
  method: 'get',
  url: `${apiHost}/applet/${appletId}/invitations`,
  headers: {
    'Girder-Token': token,
  },
});


const updatePin = ({ apiHost, token, profileId, newState }) => axios({
  method: 'put',
  url: `${apiHost}/account/manage/pin`,
  headers: {
    'Girder-Token': token
  },
  params: {
    profileId, newState
  }
})

const getAppletsInFolder = (apiHost, token, folderId) => axios({
  method: 'get',
  url: `${apiHost}/folder/${folderId}/applets`,
  headers: {
    'Girder-Token': token
  }
})

const deleteFolder = (apiHost, token, folderId) => axios({
  method: 'delete',
  url: `${apiHost}/folder/${folderId}`,
  headers: {
    'Girder-Token': token
  }
})

const addAppletToFolder = (apiHost, token, folderId, appletId) => axios({
  method: 'put',
  url: `${apiHost}/folder/${folderId}/add`,
  headers: {
    'Girder-Token': token
  },
  params: {
    id: folderId, 
    appletId
  }
})

const removeApplet = (apiHost, token, folderId, appletId) => axios({
  method: 'delete',
  url: `${apiHost}/folder/${folderId}/remove`,
  headers: {
    'Girder-Token': token
  },
  params: {
    id: folderId, 
    appletId
  }
})


const saveFolder = (apiHost, token, folder) =>  {
  return axios({
    method: 'post',
    url: `${apiHost}/folder`,
    headers: {
      'Girder-Token': token
    },
    params: {
    name: folder.name,
    parentType: 'user',
    parentId: folder.parentId
    }
  })
}
const updateFolder = (apiHost, token, folder,  folderId) =>  {
  return axios({
    method: 'put',
    url: `${apiHost}/folder/${folderId}`,
    headers: {
      'Girder-Token': token
    },
    params: {
    name: folder.name,
    parentType: 'user',
    parentId: folder.parentId
    }
  })
}
const togglePin = (apiHost, token, applet, isPinned) => {
  const url = isPinned ? `${apiHost}/folder/${applet.parentId}/pin` : `${apiHost}/folder/${applet.parentId}/unpin`
  return axios({
        method: 'put',
        url,
        headers: {
          'Girder-Token': token
        },
        params: {
         id: applet.parentId,
         appletId: applet.id
        }
    })
}

const updateAlertStatus = (apiHost, token, alertId) => {
  return axios({
    method: 'put',
    url: `${apiHost}/account/updateAlertStatus/${alertId}`,
    headers: {
      'Girder-Token': token
    }
  })
}

export default {
  signIn,
  signUp,
  setSchedule,
  getSchedule,
  getAccounts,
  getUserDetails,
  switchAccount,
  setAccountName,
  addNewApplet,
  resetPassword,
  getGroupMemberships,
  deleteUserFromRole,
  updateUserRoles,
  getAppletUsers,
  transferOwnership,
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
  getItemTemplates,
  updateItemTemplates,
  getUsersData,
  getAppletsForUser,
  duplicateApplet,
  replaceResponseData,
  setAppletEncryption,
  updateApplet,
  getAppletVersions,
  getProtocolData,
  prepareApplet,
  validateAppletName,
  updateRetainingSettings,
  getAccountUserList,
  updatePin,
  getInvitations,
  getAppletsInFolder,
  addAppletToFolder,
  removeApplet,
  saveFolder,
  updateFolder,
  deleteFolder,
  togglePin,
  updateAlertStatus,
}
</script>
