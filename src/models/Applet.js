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

export const RESPONSE_COLORS = [
  '#1C7AB3',
  '#FF7F1F',
  '#41A549'
];

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
    this.timezoneStr = '+00:00';
    this.activities = [];
    this.responses = {};
    this.subScales = {};
    this.tokens = {};

    this.selectedActivites = [];

    // Load items.
    this.items = Object
      .keys(data.items)
      .reduce(
        (items, itemId) => {
          let item = new Item(data.items[itemId]);
          item.schemas = [itemId];

          return {
            ...items,
            [itemId]: item,
          }
        },
        {},
      );

    this.versions = [];
  }

  /**
   * Fetches the activities for this applet from backend.
   *
   * @return {void}.
   */
  addActivites() {
    let activity = null;

    for (let activityId in this.data.activities) {
      activity = new Activity(this.data.activities[activityId]);
      activity.items = activity.order.map(itemId => this.items[itemId]);
      activity.hasTokenItem = activity.items.some(item => item.isTokenItem);
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

      data.tokens.cumulativeToken = data.tokens.cumulativeToken.reduce((total, current) => total + current, 0);
      this.tokens = data.tokens;

      for (let activityId in data.subScales) {
        for (let subScaleName in data.subScales[activityId]) {
          let subScales = data.subScales[activityId][subScaleName];

          for (let subScale of subScales) {
            if (subScale.value && subScale.value.ptr !== undefined && subScale.value.src !== undefined) {
              subScale.value = data.subScaleSources[subScale.value.src].data[subScale.value.ptr];
            }
          }
        }
      }
    }

    this.responses = data.responses;
    this.subScales = data.subScales;

    this.insertInitialVersion();

    this.initMultipleChoiceStatus();

    for (let itemId in data.items) {
      data.items[itemId] = new Item({
        ...data.items[itemId],
        _id: `screen/${data.items[itemId].original.screenId}`
      });
    }

    /** manage version controlling ( handle updated items, removed/added items and activites) */
    for (let version in data.itemReferences) {
      for (let key in data.itemReferences[version]) {
        if (!data.itemReferences[version][key]) {
          continue;
        }

        const itemId = data.itemReferences[version][key];
        const oldItem = data.items[itemId];

        const currentItem = Object.values(this.items).find(item => item.data._id.split('/').pop() === oldItem.data.original.screenId)

        if (!currentItem) {
          /** in case item was removed by editor */

          this.items[key] = oldItem;

          this.items[key].schemas = [key];

          let currentActivity = this.activities.find(activity => activity.data._id.split('/').pop() === oldItem.data.original.activityId);

          if (currentActivity) {
            /** in case activity exists but only item was removed */
            currentActivity.items.push(this.items[key]);
          } else {
            /** in case activity was removed by editor */
            let activity = data.activities[oldItem.data.activityId];

            currentActivity = new Activity({
              ...activity,
              _id: `activity/${activity.original.activityId}`
            });

            currentActivity.items.push(oldItem);

            this.activities.push(currentActivity);
          }

          oldItem.multiChoiceStatusByVersion[version] = oldItem.isMultipleChoice;
        } else {
          /** in case item was updated by editor */

          data.itemReferences[version][key] = oldItem;

          if (currentItem.schemas.indexOf(key) < 0) {
            currentItem.schemas.push(key);
            this.items[key] = currentItem;
          }

          if (oldItem.responseOptions) {
            currentItem.responseOptions = currentItem.responseOptions || [];

            oldItem.responseOptions.forEach(oldOption => {
              const existing = currentItem.responseOptions.find(currentOption => currentOption.id === oldOption.id);

              if (!existing) {
                const index = currentItem.appendResponseOption(oldOption);

                currentItem.valueMapping[version] = currentItem.valueMapping[version] || {};
                currentItem.valueMapping[version][oldOption.value] = index;
                currentItem.valueMapping[version][Object.values(oldOption.name)[0]] = index;
              }
            })

            currentItem.multiChoiceStatusByVersion[version] = oldItem.isMultipleChoice;
          }
        }
      }
    }

    /** sort data responses according to date/versions */
    let itemIDGroup = Object.keys(data.responses);
    itemIDGroup = itemIDGroup.filter(id => id.startsWith('https://')).concat(itemIDGroup.filter(id => !id.startsWith('https://')));

    for (let itemId of itemIDGroup) {
      data.responses[itemId] = data.responses[itemId].filter(resp => resp.value !== undefined && resp.value !== null);
      /** sort data responses according to date/versions */
      data.responses[itemId].forEach(resp => {
        if (resp.value.length) {
          this.timezoneStr = resp.date.substr(-6);
        }

        resp.date = resp.date.slice(0, -6);
      });

      data.responses[itemId].sort((resp1, resp2) => {
        if (resp1.date < resp2.date) return -1;
        if (resp1.date > resp2.date) return 1;

        return resp1.version && resp2.version && Applet.compareVersions(resp1.version, resp2.version);
      });
    }

    /** append responses */
    for (let itemId of itemIDGroup) {
      if (this.items[itemId].responseOptions) {
        this.items[itemId].appendResponses(data.responses[itemId]);
      }
    }

    for (let itemId of itemIDGroup) {
      let previousStatus = null;
      let status = this.items[itemId].multiChoiceStatusByVersion;

      for (let i = 0; i < this.versions.length; i++) {
        let version = this.versions[i].version;

        if (status[version] !== undefined) {
          previousStatus = status[version];
        } else if (previousStatus !== null) {
          status[version] = previousStatus;
        }
      }
    }

    for (let i = 0; i < itemIDGroup.length; i++) {
      this.items[itemIDGroup[i]].dataColor = RESPONSE_COLORS[i % RESPONSE_COLORS.length];
    }
    for (let i = 0; i < this.activities.length; i++) {
      this.activities[i].dataColor = RESPONSE_COLORS[i % RESPONSE_COLORS.length];
    }

    /** save responses in activity model */
    for (let activity of this.activities) {
      activity.responses = [];

      for (let item of activity.items) {
        activity.responses.push(...item.responses.map(response => ({
          date: response.date,
          version: response.version
        })));
      }

      activity.responses.sort((resp1, resp2) => {
        if (resp1.date < resp2.date) return -1;
        if (resp1.date > resp2.date) return 1;

        return 0;
      })

      activity.responses = activity.responses.filter((resp, index) => activity.responses.findIndex(value => value.date.toString() == resp.date.toString() && value.version == resp.version) == index);
    }

    for (let activity of this.activities) {
      activity.initSubScaleItems();

      const activityId = activity.data._id.split('/')[1];
      activity.addSubScaleValues(this.subScales[activityId] || {});
    }
  }

  async fetchVersions() {
    let appletId = this._id.split('/').pop();
    let { data } = await axios({
      method: 'get',
      url: `${store.state.backend}/applet/${appletId}/versions`,
      headers: { 'Girder-Token': store.state.auth.authToken.token },
      params: { retrieveDate: true }
    });

    this.versions = data;

    this.versions = this.versions.filter((version, index) => 
      this.versions.findIndex(d => d.version == version.version) === index
    );
  }

  insertInitialVersion() {
    for (let schema in this.responses) {
      if (!schema.startsWith('https://')) {
        continue;
      }

      for (let response of this.responses[schema]) {
        if (response.version && !this.versions.find(data => data.version == response.version)) {
          this.versions.push({
            version: response.version
          })
        }
      }
    }

    if (!this.versions.length) {
      this.versions.push({
        version: '0.0.1'
      })
    }
  }

  initMultipleChoiceStatus() {
    for (let itemId in this.items) {
      this.items[itemId].multiChoiceStatusByVersion[
        this.versions[0].version
      ] = this.items[itemId].isMultipleChoice;
    }
  }

  /**
   * Method to get version upgrade type 
   */
  getVersionChangeType(version1, version2) {
    const v1 = version1.split('.').map(val => parseInt(val));
    const v2 = version2.split('.').map(val => parseInt(val));
    const types = ['major', 'major', 'minor'];

    for (let i = 0; i < v1.length; i++) {
      if (v1[i] != v2[i]) {
        return types[i];
      }
    }

    return 'None';
  }

  static compareVersions(version1, version2) {
    const v1 = version1.split('.').map(val => parseInt(val));
    const v2 = version2.split('.').map(val => parseInt(val));

    for (let i = 0; i < v1.length; i++) {
      if (v1[i] < v2[i]) return -1;
      if (v1[i] > v2[i]) return 1;
    }
    return 0;
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

    for (let dataSourceName of ['dataSources', 'subScaleSources']) {
      if (!data[dataSourceName]) {
        continue;
      }

      for (let responseId in data[dataSourceName]) {
        const source = data[dataSourceName][responseId];
        try {
          source.data = JSON.parse(encryptionUtils.decryptData({
            text: source.data,
            key: data.AESKeys[source.key]
          }));
        } catch (e) {
          source.data = {};
        }
      }
    }

    if (data.tokens) {
      for (let i = 0; i < data.tokens.cumulativeToken.length; i++) {
        const cumulative = data.tokens.cumulativeToken[i];

        const decrypted = JSON.parse(encryptionUtils.decryptData({
          text: cumulative.data,
          key: data.AESKeys[cumulative.key]
        }));

        data.tokens.cumulativeToken[i] = decrypted.value;
      }

      for (let i = 0; i < data.tokens.tokenUpdates.length; i++) {
        const tokenUpdate = data.tokens.tokenUpdates[i];

        const decrypted = JSON.parse(encryptionUtils.decryptData({
          text: tokenUpdate.data,
          key: data.AESKeys[tokenUpdate.key]
        }));

        delete tokenUpdate['data'];

        tokenUpdate.value = decrypted.value;
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

      if (opts.withVersions) {
        await applet.fetchVersions();
      }

      if (opts.withActivities) {
        applet.addActivites();
      }

      if (opts.withResponses) {
        await applet.fetchResponses(opts.users);
      }

      if (applet.versions) {
        for (let i = 0; i < applet.versions.length - 1; i++) {
          const upgradeType = applet.getVersionChangeType(applet.versions[i].version, applet.versions[i+1].version);
          applet.versions[i].barColor = upgradeType === 'minor' ? '#808080' : '#000000';
        }
      }

      return applet;
    } catch(error) {
      console.error(error);
    }
  }
}
