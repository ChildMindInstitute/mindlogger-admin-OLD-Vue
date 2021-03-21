import axios from 'axios';

import store from '../State/state';
import i18n from '../core/i18n';
import ReproLib from '../schema/ReproLib';
import SKOS from '../schema/SKOS';
import { RESPONSE_COLORS } from './Applet';
import slugify from '../core/slugify';

export default class Activity {
  /**
   * Initialize the Activity instance with the given data.
   *
   * @param {Object} data the data for this activity.
   */
  constructor(data) {
    this.data = data;
    this.id = data['@id'];
    this.slug = slugify(this.id);
    this.label = i18n.arrayToObject(data[SKOS.prefLabel]);
    this.description = i18n.arrayToObject(data['schema:description']);
    this.question = i18n.arrayToObject(data['schema:question']);
    this.version = i18n.arrayToObject(data['schema:version']);
    this.order = data[ReproLib.order][0]['@list'].map(item => item['@id']);
    this.schemaVersion = i18n.arrayToObject(data['schema:schemaVersion']);
    this.url = data['schema:url'];
    this.items = [];
    this.responses = [];

    this.subScales = this.parseSubScales(data[ReproLib.subScales]);
    this.selectedSubScales = [];

    this.dataColor = '#8076B2';
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

  parseSubScales(subScales) {
    return (subScales || []).map((subScale, index) => {
      let {
        [ReproLib.jsExpression]: jsExpression,
        [ReproLib.lookupTable]: lookupTable,
        [ReproLib.variableName]: variableName
      } = subScale;

      variableName = variableName && variableName[0] && variableName[0]['@value'] || '';
      return {
        jsExpression: jsExpression && jsExpression[0] && jsExpression[0]['@value'],
        lookupTable: lookupTable && lookupTable[0] && lookupTable[0]['@value'],
        variableName,
        dataColor: RESPONSE_COLORS[index % RESPONSE_COLORS.length],
        slug: slugify(variableName),
        latest: { tScore: 0, outputText: '' }
      }
    })
  }

  initSubScaleItems() {
    for (let subScale of this.subScales) {
      let itemNames = subScale.jsExpression.split(' + ').map(name => name.trim());

      subScale.items = [];

      for (let i = 0; i < this.items.length; i++) {
        if (itemNames.includes(this.items[i].label.en)) {
          subScale.items.push(this.items[i]);

          this.items[i].partOfSubScale = true;
        }
      }
    }
  }

  async addSubScaleValues(responses) {
    for (let subScale of this.subScales) {
      subScale.values = subScale.values || [];

      let subScaleName = subScale.variableName;
      if (Array.isArray(responses[subScaleName])) {
        subScale.values = subScale.values.concat(responses[subScaleName]);
      }

      subScale.latest = subScale.values[0].value;
      if (subScale.latest.outputText.startsWith('http://') || subScale.latest.outputText.startsWith('https://')) {
        try {
          const response = await axios({
            method: 'GET',
            url: subScale.latest.outputText,
          });
          subScale.latest.outputText = response.data;
        } catch(e) {

        }
      }
    }
  }

  getLatestActivityScore() {
    let total = 0;
    for (let subScale of this.subScales) {
      const { values } = subScale;

      if (values.length) {
        total += values[0].value.tScore;
      }
    }

    return total;
  }

  getFrequency() {
    return this.responses.length;
  }

  getValueExtent(focusExtent = null, versions = null) {
    let min = 1e5, max = -1e5;

    for (let subScale of this.subScales) {
      for (let i = 0; i < subScale.values.length; i++) {
        const date = new Date(subScale.values[i].date);
        if (
          !versions || versions.includes(subScale.values[i].version) && 
          !focusExtent || date <= focusExtent[1] && date >= focusExtent[0]
        ) {
          min = Math.min(min, subScale.values[i].value.tScore);
          max = Math.max(max, subScale.values[i].value.tScore);
        }
      }
    }

    return { min, max };
  }
}
