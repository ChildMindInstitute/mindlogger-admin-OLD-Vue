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
  url: `${apiHost}/${appletId}/roles`,
  headers: {
    'Girder-Token': token,
  },
})

export default {
  setSchedule,
  addNewApplet,
  getGroupMemberships,
}
</script>
 