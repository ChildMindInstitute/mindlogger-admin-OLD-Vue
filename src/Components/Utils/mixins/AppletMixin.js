import _ from "lodash";
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
import moment from "moment";
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
        retrieveSchedule: true,
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

        return api.getUsersData({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: appletId,
          options: payload,
        })
      })
        .then(async (resp) => {
          const { data } = resp;
          const appletData = this.$store.state.allApplets[appletId];

          Applet.decryptResponses(data, appletData.applet.encryption);

          const result = [];

          const currentItems = {};
          const currentActivities = {};
          for (let itemUrl in appletData.items) {
            currentItems[itemUrl] = new Item(appletData.items[itemUrl]);
          }
          for (let activityUrl in appletData.activities) {
            const activity = new Activity(appletData.activities[activityUrl]);
            currentActivities[activity.data._id.split('/')[1]] = activity;
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

          let subScaleNames = [], previousResponse = [];

          const drawingCSVs = [];
          const keys = [
            'id',
            'activity_scheduled_time',
            'activity_start_time',
            'activity_end_time',
            'flag',
            'secret_user_id',
            'userId',
            'activity_id',
            'activity_name',
            'item',
            'response',
            'prompt',
            'options',
            'version',
            'rawScore',
            'reviewing_id',
          ];

          for (let response of data.responses) {
            const _id = response.userId, MRN = response.MRN, isSubScaleExported = false;
            const outputTexts = {};
            for (let subScaleName in response.subScales) {
              let subScale = response.subScales[subScaleName];
              let textColumn = `Optional text for ${subScaleName}`;

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

                  if (response.subScales[subScaleName].outputText) {
                    outputTexts[textColumn] = response.subScales[subScaleName].outputText;
                  }

                  response.subScales[subScaleName] = value || '';
                }
              }

              if (subScaleNames.indexOf(subScaleName) < 0) {
                subScaleNames.push(subScaleName);
              }

              if (subScaleNames.indexOf(textColumn) < 0) {
                subScaleNames.push(textColumn);
              }
            }

            for (let itemUrl in response.data) {
              let itemData = response.data[itemUrl];
              let item = (data.itemReferences[response.version] && data.itemReferences[response.version][itemUrl]) || currentItems[itemUrl];

              if (!item) {
                continue;
              }

              const src = itemData.src;
              if (itemData && itemData.ptr !== undefined && itemData.src !== undefined) {
                if (_.isArray(data.dataSources[itemData.src].data) && itemData.ptr && typeof itemData.ptr === "object")
                  response.data[itemUrl] = itemData.ptr;
                else
                  response.data[itemUrl] = data.dataSources[itemData.src].data[itemData.ptr];
              }

              let activity = currentItems[itemUrl] ?
                currentActivities[response.activity['@id']] :
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
                      responseData += Object.entries(value).map(entry => `${entry[0]}: ${entry[1]}`).join(', ');
                    } else {
                      responseData += `${index}: ${value}`;
                    }

                    if (index !== responseDataObj.length - 1)
                      responseData += '\r\n\r\n';
                  });

                } else if (responseDataObj instanceof Object) {

                  let index = 0;
                  for (const [key, value] of Object.entries(responseDataObj)) {
                    if (item.inputType === 'timeRange' && value.from && value.to) {
                      responseData += `time_range: from (hr ${value.from.hour}, min ${value.from.minute}) / to (hr ${value.to.hour}, min ${value.to.minute})`;

                    } else if ((item.inputType === 'photo' || item.inputType === 'video' || item.inputType === 'audioRecord' || item.inputType === 'drawing' || item.inputType === 'audioImageRecord')) {
                      if (value.filename) {
                        this.getMediaResponseObject(value.uri, response, item);
                        responseData += `filename: ${value.filename}`;
                      } else if (Array.isArray(value)) {
                        drawingCSVs.push({
                          name: `${src}.csv`,
                          data: this.getLinesAsCSV(value)
                        });

                        responseData += `filename: ${src}.csv`;

                        index = Object.keys(responseDataObj).length;
                      }
                    } else if (item.inputType === 'date' && (value.day || value.month || value.year)) {
                      responseData += `date: ${value.day}/${value.month}/${value.year}`;
                    } else if (item.inputType === 'drawing' && value.svgString) {
                      responseData += `SVG`;
                    } else if (item.inputType === 'geolocation' && typeof value === 'object') {
                      responseData += `geo: lat (${value.latitude}) / long (${value.longitude})`;
                    } else if (item.inputType === 'audioImageRecord') {
                      if (key === 'uri') {
                        const name = this.getMediaResponseObject(value, response, item);

                        responseData = `filename: ${name}`;
                        index = Object.keys(responseDataObj).length;
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

              const question = item.question.en && item.question['en']
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

              const csvObj = {
                id: response._id,
                activity_scheduled_time: response.responseScheduled || 'not scheduled',
                activity_start_time: typeof response.responseStarted === "number" ? moment(response.responseStarted).format("LLL") : response.responseStarted || null,
                activity_end_time: typeof response.responseCompleted === "number" ? moment(response.responseCompleted).format("LLL") : response.responseCompleted || null,
                flag,
                secret_user_id: MRN || null,
                userId: _id,
                activity_id: response.activity['@id'],
                activity_name: activity.label.en,
                item: item.id,
                response: responseData,
                prompt: question && question[question.length - 1] || '',
                options: options.join(', '),
                version: response.version,
                rawScore: scores.reduce((accumulated, current) => current + accumulated, 0),
                reviewing_id: response.reviewing || '',
                ... (!isSubScaleExported ? response.subScales : {}),
                ... (!isSubScaleExported ? outputTexts : {})
              }

              if (!csvObj.activity_start_time && csvObj.activity_id && csvObj.item && csvObj.response) {
                previousResponse.push(csvObj);
                continue;
              } else if (
                previousResponse.length > 0 &&
                _.find(previousResponse, o => (o.activity_id === csvObj.activity_id) && (o.item === csvObj.item)) &&
                csvObj.activity_start_time &&
                !csvObj.response
              ) {
                const index = _.findIndex(previousResponse, o => (o.activity_id === csvObj.activity_id) && (o.item === csvObj.item));
                if (index > -1) {
                  csvObj['response'] = previousResponse[index].response;
                  previousResponse.splice(index, 1);
                }
              }

              if (csvObj['response'] && csvObj['response'].includes('.quicktime'))
                csvObj['response'] = csvObj['response'].replace('.quicktime', '.MOV');

              if (_.find(csvObj, (val, key) => val === null || val === "null") !== undefined) continue;

              try {
                if (csvObj.response && csvObj.response.includes('.csv')) {
                  const { lines } = data.dataSources[response._id].data[0].value;
                  let strArr = [];
                  for (let index = 0; index < lines.length; index++) {
                    const line = lines[index];
                    if (line.startTime)
                      strArr.push(`line${index}: { start time: ${moment(line.startTime).format("L HH:mm:ss")}, end time: ${moment(line.endTime).format("L HH:mm:ss")} }`);
                  }

                  if (strArr.length > 0) {
                    if (!keys.includes("lines")) keys.push("lines");
                    csvObj['lines'] = strArr.join('\n');

                  } else if (keys.includes("lines"))
                    csvObj['lines'] = strArr.join('\n');
                }
              } catch (error) {
                console.log(error);
              }

              result.push(csvObj);
              isSubScaleExported = true;
            }
          }

          for (let row of result) {
            for (let subScaleName of subScaleNames) {
              row[subScaleName] = row[subScaleName] || '';
            }
          }

          let otc = new ObjectToCSV({
            keys: keys.concat(subScaleNames).map((value) => ({ key: value, as: value })),
            data: result,
          });

          this.downloadFile({
            name: 'report.csv',
            content: otc.getCSV(),
            type: 'text/csv;charset=utf-8'
          })

          await this.generateDrawingZip(drawingCSVs);
          await this.generateMediaResponsesZip(this.mediaResponseObjects);
        })
    },

    downloadFile({ name, content, type }) {
      const file = new Blob([content], { type })
      return new Promise(resolve => {
        saveAs(file, name)
        resolve(true)
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

      return name;
    },

    getLinesAsCSV(lines) {
      const result = [];
      for (let i = 0; i < lines.length; i++) {
        for (const point of lines[i].points) {
          result.push({
            line_number: i.toString(),
            x: point.x.toString(),
            y: point.y.toString(),
            time: point.time
          });
        }
      }

      let otc = new ObjectToCSV({
        keys: [
          'line_number',
          'x',
          'y',
          'time'
        ].map((value) => ({ key: value, as: value })),
        data: result,
      });

      return otc.getCSV();
    },

    async generateDrawingZip(drawingCSVs) {
      try {
        const zip = new JSZip();

        for (const csvData of drawingCSVs) {
          zip.file(csvData.name, csvData.data);
        }

        const generatedZip = await zip.generateAsync({ type: 'blob' });
        saveAs(generatedZip, `drawing-responses-${(new Date()).toDateString()}.zip`);
      } catch (err) {
        console.log(err);
      }
    },

    async generateMediaResponsesZip(mediaObjects) {
      if (mediaObjects.length < 1) return;
      try {
        const credentials = {
          accessKeyId: process.env.VUE_APP_ACCESS_KEY_ID,
          secretAccessKey: process.env.VUE_APP_SECRET_ACCES_KEY
        };

        const client = new S3(credentials);
        const zip = new JSZip();

        for (const mediaObject of mediaObjects) {
          const params = {
            Bucket: mediaObject.bucket,
            Key: mediaObject.key
          };

          const data = await client.getObject(params).promise();
          let filename = mediaObject.name;
          if (filename && filename.includes('.quicktime')) filename = filename.replace('.quicktime', '.MOV');
          zip.file(filename, data.Body);
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
