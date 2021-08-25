import axios from 'axios';

import store from '../State/state';
import i18n from '../core/i18n';
import ReproLib from '../schema/ReproLib';
import SKOS from '../schema/SKOS';
import { RESPONSE_COLORS } from './Applet';
import slugify from '../core/slugify';
import _ from 'lodash';

export default class Activity {
  /**
   * Initialize the Activity instance with the given data.
   *
   * @param {Object} data the data for this activity.
   */
  constructor(data) {
    this.data = data;
    this.id = data['@id'];
    this._id = data['_id'];
    this.slug = slugify(this.id);
    this.label = i18n.arrayToObject(data[SKOS.prefLabel]);
    this.description = i18n.arrayToObject(data['schema:description']);
    this.splash = i18n.arrayToObject(data['schema:splash']);
    this.question = i18n.arrayToObject(data['schema:question']);
    this.version = i18n.arrayToObject(data['schema:version']);
    this.order = data[ReproLib.order][0]['@list'].map(item => item['@id']);
    this.schemaVersion = i18n.arrayToObject(data['schema:schemaVersion']);
    this.isReviewerActivity = _.get(data, [
      'reprolib:terms/isReviewerActivity', 0, '@value'
    ], false);
    this.addProperties = this.parseAddProperties(data[ReproLib.addProperties]);

    this.url = data['schema:url'];
    this.items = [];
    this.responses = [];

    this.lastResponseDate = null;

    this.subScales = this.parseSubScales(data[ReproLib.subScales]);
    this.finalSubScale = this.parseFinalSubScale(data[ReproLib.finalSubScale] && data[ReproLib.finalSubScale][0]);
    this.hasResponseIdentifier = _.get(data, ["reprolib:terms/hasResponseIdentifier", 0, "@value"], false);
    if (this.finalSubScale) {
      this.subScales.push(this.finalSubScale);
    }

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

  getItemIndexFromIRI(IRI) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].schemas.includes(IRI)) {
        return i;
      }
    }

    return -1;
  }

  parseAddProperties(addProperties) {
    return addProperties.map(property => ({
      isAbout: _.get(property, [ReproLib.isAbout, 0, '@id']),
      isVis: _.get(property, [ReproLib.isVis, 0, '@value']),
      variableName: _.get(property, [ReproLib.variableName, 0, '@value'])
    }))
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
        current: { tScore: 0, outputText: '' },
        partOfSubScale: false,
        subScales: []
      }
    })
  }

  parseFinalSubScale(finalSubScale) {
    if (!finalSubScale) {
      return null;
    }

    let {
      [ReproLib.lookupTable]: lookupTable,
      [ReproLib.variableName]: variableName
    } = finalSubScale;

    variableName = variableName && variableName[0] && variableName[0]['@value'] || '';
    return {
      variableName,
      lookupTable,
      dataColor: RESPONSE_COLORS[this.subScales.length % RESPONSE_COLORS.length],
      slug: slugify(variableName),
      current: { tScore: 0, outputText: '' },
      isFinalSubScale: true,
      partOfSubScale: false
    }
  }

  initSubScaleItems() {
    for (let subScale of this.subScales) {
      let itemNames = (subScale.jsExpression || '').split(' + ').map(name => name.trim());
      let subScaleNames = itemNames.filter(name => name.match(/^\(.*\)$/i)).map(name => name.substr(1, name.length-2));

      subScale.items = [];
      subScale.subScales = [];
      subScaleNames.forEach(name => {
        const innerSubScale = this.subScales.find(d => d.variableName == name);
        if (innerSubScale) {
          innerSubScale.partOfSubScale = true;
          subScale.subScales.push(innerSubScale);
        }
      });

      for (let i = 0; i < this.items.length; i++) {
        if (itemNames.includes(this.items[i].label.en)) {
          subScale.items.push(this.items[i]);

          this.items[i].partOfSubScale = true;
        }
      }
    }
  }

  async getOutputText(outputText) {
    if (outputText && (outputText.startsWith('http://') || outputText.startsWith('https://'))) {
      try {
        const response = await axios({
          method: 'GET',
          url: outputText,
        });
        return response.data
      } catch(e) {

      }
    }
    return outputText;
  }

  async addSubScaleValues(responses) {
    for (let subScale of this.subScales) {
      subScale.values = subScale.values || [];

      let subScaleName = subScale.variableName;
      if (Array.isArray(responses[subScaleName])) {
        subScale.values = subScale.values.concat(responses[subScaleName]);
      }

      if (subScale.values.length) {
        subScale.current = {
          ...subScale.values[0].value,
          outputText: await this.getOutputText(subScale.values[0].value.outputText)
        };
      }
    }
  }

  getLatestActivityScore(selectedSecretIds) {
    if (this.finalSubScale && this.finalSubScale.current) {
      return Number(this.finalSubScale.current.tScore.toFixed(3));
    }

    let total = 0;
    for (let subScale of this.subScales) {
      const { values } = subScale;

      if (subScale.isFinalSubScale) {
        continue;
      }

      const index = values.findIndex(d => selectedSecretIds.includes(d.value.secretId));
      if (index >= 0) {
        total += values[index].value.tScore;
      }
    }

    return Number(total.toFixed(3));
  }

  getFrequency(secretIds) {
    if (this.hasResponseIdentifier) {
      return this.responses.filter(response => secretIds.includes(response.secretId)).length;
    }

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
