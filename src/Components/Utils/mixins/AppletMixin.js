import api from "../api/api.vue";
import Applet from "../../../models/Applet";
import Item from "../../../models/Item";
import S3 from 'aws-sdk/clients/s3';
import JSZip from 'jszip';
import ObjectToCSV from 'object-to-csv';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/fr';
import Activity from "../../../models/Activity";
TimeAgo.addLocale(en);
TimeAgo.addLocale(fr);

export const AppletMixin = {
  computed: {
    currentAppletMeta() {
      return this.$store.state.currentAppletMeta;
    },
    currentAppletData() {
      return this.$store.state.currentAppletData;
    },
    apiHost() {
      return this.$store.state.backend;
    },
    token() {
      return this.$store.state.auth.authToken.token;
    },
    mediaResponseObjects() {
      return [];
    },
    currentAppletBuilderData() {
      return this.$store.state.currentAppletBuilderData;
    }
  },
  methods: {
    loadApplet(appletId) {
      const appletMeta = this.$store.state.currentAccount.applets.find(applet => applet.id == appletId);

      return api.getApplet({
        apiHost: this.apiHost,
        token: this.token,
        allEvent: appletMeta.roles.includes('coordinator') || appletMeta.roles.includes('manager'),
        id: appletId
      }).then(resp => {
        const appletData = this.$store.state.allApplets[appletId];

        if (appletData && appletData.applet.encryption) {
          resp.data.applet.encryption = appletData.applet.encryption;
        }

        this.$store.commit("updateAppletData", resp.data);

        return resp.data;
      })
    },
    /**
     * export user data for selected users
     */
    exportUserData(appletMeta, key = null) {
      const appletId = appletMeta.id;
      const payload = {
        users: Object.keys(this.$store.state.currentUsers).join(','),
      };
      const preprocess = this.isLatestApplet(appletMeta) ? Promise.resolve() : this.loadApplet(appletMeta.id);

      return preprocess.then(() => {
        if (key) {
          this.$store.commit('setAppletPrivateKey', {
            appletId,
            key,
          });
        }

        return api
          .getUsersData({
            apiHost: this.$store.state.backend,
            token: this.$store.state.auth.authToken.token,
            appletId: appletId,
            options: payload,
          })
      })
        .then((resp) => {
          const { data } = resp;
          const appletData = this.$store.state.allApplets[appletId];

          Applet.decryptResponses(data, appletData.applet.encryption);

          const result = [];

          const currentItems = {};
          const currentActivities = [];
          for (let itemUrl in appletData.items) {
            currentItems[itemUrl] = new Item(appletData.items[itemUrl]);
          }
          for (let activityUrl in appletData.activities) {
            currentActivities.push(new Activity(appletData.activities[activityUrl]));
          }

          for (let itemId in data.items) {
            data.items[itemId] = new Item(data.items[itemId])
          }

          for (let activityId in data.activities) {
            data.activities[activityId] = new Activity(data.activities[activityId]);
          }

          for (let version in data.itemReferences) {
            for (let key in data.itemReferences[version]) {
              if (!data.itemReferences[version][key]) {
                continue;
              }

              const itemId = data.itemReferences[version][key];
              data.itemReferences[version][key] = data.items[itemId];
            }
          }

          let subScaleNames = [];
          for (let response of data.responses) {
            const _id = response.userId, MRN = response.MRN, isSubScaleExported = false;

            for (let subScaleName in response.subScales) {
              let subScale = response.subScales[subScaleName];

              if (subScale && subScale.ptr !== undefined && subScale.src !== undefined) {
                response.subScales[subScaleName] = data.subScaleSources[subScale.src].data[subScale.ptr];

                if (typeof response.subScales[subScaleName] == 'object') {
                  let value = response.subScales[subScaleName].tScore;
                  if (value == undefined) {
                    value = response.subScales[subScaleName].rawScore;
                  }

                  if (value !== undefined) {
                    value = value.toString();
                  }

                  response.subScales[subScaleName] = value || '';
                }
              }

              if (subScaleNames.indexOf(subScaleName) < 0) {
                subScaleNames.push(subScaleName);
              }
            }

            for (let itemUrl in response.data) {
              let itemData = response.data[itemUrl];

              if (itemData && itemData.ptr !== undefined && itemData.src !== undefined) {
                response.data[itemUrl] = data.dataSources[itemData.src].data[itemData.ptr];
              }

              let item = (data.itemReferences[response.version] && data.itemReferences[response.version][itemUrl]) || currentItems[itemUrl];

              if (!item) {
                continue;
              }

              let activity = currentItems[itemUrl] ?
                currentActivities.find(activity => activity.data._id.split('/')[1] == response.activity['@id']) :
                data.activities[item.data.activityId];

              let flag = 'completed';

              if (response.responseScheduled && !response.responseStarted) {
                flag = 'missed';
              } else if (response.responseStarted && response.timeout) {
                flag = 'incomplete';
              }

              const responseDataObj = response.data[itemUrl];
              let responseData = '';

              if (!responseDataObj) {
                responseData = null;
              } else {

                if (responseDataObj instanceof Array) {

                  responseDataObj.forEach((value, index) => {

                    if (value instanceof Object && !Array.isArray(value)) {
                      for (const [key2, value2] of Object.entries(value)) {
                        responseData += `${key2}: ${value2}`;
                      }
                    } else {
                      responseData += `${index}: ${value}`;
                    }

                    if (index !== responseDataObj.length - 1)
                      responseData += ' | ';
                  });

                } else if (responseDataObj instanceof Object) {

                  let index = 0;
                  for (const [key, value] of Object.entries(responseDataObj)) {

                    if (item.inputType === 'timeRange' && value.from && value.to) {
                      responseData += `time_range: from (hr ${value.from.hour}, min ${value.from.minute}) / to (hr ${value.to.hour}, min ${value.to.minute})`;
                    } else if ((item.inputType === 'photo' || item.inputType === 'video' || item.inputType === 'audioRecord') && value.filename) {
                      this.getMediaResponseObject(value.uri, response, item);
                      responseData += `filename: ${value.filename}`;
                    } else if (item.inputType === 'date' && (value.day || value.month || value.year)) {
                      responseData += `date: ${value.day}/${value.month}/${value.year}`;
                    } else if (item.inputType === 'drawing' && value.svgString) {
                      responseData += `SVG`;
                    } else if (item.inputType === 'geolocation' && typeof value === 'object') {
                      responseData += `geo: lat (${value.latitude}) / long (${value.longitude})`;
                    } else if (item.inputType === 'audioImageRecord') {
                      if (key === 'filename') {
                        responseData = `filename: ${value}`;
                        index = Object.keys(responseDataObj).length;
                      } else if (key === 'uri') {
                        this.getMediaResponseObject(value, response, item);
                      }
                    } else {
                      responseData += `${key}: ${value}`;
                    }

                    if (index < Object.keys(responseDataObj).length - 1)
                      responseData += ' | ';

                    index++;
                  }

                } else {
                  responseData = responseDataObj;
                }

              }

              const question = item.question['en']
                .replace(/\r?\n|\r/g, '')
                .split('250)');

              const options = [];
              const scores = [];

              if (item.responseOptions && (item.inputType === 'radio' || item.inputType === 'slider')) {
                item.responseOptions.forEach(resOption => {
                  let option = `${Object.values(resOption.name)[0]}: ${resOption.value}`;

                  if (item.scoring) {
                    option += ` ${'(score: ' + resOption.score + ')'}`;
                    scores.push(resOption.score);
                  }

                  options.push(option);
                });
              }

              result.push({
                id: response._id,
                activity_scheduled_time: response.responseScheduled || 'not scheduled',
                activity_start_time: response.responseStarted || null,
                activity_end_time: response.responseCompleted || null,
                flag,
                MRN: MRN || null,
                userId: _id,
                activity_id: response.activity['@id'],
                activity_name: activity.label.en,
                item: item.id,
                response: responseData,
                question: question[question.length - 1],
                options: options.join(', '),
                version: response.version,
                rawScore: scores.reduce((accumulated, current) => current + accumulated, 0),
                ... (!isSubScaleExported ? response.subScales : {})
              });

              isSubScaleExported = true;
            }
          }

          for (let row of result) {
            for (let subScaleName of subScaleNames) {
              row[subScaleName] = row[subScaleName] || '';
            }
          }

          this.generateMediaResponsesZip(this.mediaResponseObjects);

          let otc = new ObjectToCSV({
            keys: [
              'id',
              'activity_scheduled_time',
              'activity_start_time',
              'activity_end_time',
              'flag',
              'MRN',
              'userId',
              'activity_id',
              'activity_name',
              'item',
              'response',
              'question',
              'options',
              'version',
              'rawScore',
            ].concat(subScaleNames).map((value) => ({ key: value, as: value })),
            data: result,
          });

          let anchor = document.createElement('a');
          anchor.href =
            'data:text/csv;charset=utf-8,' + encodeURIComponent(otc.getCSV());
          anchor.target = '_blank';
          anchor.download = 'report.csv';
          anchor.click();
        })
    },
    isLatestApplet(appletMeta) {
      const applet = this.$store.state.allApplets[appletMeta.id];

      return applet && applet.updated === appletMeta.updated;
    },
    formatTimeAgo(item) {
      if (!item.updated) return "";
      const formatted = new TimeAgo(this.$i18n.locale.replace('_', '-')).format(new Date(item.updated), 'round');

      return formatted;
    },
    getMediaResponseObject(value, response, item) {
      const identifier = 's3://';
      if (!value.includes(identifier)) return;

      value = value.replace(identifier, '');
      const separator = value.indexOf('/');

      const bucket = value.slice(0, separator);
      const key = value.slice(separator + 1, value.length);

      const extension = value.slice(value.lastIndexOf('.'), value.length);
      const name = `${response._id}-${response.userId}-${item.id}${extension}`;

      this.mediaResponseObjects.push({ bucket, name, key });
    },
    async generateMediaResponsesZip(mediaObjects) {
      if (mediaObjects.length < 1) return;

      try {
        const S3Config = {
          accessKeyId: process.env.VUE_APP_ACCESS_KEY_ID,
          secretAccessKey: process.env.VUE_APP_SECRET_ACCES_KEY
        };

        const S3Client = new S3(S3Config);
        const zip = new JSZip();

        for (const mediaObject of mediaObjects) {
          const params = {
            Bucket: mediaObject.bucket,
            Key: mediaObject.key
          };
          const data = await S3Client.getObject(params).promise();
          zip.file(mediaObject.name, data.Body);
        }

        const generatedZip = await zip.generateAsync({ type: 'blob' });
        saveAs(generatedZip, `media-responses-${(new Date()).toDateString()}.zip`);
        this.mediaResponseObjects.length = 0;
      } catch (err) {
        console.log(err);
      }
    }

  }
}
