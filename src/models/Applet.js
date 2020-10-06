import axios from 'axios';

import store from '../State/state';
import i18n from '../core/i18n';

// Models.
import Activity from './Activity';
import Item from './Item';

// Schemas.
import ReproLib from '../schema/ReproLib';
import SKOS from '../schema/SKOS';
import encryptionUtils from '../Components/Utils/encryption/encryption.vue'


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
    this.encryption = data.applet.encryption;
    this.label = i18n.arrayToObject(data.applet[SKOS.prefLabel]);
    this.description = data.applet['schema:description'];
    this.schemaVersion = data.applet['schema:schemaVersion'];
    this.version = data.applet['schema:version'];
    this.landingPage = i18n.arrayToObject(data.applet[ReproLib.landingPage]);
    //this.shuffle = data.applet[ReproLib.shuffle]['@value'];
    this.url = data.applet['url'];
    this.activities = [];

    // Load items.
    this.items = Object
      .keys(data.items)
      .reduce(
        (items, itemId) => ({
          [itemId]: new Item(data.items[itemId])
        }),
        {},
      );
  }

  /**
   * Fetches the activities for this applet from backend.
   *
   * @return {void}.
   */
  async fetchActivities() {
    let activity = null;

    for (let activityId in this.data.activities) {
      activity = await Activity.fetchById(this.data.activities[activityId]._id);
      activity.items = activity.order.map(itemId => this.items[itemId]);

      this.activities.push(activity);
    }
  }

  /**
   * Fetches the responses to this applet from backend.
   *
   * @return {void}.
   */
  async fetchResponses(users = []) {
    let appletId = this._id.split('/').pop();
    let { data } = await axios({
      method: 'get',
      url: `${store.state.backend}/response/${appletId}`,
      headers: { 'Girder-Token': store.state.auth.authToken.token },
      params: { users: JSON.stringify(users) },
    });

    if (this.encryption) {
      Applet.replaceItemValues(Applet.decryptResponses(data, this.encryption));
    }

    for (let itemId in data.responses) {
      this.items[itemId].setResponses(data.responses[itemId]);
    }
  }


  static decryptResponses(data, encryption) {
    /** decrypt data */
    data.AESKeys = [];
    for (let userPublicKey of data.keys) {
      data.AESKeys.push(encryptionUtils.getAESKey(
        encryption.appletPrivateKey,
        userPublicKey,
        encryption.appletPrime,
        encryption.base
      ));
    }

    for (let responseId in data.dataSources) {
      const source = data.dataSources[responseId];
      try {
        source.data = JSON.parse(encryptionUtils.decryptData({
          text: source.data,
          key: data.AESKeys[source.key]
        }));
      } catch (e) {
        source.data = {};
      }
    }

    return data;
  }

  static replaceItemValues(data) {
    for (let itemId in data.responses) {
      const responses = data.responses[itemId];

      for (let response of responses) {
        if (response.value && response.value.ptr !== undefined && response.value.src !== undefined) {
          response.value = data.dataSources[response.value.src].data[response.value.ptr];
        }
      }
    }

    return data;
  }

  static encryptResponses(data, encryption, userPublicKey) {
    data.AESKeys = [
      encryptionUtils.getAESKey(
        encryption.appletPrivateKey,
        userPublicKey,
        encryption.appletPrime,
        encryption.base
      )
    ];

    for (let responseId in data.dataSources) {
      const source = data.dataSources[responseId];
      source.key = 0;
      source.data = encryptionUtils.encryptData({
        text: JSON.stringify(source.data),
        key: data.AESKeys[source.key]
      });
    }

    return data;
  }

  /**
   * Fetches an applet from the backend by its ID.
   *
   * @param {string} appletId the ID of the applet to be fetched.
   * @param {object} opts options object.
   * @param {boolean} opts.withActivities if true, it will load the activities.
   * @param {boolean} opts.withResponses if true, it will load the responses.
   * @param {boolean} opts.users users whose responses will be fetched.
   * @returns {Applet} the requested applet.
   */
  static async fetchById(appletId, opts, encryptionInfo) {
    const id = appletId.split('/').pop();

    try {
      const response = await axios({
        method: 'GET',
        url: `${store.state.backend}/applet/${id}`,
        headers: { 'Girder-Token': store.state.auth.authToken.token },
      });

      response.data.applet.encryption = encryptionInfo;
      const applet = new Applet(response.data);

      if (opts.withActivities) {
        await applet.fetchActivities();
      }

      if (opts.withResponses) {
        await applet.fetchResponses(opts.users);
      }

      return applet;
    } catch(error) {
      console.error(error);
    }
  }
}
