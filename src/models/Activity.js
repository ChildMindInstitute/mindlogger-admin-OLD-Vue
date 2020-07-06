import axios from 'axios';

import store from '../State/state';
import i18n from '../core/i18n';
import ReproLib from '../schema/ReproLib';
import SKOS from '../schema/SKOS';


export default class Activity {
  /**
   * Initialize the Activity instance with the given data.
   *
   * @param {Object} data the data for this activity.
   */
  constructor(data) {
    this.data = data;
    this.id = data['@id'];
    this.label = i18n.arrayToObject(data[SKOS.prefLabel]);
    this.description = i18n.arrayToObject(data['schema:description']);
    this.question = i18n.arrayToObject(data['schema:question']);
    this.version = i18n.arrayToObject(data['schema:version']);
    this.order = data[ReproLib.order][0]['@list'].map(item => item['@id']);
    this.schemaVersion = i18n.arrayToObject(data['schema:schemaVersion']);
    this.url = data['schema:url'];
    this.items = [];
  }

  /**
   * Given the JSON-LD object generates the list of available choices for this
   * activity.
   *
   * @param {Object} responseOptions the json-ld object with the choice data.
   * @return {Array} available response choices.
   */
  static parseResponseOptions(responseOptions) {
    const itemListElement = responseOptions[0]['schema:itemListElement'];
    const warmColors = [
      '#E91E63',
      '#F44336',
      '#F46E48',
      '#FDAF5C',
      '#FDDF87',
      '#9C27B0',
      '#673AB7',
    ];
    const coldColors = [
      '#778ca3',
      '#2B87C6',
      '#45aaf2',
      '#4b7bec',
      '#5FC3A9',
      '#ABDEA3',
      '#E6F59A',
    ];

    return itemListElement.map((choice, index) => ({
      name: i18n.arrayToObject(choice['schema:name']),
      value: choice['schema:value'][0]['@value'],
      color: choice['schema:value'][0]['@value'] > 0
        ? coldColors.shift()
        : warmColors.shift(),
    }));
  }

  /**
   * Fetches an activity from the backend by its URL.
   *
   * @param {string} url the url of the activity to be fetched.
   * @return {Activity} the requested activity.
   */
  static async fetchByUrl(url) {
    try {
      const response = await axios({
        method: 'GET',
        url: `${store.state.backend}/activity`,
        headers: { 'Girder-Token': store.state.auth.authToken.token },
        params: { url },
      });

      return new Activity(response.data);
    } catch(error) {
      console.error(error);
    }
  }

  /**
   * Fetches an activity from the backend by its ID.
   *
   * @param {string} id the id of the activity to be fetched.
   * @return {Activity} the requested activity.
   */
  static async fetchById(activityId) {
    const id = activityId.split('/').pop();

    try {
      const response = await axios({
        method: 'GET',
        url: `${store.state.backend}/activity/${id}`,
        headers: { 'Girder-Token': store.state.auth.authToken.token },
      });

      return new Activity(response.data);
    } catch(error) {
      console.error(error);
    }
  }
}
