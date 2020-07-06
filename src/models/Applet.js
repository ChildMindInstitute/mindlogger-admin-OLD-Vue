import axios from 'axios';

import store from '../State/state';
import Activity from './Activity';
import i18n from '../core/i18n';
import ReproLib from '../schema/ReproLib';
import SKOS from '../schema/SKOS';


export default class Applet {
  /**
   * Initialize the Applet instance with the given data.
   *
   * @param {Object} data the data for this applet.
   */
  constructor(data) {
    this.data = data;
    this.id = data.applet['@id'];
    this._id = data.applet['_id'];
    this.label = i18n.arrayToObject(data.applet[SKOS.prefLabel]);
    this.description = data.applet['schema:description'];
    this.schemaVersion = data.applet['schema:schemaVersion'];
    this.version = data.applet['schema:version'];
    this.landingPage = i18n.arrayToObject(data.applet[ReproLib.landingPage]);
    //this.shuffle = data.applet[ReproLib.shuffle]['@value'];
    this.url = data.applet['url'];
    this.activities = [];
    this.items = [];
  }

  /**
   * Fetches the applet activities data from backend.
   *
   * @return {void}.
   */
  async fetchActivitiesData() {
    let activityData;

    for (let activity in this.data.activities) {
      this.activities.push(
        await Activity.fetchById(this.data.activities[activity]._id)
      );
    }
  }


  /**
   * Fetches an applet from the backend by its ID.
   *
   * @param {string} appletId the ID of the applet to be fetched.
   * @return {Applet} the requested applet.
   */
  static async fetchById(appletId) {
    const id = appletId.split('/').pop();

    try {
      const response = await axios({
        method: 'GET',
        url: `${store.state.backend}/applet/${id}`,
        headers: { 'Girder-Token': store.state.auth.authToken.token },
      });

      return new Applet(response.data);
    } catch(error) {
      console.error(error);
    }
  }
}
