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
})

export default {
  setSchedule,
}
</script>
 