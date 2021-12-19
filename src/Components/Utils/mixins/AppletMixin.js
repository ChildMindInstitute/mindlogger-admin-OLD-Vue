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
          const flankerCSVs = [];

          const keys = [
            'id',
            'activity_scheduled_time',
            'activity_start_time',
            'activity_end_time',
            'hit_next_time',
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
          const drawingCSVs = [], stabilityCSVs = [], trailsCSVs = [];

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

              if (!item || itemData === null) {
                continue;
              }

              const src = itemData.src;
              try {
                if (itemData && itemData.ptr !== undefined && itemData.src !== undefined) {
                  if (_.isArray(data.dataSources[itemData.src].data) && itemData.ptr && typeof itemData.ptr === "object") {
                    if (itemData.ptr.index !== undefined) {
                      response.data[itemUrl] = data.dataSources[itemData.src].data[itemData.ptr.index];

                      if (data.dataSources[itemData.src].data[itemData.ptr.index].value.lines)
                        response.data[itemUrl] = { ...data.dataSources[itemData.src].data[itemData.ptr.index], value: itemData.ptr };
                    } else {
                      response.data[itemUrl] = { value: itemData.ptr };
                    }
                  }
                  else {
                    response.data[itemUrl] = data.dataSources[itemData.src].data[itemData.ptr];
                  }
                }
              } catch (error) { }

              let activity = currentItems[itemUrl] ?
                currentActivities[response.activity['@id']] :
                data.activities[item.data.activityId];

              let flag = 'completed';

              if (response.responseScheduled && !response.responseStarted) {
                flag = 'missed';
              } else if (response.responseStarted && response.timeout) {
                flag = 'incomplete';
              }

              let responseDataObj = response.data[itemUrl];
              if (typeof responseDataObj == 'object' && !Array.isArray(responseDataObj)) {
                responseDataObj = { ...responseDataObj }
              }

              let responseData = '';

              if (!responseDataObj) {
                responseData = null;
              } else {
                if (responseDataObj instanceof Array) {
                  if (item.inputType == 'visual-stimulus-response') {
                    flankerCSVs.push({
                      name: `${response._id}_${item.id}.csv`,
                      data: this.getFlankerAsCSV(responseDataObj, item)
                    });
                    responseData = `filename: ${response._id}_${item.id}.csv`;
                  } else {
                    responseDataObj.forEach((value, index) => {
                      if (value instanceof Object && !Array.isArray(value)) {
                        responseData += Object.entries(value).map(entry => `${entry[0]}: ${entry[1]}`).join(', ');
                      } else {
                        if (item.inputType == 'stackedRadio' || item.inputType == 'stackedSlider') {
                          const label = item.responseOptions[index].name.en;
                          const response = Array.isArray(value) ? value : [value];
                          const str = response.map(option => option !== null ? option.toString().replace(/:\d*$/, '') : '').join(', ');

                          responseData += `${label}: ${str}`;
                        } else {
                          responseData += `${index}: ${value}`;
                        }
                      }

                      if (index !== responseDataObj.length - 1)
                        responseData += '\r\n\r\n';
                    });
                  }

                } else if (responseDataObj instanceof Object) {
                  const keys = Object.keys(responseDataObj).sort().reverse();

                  for (const key of keys) {
                    const value = responseDataObj[key];

                    if (item.inputType === 'timeRange' && value.from && value.to) {
                      responseData += `time_range: from (hr ${value.from.hour}, min ${value.from.minute}) / to (hr ${value.to.hour}, min ${value.to.minute})`;

                    } else if ((item.inputType === 'photo' || item.inputType === 'video' || item.inputType === 'audioRecord' || item.inputType === 'drawing' || item.inputType == 'trail' || item.inputType === 'audioImageRecord')) {
                      if (value.filename) {
                        const name = this.getMediaResponseObject(value.uri, response, item);

                        if (name) {
                          responseData += `filename: ${name}`;
                        } else {
                          const responseIndex = _.findIndex(previousResponse, o => (o.activity_id === response.activity['@id']) && (o.item === item.id));

                          if (responseIndex > -1) {
                            responseData += previousResponse[responseIndex].response;
                            previousResponse.splice(responseIndex, 1);
                          }
                        }
                      } else if (value && Array.isArray(value.lines)) {
                        const responseIndex = _.findIndex(previousResponse, o => (o.activity_id === response.activity['@id']) && (o.item === item.id));
                        let nameStr = ''

                        if (responseIndex > -1) {
                          nameStr = previousResponse[responseIndex].response;
                          previousResponse.splice(responseIndex, 1);
                        } else {
                          nameStr = `filename: ${src}-${item.id}.csv`
                        }

                        const nameRegex = nameStr.match(/filename: ([^.]*)/i)
                        responseData += `filename: ${nameRegex[1]}`

                        if (item.inputType == 'drawing') {
                          drawingCSVs.push({
                            name: `${nameRegex[1]}.csv`,
                            data: this.getDrawingLinesAsCSV(value.lines)
                          });
                        } else {
                          trailsCSVs.push({
                            name: `${nameRegex[1]}.csv`,
                            data: this.getTrailsLinesAsCSV(value.lines)
                          })
                        }
                      } else if (key == 'text') {
                        responseData += `${key}: ${value}`;
                      }
                    } else if (item.inputType == 'stabilityTracker') {
                      if (Array.isArray(value)) {
                        stabilityCSVs.push({
                          name: `${response._id}_${item.id}.csv`,
                          data: this.getStabilityCSV(value)
                        })

                        responseData += `filename: ${response._id}_${item.id}.csv`;
                      }
                    } else if (item.inputType === 'date' && (value.day || value.month || value.year)) {
                      responseData += `date: ${value.day}/${value.month + 1}/${value.year}`;
                    } else if (item.inputType === 'geolocation' && typeof value === 'object') {
                      responseData += `geo: lat (${value.latitude}) / long (${value.longitude})`;
                    } else {
                      if (item.inputType === 'text')
                        responseData += value;
                      else
                        responseData += `${key}: ${value}`;
                    }

                    if (item.inputType !== 'text')
                      responseData += ' | ';
                  }

                  responseData = responseData.replace(/[ |]*$/g, '').replace(/^[ |]*/g, '');
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
                hit_next_time: '',
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

              if (data.nextsAt && data.nextsAt[response._id] && data.nextsAt[response._id][itemUrl])
                csvObj['hit_next_time'] = typeof data.nextsAt[response._id][itemUrl] === "number" ? moment(data.nextsAt[response._id][itemUrl]).format("LLL") : data.nextsAt[response._id][itemUrl] || null;

              if (!csvObj.activity_start_time && csvObj.activity_id && csvObj.item && csvObj.response) {
                previousResponse.push(csvObj);
                continue;
              }

              if (csvObj['response'] && typeof csvObj['response'] == 'string' && csvObj['response'].includes('.quicktime'))
                csvObj['response'] = csvObj['response'].replace('.quicktime', '.MOV');

              if (_.find(csvObj, (val, key) => val === null || val === "null") !== undefined || csvObj['response'] === '') continue;

              try {
                if (typeof csvObj.response == 'string' && csvObj.response.includes('.csv')) {
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

          await this.generateLinesZip(drawingCSVs, 'drawing-responses');
          await this.generateLinesZip(trailsCSVs, 'trails-responses');
          await this.generateStabilityZip(stabilityCSVs);
          await this.generateFlankerZip(flankerCSVs);
          await this.generateMediaResponsesZip(this.mediaResponseObjects);
        })
    },

    async generateFlankerZip(flankerCSVs) {
      if (flankerCSVs.length > 0) {
        try {
          const zip = new JSZip();

          for (const csvData of flankerCSVs) {
            zip.file(csvData.name, csvData.data);
          }

          const generatedZip = await zip.generateAsync({ type: 'blob' });
          saveAs(generatedZip, `flanker-responses-${(new Date()).toDateString()}.zip`);
        } catch (err) {
          console.log(err);
        }
      }
    },

    getFlankerAsCSV(responses, item) {
      const result = [];
      const types = {
        '>>>>>': { stimulusType: 4, ext: 'right-con', expected: '>', },
        '<<><<': { stimulusType: 6, ext: 'right-inc', expected: '>' },
        '-->--': { stimulusType: 2, ext: 'right-net', expected: '>' },
        '<<<<<': { stimulusType: 3, ext: 'left-con', expected: '<' },
        '>><>>': { stimulusType: 5, ext: 'left-inc', expected: '<' },
        '--<--': { stimulusType: 1, ext: 'left-net', expected: '<' }
      }

      const getResponseObj = (response, tag, config) => {
        const trialNumber = response.trial_index;
        const duration = config.trialDuration + (config.showFeedback ? 500 : 0) + (config.showFixation ? 500 : 0);

        let stimulusType = '', eventTypeExt = tag, eventType = (tag == 'response' ? 'Response' : 'Display');

        if (tag != 'trial') {
          stimulusType = tag == 'feedback' ? 0 : -1;
        } else {
          stimulusType = types[response.question].stimulusType;
          eventTypeExt = types[response.question].ext;
        }

        let expectedDisplayOnset = '.', expectedDisplayOffset = '.', actualDisplayOnset = '.', actualDisplayOffset = '.', displayDuration = '';
        let expectedDisplayOnsetClock = '', expectedDisplayOffsetClock = '', actualDisplayOnsetClock = '', actualDisplayOffsetClock = '';

        let responseValue = '', responseExpected = '', responseAccuracy = '', responseTime = '';
        let responseClock = '';
        let trialClock = '';

        const timeOffset = response.start_timestamp - response.start_time;

        if (tag != 'response') {
          expectedDisplayOnset = (trialNumber - 1) * duration;

          if (tag == 'feedback' || tag == 'trial') {
            if (tag == 'feedback') {
              expectedDisplayOnset += config.trialDuration;
            }

            if (config.showFixation) {
              expectedDisplayOnset += 500;
            }
          }

          expectedDisplayOffset = expectedDisplayOnset + (tag == 'trial' ? config.trialDuration : 500);

          actualDisplayOnset = response.start_time;
          actualDisplayOffset = response.start_time + response.duration;
          displayDuration = expectedDisplayOffset - expectedDisplayOnset;

          /*** clockstamp */
          expectedDisplayOnsetClock = expectedDisplayOnset + timeOffset;
          expectedDisplayOffsetClock = expectedDisplayOffset + timeOffset;
          actualDisplayOnsetClock = actualDisplayOnset + timeOffset;
          actualDisplayOffsetClock = actualDisplayOffset + timeOffset;
        } else {
          responseValue = response.button_pressed === null ? '.' : response.button_pressed === '0' ? 'L' : 'R';
          responseExpected = types[response.question].expected == '>' ? 'R' : 'L';
          responseAccuracy = response.correct ? '1' : '0';
          responseTime = response.duration;
          responseClock = response.start_timestamp + response.duration;
        }

        if (tag == 'trial') {
          trialClock = response.start_timestamp
        }

        return {
          trialNumber, eventType, stimulusType, eventTypeExt,
          expectedDisplayOnset, actualDisplayOnset, expectedDisplayOffset, actualDisplayOffset,
          displayDuration, responseValue, responseExpected, responseAccuracy, responseTime,
          expectedDisplayOnsetClock, actualDisplayOnsetClock,
          expectedDisplayOffsetClock, actualDisplayOffsetClock,
          responseClock, trialClock
        }
      }

      for (let i = 0; i < responses.length; i++) {
        result.push({
          ...getResponseObj(responses[i], responses[i].tag, item.inputs),
          experimentClock: responses[0].start_timestamp
        })

        if (responses[i].tag == 'trial') {
          result.push({
            ...getResponseObj(responses[i], 'response', item.inputs),
            experimentClock: responses[0].start_timestamp
          })
        }
      }

      let otc = new ObjectToCSV({
        keys: [
          {
            key: 'trialNumber',
            as: 'trial_number',
          },
          {
            key: 'eventType',
            as: 'Event Type',
          },
          {
            key: 'stimulusType',
            as: 'Stimulus Type'
          },
          {
            key: 'eventTypeExt',
            as: 'EventTypeExt',
          },
          {
            key: 'expectedDisplayOnset',
            as: 'Expected Display Onset'
          },
          {
            key: 'actualDisplayOnset',
            as: 'Actual Display Onset'
          },
          {
            key: 'expectedDisplayOffset',
            as: 'Expected Display Offset'
          },
          {
            key: 'actualDisplayOffset',
            as: 'Actual Display Offset'
          },
          {
            key: 'displayDuration',
            as: 'Display Duration'
          },
          {
            key: 'responseValue',
            as: 'Response Value'
          },
          {
            key: 'responseExpected',
            as: 'Response Expected'
          },
          {
            key: 'responseAccuracy',
            as: 'Response Accuracy'
          },
          {
            key: 'responseTime',
            as: 'Response Time'
          },
          {
            key: 'expectedDisplayOnsetClock',
            as: 'Expected Display Onset(Clockstamp)'
          },
          {
            key: 'actualDisplayOnsetClock',
            as: 'Actual Display Onset(Clockstamp)'
          },
          {
            key: 'expectedDisplayOffsetClock',
            as: 'Expceted Display Offset(Clockstamp)'
          },
          {
            key: 'actualDisplayOffsetClock',
            as: 'Actual Display Offset(Clockstamp)'
          },
          {
            key: 'responseClock',
            as: 'Response (Clockstamp)'
          },
          {
            key: 'trialClock',
            as: 'Trial Clockstamp'
          },
          {
            key: 'experimentClock',
            as: 'Experiment Clockstamp'
          }
        ],
        data: result,
      });

      return otc.getCSV();
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

    getStabilityCSV(responses) {
      const result = [];

      const getPointStr = (pos) => {
        if (pos.length == 2) {
          return `(${pos[0]}, ${pos[1]})`
        }

        return `${pos[0]}`;
      }

      for (const response of responses) {
        result.push({
          lambda: response.lambda,
          lambdaSlope: response.lambdaSlope,
          score: response.score,
          stimPos: getPointStr(response.stimPos),
          targetPos: getPointStr(response.targetPos),
          timestamp: response.timestamp,
          userPos: getPointStr(response.userPos),
        });
      }

      let otc = new ObjectToCSV({
        keys: [
          {
            key: 'lambda',
            as: 'lambda'
          },
          {
            key: 'lambdaSlope',
            as: 'Lambda Slope'
          },
          {
            key: 'score',
            as: 'score'
          },
          {
            key: 'stimPos',
            as: 'Stim Position',
          },
          {
            key: 'targetPos',
            as: 'Target Position',
          },
          {
            key: 'timestamp',
            as: 'timestamp'
          },
          {
            key: 'userPos',
            as: 'User Position'
          }
        ],
        data: result,
      });

      return otc.getCSV();
    },

    getTrailsLinesAsCSV(lines) {
      const result = [];
      let startTime = 0, totalTime = 0, errorCount = 0;

      for (let i = 0; i < lines.length; i++) {
        for (const point of lines[i].points) {
          if (!startTime) {
            startTime = point.time;
          }

          result.push({
            line_number: i.toString(),
            x: point.x.toString(),
            y: point.y.toString(),
            time: (point.time - startTime).toString(),
            valid: point.valid ? 'True' : 'False',
            total_time: '',
            total_number_of_errors: ''
          })

          if (totalTime < point.time - startTime) {
            totalTime = point.time - startTime;
          }
        }

        if (lines[i].points.length && !lines[i].points[0].valid) {
          errorCount++;
        }
      }

      if (result.length) {
        result[0].total_time = totalTime;
        result[0].total_number_of_errors = errorCount;
      }

      let otc = new ObjectToCSV({
        keys: [
          { key: 'line_number', as: 'Line Number' },
          { key: 'x', as: 'x' },
          { key: 'y', as: 'y' },
          { key: 'time', as: 'time' },
          { key: 'valid', as: 'valid' },
          { key: 'total_time', as: 'Total Time' },
          { key: 'total_number_of_errors', as: 'Total Number of Errors' }
        ],
        data: result,
      });

      return otc.getCSV();
    },

    getDrawingLinesAsCSV(lines) {
      const result = [];
      for (let i = 0; i < lines.length; i++) {
        for (const point of lines[i].points) {
          result.push({
            line_number: i.toString(),
            x: point.x.toString(),
            y: point.y.toString(),
            time: typeof point.time === "number" ? moment(point.time).format("YYYY-MM-DD HH:mm:ss") : point.time || '',
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

    async generateLinesZip(csvs, name) {
      try {
        if (csvs.length > 0) {
          const zip = new JSZip();

          for (const csvData of csvs) {
            zip.file(csvData.name, csvData.data);
          }

          const generatedZip = await zip.generateAsync({ type: 'blob' });
          saveAs(generatedZip, `${name}-${(new Date()).toDateString()}.zip`);
        }
      } catch (err) {
        console.log(err);
      }
    },

    async generateStabilityZip(stabilityCSVs) {
      try {
        if (stabilityCSVs.length > 0) {
          const zip = new JSZip();

          for (const csvData of stabilityCSVs) {
            zip.file(csvData.name, csvData.data);
          }

          const generatedZip = await zip.generateAsync({ type: 'blob' });
          saveAs(generatedZip, `stability-tracker-responses-${(new Date()).toDateString()}.zip`);
        }
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
