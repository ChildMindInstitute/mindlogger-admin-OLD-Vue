import axios from 'axios';
import moment from 'moment';
import store from '../State/state';
import i18n from '../core/i18n';
import slugify from '../core/slugify';

// Models.
import Activity from './Activity';
import Item from './Item';

// Schemas.
import ReproLib from '../schema/ReproLib';
import SKOS from '../schema/SKOS';
import encryptionUtils from '../Components/Utils/encryption/encryption.vue'
import api from '../Components/Utils/api/api';

import { warmColors, coldColors } from '../core/colors';

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
    this.id = slugify(data.applet['@id']);
    this._id = data.applet['_id'];
    this.encryption = data.applet.encryption;
    this.label = i18n.arrayToObject(data.applet[SKOS.prefLabel]);
    this.description = data.applet['schema:description'];
    this.schemaVersion = i18n.arrayToObject(data.applet['schema:schemaVersion']);
    this.version = data.applet['schema:version'];
    this.landingPage = i18n.arrayToObject(data.applet[ReproLib.landingPage]);
    //this.shuffle = data.applet[ReproLib.shuffle]['@value'];
    this.url = data.applet['url'];
    this.timezoneStr = '+00:00';
    this.activities = [];
    this.responses = {};
    this.subScales = {};
    this.token = { cumulative: 0, changes: [] };
    this.hasTokenItem = false;
    this.availableDates = {};
    this.minimumDate = new Date();

    this.reviewerActivity = null;
    this.hasCumulativeActivity = false;
    this.secretIDs = {};

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
      activity.schema = activityId;

      this.activities.push(activity);

      if (activity.isReviewerActivity) {
        this.reviewerActivity = activity;
      }

      if (activity.isCumulativeActivity) {
        this.hasCumulativeActivity = true;
      }

      if (activity.hasTokenItem) {
        this.hasTokenItem = true;
      }
    }
  }

  prepareResponseForUpload(responses, activity, timeStarted, reviewingResponseId) {
    const responseData = {
      activity: {
        id: activity._id.split('/')[1],
        schema: activity.schema,
        schemaVersion: activity.schemaVersion.en,
      },
      applet: {
        id: this._id.split('/')[1],
        schemaVersion: this.schemaVersion.en,
      },
      subject: store.state.auth.user._id,
      responseStarted: timeStarted,
      responseCompleted: Date.now(),
      client: {
        appId: "mindlogger-admin",
      },
      languageCode: '',
      reviewing: {
        responseId: reviewingResponseId
      }
    };

    const formattedResponses = activity.items.reduce(
      (accumulator, item, index) => ({ ...accumulator, [item.schemas[0]]: index }),
      {},
    );

    const accountId = store.state.currentAccount.accountId;

    const AESKey = encryptionUtils.getAESKey(
      this.encryption.appletPrivateKey,
      accountId,
      this.encryption.appletPrime,
      this.encryption.base
    )

    const dataSource = encryptionUtils.encryptData({
      text: JSON.stringify(responses),
      key: AESKey
    });

    responseData['responses'] = formattedResponses;
    responseData['dataSource'] = dataSource;
    responseData['userPublicKey'] = accountId;

    return responseData;
  }

  /**
   * Fetches the responses to this applet from backend.
   *
   * @return {void}.
   */
  async fetchResponses(users = []) {
    let appletId = this._id.split('/').pop();

    const NOW = new Date();
    const TODAY = new Date(Date.UTC(
      NOW.getFullYear(),
      NOW.getMonth(),
      NOW.getDate() + 1,
      0,
      0,
      0,
    ));

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    let { data } = await axios({
      method: 'get',
      url: `${store.state.backend}/response/${appletId}`,
      headers: { 'Girder-Token': store.state.auth.authToken.token },
      params: {
        users: JSON.stringify(users),
        toDate: `${nextDay.getFullYear()}-${nextDay.getMonth()+1}-${nextDay.getDate()}`,
        fromDate: `${TODAY.getFullYear()-1}-${TODAY.getMonth()+1}-${TODAY.getDate()}`
      },
    });

    if (this.encryption) {
      Applet.replaceItemValues(Applet.decryptResponses(data, this.encryption));

      this.token.cumulative = data.token.cumulative;

      for (const token of data.token.tokens) {
        for (const change of token.data) {
          this.token.changes.push({
            isTracker: false,
            spend: change.spend || false,
            time: change.time,
            value: change.value
          })
        }
      }

      for (const tracker of data.token.trackers) {
        this.token.changes.push({
          isTracker: true,
          spend: false,
          time: tracker.data.time,
          value: tracker.data.value
        })
      }

      this.token.changes.sort((a, b) => {
        if (a.time > b.time) return -1;
        if (a.time < b.time) return 1;
        return 0;
      })


      for (let activityId in data.subScales) {
        for (let subScaleName in data.subScales[activityId]) {
          let subScales = data.subScales[activityId][subScaleName];

          for (let subScale of subScales) {
            if (subScale.value && subScale.value.ptr !== undefined && subScale.value.src !== undefined) {
              const src = subScale.value.src;

              subScale.value = data.subScaleSources[subScale.value.src].data[subScale.value.ptr];
              subScale.value.responseId = src;

              if (subScale.value.rawScore && !subScale.value.tScore) {
                subScale.value.tScore = subScale.value.rawScore;
              }
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
    itemIDGroup = itemIDGroup.filter(id => this.items[id]);

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

    const secretIDs = {};

    for (const itemIRI of itemIDGroup) {
      const item = this.items[itemIRI];

      if (item.isResponseIdentifier) {
        for (const response of data.responses[itemIRI]) {
          if (!secretIDs[response.responseId]) {
            const d = response.value;
            secretIDs[response.responseId] = d.value ? d.value : d;
          }
        }
      }
    }

    this.secretIDs = secretIDs;

    /** append responses */
    for (let itemId of itemIDGroup) {
      this.items[itemId].appendResponses(data.responses[itemId], this.items[itemId].inputType, secretIDs);
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
          version: response.version,
          responseId: response.responseId,
          secretId: response.secretId
        })));
      }

      const existing = {};
      activity.responses = activity.responses.filter((resp, index) => {
        const id = `${resp.date.toString()}/${resp.version}`;
        if (existing[id]) {
          return false;
        }
        existing[id] = true;

        return true;
      });

      for (const response of activity.responses) {
        this.availableDates[moment(response.date).format('L')] = response.responseId;

        if (this.minimumDate.getTime() > new Date(response.date).getTime()) {
          this.minimumDate = response.date;
        }

        for (const response of activity.responses) {
          if (!activity.lastResponseDate || activity.lastResponseDate < response.date) {
              activity.lastResponseDate = response.date;
          }
        }
      }
    }

    for (let activity of this.activities) {
      activity.initSubScaleItems();

      const activityId = activity.data._id.split('/')[1];

      for (const subScaleName in this.subScales[activityId]) {
        const responses = this.subScales[activityId][subScaleName];

        for (const response of responses) {
          response.date = response.date.slice(0, -6);
          response.value.secretId = secretIDs[response.value.responseId];
        }
      }

      await activity.addSubScaleValues(this.subScales[activityId] || {});
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

  getTokenResponses() {
    const features = []
    const responses = []

    Object.keys(this.items).forEach(itemId => {
      const item = this.items[itemId];

      if ((!item.isTokenItem || item.inputType != 'radio') && item.inputType != 'futureBehaviorTracker' && item.inputType != 'pastBehaviorTracker') {
        return ;
      }

      for (const option of item.responseOptions) {
        features.push({
          ...option,
          id: `${item.id}-${option.id}`,
          slug: slugify(`${item.id}-${option.id}`)
        })
      }

      for (const response of item.responses) {
        const formatted = { ...response };

        const replaceOptions = (data, item) => {
          for (const option of item.responseOptions) {
            if (option.id in data) {
              data[`${item.id}-${option.id}`] = data[option.id]
              delete data[option.id]
            }
          }

          return data
        };

        formatted = replaceOptions(formatted, item)

        responses.push(formatted)
      }
    })

    features.sort((a, b) => {
      if (a.value > b.value) return -1;
      if (a.value < b.value) return 1;
      return 0;
    })

    let positive = 0, negative = 0;
    for (const feature of features) {
      if (feature.value < 0) {
        feature.color = coldColors[negative % coldColors.length];

        negative++;
      } else {
        feature.color = warmColors[positive % warmColors.length];

        positive++;
      }
    }

    return { features, responses }
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
      if (userPublicKey) {
        data.AESKeys.push(encryptionUtils.getAESKey(
          encryption.appletPrivateKey,
          userPublicKey,
          encryption.appletPrime,
          encryption.base
        ));
      } else {
        data.AESKeys.push(null);
      }
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

    if (data.token) {
      data.token.tokens.forEach(change => {
        try {
          const plain = typeof change.data !== 'object' ? JSON.parse(
            encryptionUtils.decryptData({
              text: change.data,
              key: data.AESKeys[change.key],
            })
          ) : change.data;

          change.data = plain;
        } catch (e) {
          change.data = []
        }
      })

      data.token.trackers.forEach(tracker => {
        try {
          const plain = typeof tracker.data !== 'object' ? JSON.parse(
            encryptionUtils.decryptData({
              text: tracker.data,
              key: data.AESKeys[tracker.key],
            })
          ) : tracker.data;

          tracker.data = plain;
        } catch (e) {
          tracker.data = null
        }
      })

      data.token.trackers = data.token.trackers.filter(tracker => tracker.data)
    }

    return data;
  }

  static replaceItemValues(data) {
    for (let itemId in data.responses) {
      const responses = data.responses[itemId];

      for (let response of responses) {
        if (response.value && response.value.ptr !== undefined && response.value.src !== undefined) {
          response.responseId = response.value.src;
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

    if (data.token) {

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
      const response = await api.getApplet({
        apiHost: store.state.backend,
        token: store.state.auth.authToken.token,
        allEvent: false,
        retrieveSchedule: false,
        id,
        nextActivity: null
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
