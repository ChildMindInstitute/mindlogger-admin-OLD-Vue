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
import { replaceItemVariableWithName } from "../helper";
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
          const result = [], events = [];

          const currentItems = {};
          const currentActivities = {};
          const activityFlows = Object.values(appletData.activityFlows || {}).map(flow => ({
            name: _.get(flow, ['schema:name', 0, '@value']),
            id: flow._id.split('/').pop(),
          }));
          for (let itemUrl in appletData.items) {
            const item = new Item(appletData.items[itemUrl]);
            currentItems[itemUrl] = item;
            if (!!item.url) {
              currentItems[item.url] = item;
            }
            currentItems[itemUrl].schemas.push(itemUrl);
          }
          for (let activityUrl in appletData.activities) {
            const activity = new Activity(appletData.activities[activityUrl]);
            currentActivities[activity.data._id.split('/')[1]] = activity;
          }

          for (let itemId in data.items) {
            data.items[itemId] = new Item(data.items[itemId])
            data.items[itemId].schemas.push(itemId);
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
            'flag',
            'secret_user_id',
            'userId',
            'activity_id',
            'activity_name',
            'activity_flow',
            'item',
            'response',
            'prompt',
            'options',
            'version',
            'rawScore',
            'reviewing_id',
          ];
          const drawingCSVs = [], stabilityCSVs = [], trailsCSVs = [];

          const parseItemOptions = (item) => {
            const options = [], scores = [];

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

            return { options, scores };
          }

          const parseResponseValue = (key, value, inputType, item) => {
            if (inputType === 'timeRange' && value.from && value.to) {
              return `time_range: from (hr ${value.from.hour}, min ${value.from.minute}) / to (hr ${value.to.hour}, min ${value.to.minute})`;
            }

            if (inputType === 'date' && (value.day || value.month || value.year)) {
              return `date: ${value.day}/${value.month + 1}/${value.year}`;
            }

            if (inputType === 'geolocation' && typeof value === 'object') {
              return `geo: lat (${value.latitude}) / long (${value.longitude})`;
            }

            if (inputType === 'text')
              return value;

            if ((inputType == 'stackedRadio' || inputType == 'stackedSlider') && item.responseOptions.hasOwnProperty(key)) {
              const label = item.responseOptions[key].name.en;
              const response = Array.isArray(value) ? value : [value];
              const str = response.map(option => option !== null ? option.toString().replace(/:\d*$/, '') : '').join(', ');

              return `${label}: ${str}`;
            }

            return `${key}: ${value}`;
          }

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

            const activityResponses = [];
            let activity = null;

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
                    } else {
                      response.data[itemUrl] = { value: itemData.ptr };
                    }
                  }
                  else {
                    response.data[itemUrl] = data.dataSources[itemData.src].data[itemData.ptr];
                  }
                }
              } catch (error) { }

              activity = currentItems[itemUrl] ?
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
                      data: this.getFlankerAsCSV(responseDataObj, item, new Date(response.responseStarted).getTime())
                    });
                    responseData = `${response._id}_${item.id}.csv`;
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
                        responseData += '\r\n';
                    });
                  }

                } else if (responseDataObj instanceof Object) {
                  const keys = Object.keys(responseDataObj).sort().reverse();

                  for (const key of keys) {
                    const value = responseDataObj[key];

                    if ((item.inputType === 'photo' || item.inputType === 'video' || item.inputType === 'audioRecord' || item.inputType === 'drawing' || item.inputType == 'trail' || item.inputType === 'audioImageRecord')) {
                      if (value.filename) {
                        const name = this.getMediaResponseObject(value.uri, response, item);

                        if (name) {
                          responseData = name;
                        } else {
                          const responseIndex = _.findIndex(previousResponse, o => (o.activity_id === response.activity['@id']) && (o.item === item.id));

                          if (responseIndex > -1) {
                            responseData += previousResponse[responseIndex].response;
                            previousResponse.splice(responseIndex, 1);
                          }
                        }
                      } else if (value && Array.isArray(value.lines)) {
                        const responseIndex = _.findIndex(previousResponse, o => (o.activity_id === response.activity['@id']) && item.schemas.includes(o.schema));
                        let nameStr = ''

                        if (responseIndex > -1) {
                          nameStr = previousResponse[responseIndex].response;
                          previousResponse.splice(responseIndex, 1);
                        } else {
                          nameStr = `${src}-${item.id}.csv`
                        }

                        const nameRegex = nameStr.match(/([^.]*)/i)
                        responseData = nameStr

                        if (item.inputType == 'drawing') {
                          drawingCSVs.push({
                            name: `${nameRegex[1]}.csv`,
                            data: this.getDrawingLinesAsCSV(value.lines, value.width || 100)
                          });
                        } else {
                          trailsCSVs.push({
                            name: `${nameRegex[1]}.csv`,
                            data: this.getTrailsLinesAsCSV(value.lines, value.width || 100)
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

                        responseData += `${response._id}_${item.id}.csv`;
                      }
                    } else {
                      responseData += parseResponseValue(key, value, item.inputType, item);
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

              const { options, scores } = parseItemOptions(item);
              const flow = activityFlows.find(flow => flow.id == response.activityFlow);

              const csvObj = {
                id: response._id,
                activity_scheduled_time: response.responseScheduled || 'not scheduled',
                activity_start_time: response.responseStarted && response.responseStarted.toString() || null,
                activity_end_time: response.responseCompleted && response.responseCompleted.toString() || null,
                hit_next_time: '',
                flag,
                secret_user_id: MRN || null,
                userId: _id,
                inputType: item.inputType,
                activity_id: response.activity['@id'],
                activity_name: activity.label.en,
                item: item.id,
                item_id: item._id,
                response: responseData,
                prompt: replaceItemVariableWithName(question && question[question.length - 1] || '', currentItems, response.data),
                options: replaceItemVariableWithName(options.join(', '), currentItems, response.data),
                version: response.version,
                rawScore: scores.reduce((accumulated, current) => current + accumulated, 0),
                reviewing_id: response.reviewing || '',
                activity_flow: flow ? flow.name : '',
                ... (!isSubScaleExported ? response.subScales : {}),
                ... (!isSubScaleExported ? outputTexts : {})
              }

              if (!csvObj.activity_start_time && csvObj.activity_id && csvObj.item && csvObj.response) {
                csvObj.schema = Object.keys(response.data)[0];
                previousResponse.push(csvObj);
                continue;
              }

              if (csvObj['response'] && typeof csvObj['response'] == 'string' && csvObj['response'].includes('.quicktime'))
                csvObj['response'] = csvObj['response'].replace('.quicktime', '.MOV');

              if (_.find(csvObj, (val, key) => val === null || val === "null") !== undefined || csvObj['response'] === '') continue;

              try {
                if (typeof csvObj.response == 'string' && csvObj.response.includes('.csv') && data.dataSources[response._id] && data.dataSources[response._id].data[0]) {
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

              activityResponses[itemUrl] = csvObj;

              isSubScaleExported = true;
            }

            if (response.events !== null && data.eventSources[response.events] && activity) {
              const flow = activityFlows.find(flow => flow.id == response.activityFlow);
              const responseEvents = data.eventSources[response.events].data || [];

              for (const event of responseEvents) {
                let item = (data.itemReferences[response.version] && data.itemReferences[response.version][event.screen]) || currentItems[event.screen];
                const question = item && item.question.en && item.question['en']
                  .replace(/\r?\n|\r/g, '')
                  .split('250)');
                const { options } = item ? parseItemOptions(item) : { options: [] };
                let eventResponse = '';

                if (event.response && item) {
                  if (item.inputType == 'text') {
                    eventResponse = event.response;
                  } else {
                    let keys = Object.keys(event.response).sort();

                    if (item.inputType != 'stackedRadio' && item.inputType != 'stackedSlider') {
                      keys = keys.reverse();
                    }

                    for (const key of keys) {
                      const value = event.response[key];

                      eventResponse += parseResponseValue(key, value, item.inputType, item);

                      if (item.inputType == 'stackedRadio' || item.inputType == 'stackedSlider') {
                        eventResponse += '\r\n';
                      }
                      else if (item.inputType !== 'text') {
                        eventResponse += ' | ';
                      }
                    }

                    eventResponse = eventResponse.replace(/[ |]*$/g, '').replace(/^[ |]*/g, '');
                  }
                }

                events.push({
                  id: response._id,
                  activity_scheduled_time: response.responseScheduled || 'not scheduled',
                  activity_start_time: response.responseStarted && response.responseStarted.toString() || null,
                  activity_end_time: response.responseCompleted && response.responseCompleted.toString()  || null,
                  press_next_time: event.type == 'NEXT' ? event.time.toString() : '',
                  press_back_time: event.type == 'PREV' ? event.time.toString() : '',
                  press_undo_time: event.type == 'UNDO' ? event.time.toString() : '',
                  press_skip_time: event.type == 'SKIP' ? event.time.toString() : '',
                  press_done_time: event.type == 'DONE' ? event.time.toString() : '',
                  response_option_selection_time: event.type == 'SET_ANSWER' ? event.time.toString() : '',
                  secret_user_id: MRN,
                  user_id: _id,
                  activity_id: response.activity['@id'],
                  activity_name: activity.label.en,
                  item: item ? item.id : event.screen,
                  item_id: item ? item._id : '',
                  prompt: replaceItemVariableWithName(question && question[question.length - 1] || '', currentItems, response.data),
                  response: eventResponse,
                  options: replaceItemVariableWithName(options.join(', '), currentItems, response.data),
                  activity_flow: flow ? flow.name : '',
                  version: response.version,
                })
              }
            }

            Object.keys(activityResponses).sort((a, b) => {
              const indexA = activity.order.indexOf(a);
              const indexB = activity.order.indexOf(b);

              if (indexA == -1) return 1;
              if (indexB == -1) return -1;
              return indexA < indexB ? -1 : indexA > indexB ? 1 : 0;
            }).forEach(itemUrl => {
              result.push(activityResponses[itemUrl]);
            })
          }

          for (let row of result) {
            const itemsWithFileResponses = ['visual-stimulus-response', 'photo', 'video', 'audioRecord', 'drawing', 'trail', 'audioImageRecord', 'stabilityTracker'];

            if (itemsWithFileResponses.includes(row.inputType) && row.response) {
              let lastResponseEvent = null;
              for (let i = 0; i < events.length; i++) {
                if (events[i].id == row.id && events[i].item_id == row.item_id && events[i].response_option_selection_time) {
                  lastResponseEvent = events[i];
                }
              }

              if (lastResponseEvent) {
                lastResponseEvent.response = row.response;
              }
            }

            for (let subScaleName of subScaleNames) {
              row[subScaleName] = row[subScaleName] || '';
            }
          }

          await this.downloadFile({
            name: 'report.csv',
            content: new ObjectToCSV({
              keys: keys.concat(subScaleNames).map((value) => ({ key: value, as: value })),
              data: result,
            }).getCSV(),
            type: 'text/csv;charset=utf-8'
          });

          await this.downloadFile({
            name: 'activity_user_journey.csv',
            content: new ObjectToCSV({
              keys: [
                'id', 'activity_scheduled_time', 'activity_start_time', 'activity_end_time',
                'press_next_time', 'press_back_time', 'press_undo_time', 'press_skip_time', 'press_done_time', 'response_option_selection_time',
                'secret_user_id', 'user_id', 'activity_id', 'activity_flow', 'activity_name', 'item',
                'prompt', 'response', 'options', 'version'
              ].map(value => ({ key: value, as: value })),
              data: events
            }).getCSV(),
            type: 'text/csv;charset=utf-8'
          })

          await this.generateLinesZip(drawingCSVs, 'drawing-responses');
          await this.generateLinesZip(trailsCSVs, 'trails-responses');
          await this.generateStabilityZip(stabilityCSVs);
          await this.generateFlankerZip(flankerCSVs);
          await this.generateMediaResponsesZip(this.mediaResponseObjects, appletId);
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

    getFlankerAsCSV(responses, item, experimentClock) {
      const result = [];

      const getImage = (image, alt) => {
        if (image) {
          return `<img src="${image}" alt="${alt}">`
        }

        return alt;
      }

      const types = item.inputs.trials.reduce((prev, trial) => ({
        ...prev,
        [getImage(trial.image, trial.name)]: trial.name,
        [trial.image]: trial.name
      }), {});

      const getResponseObj = (response, tag, config, trialStartTimestamp) => {
        const trialNumber = response.trial_index, blockNumber = config.blockIndex;

        let trialType = '', eventType = '';

        switch (tag) {
          case 'response':
            eventType = 'Response';
            break;
          case 'trial':
            eventType = 'Stimulus';
            break;
          case 'fixation':
            eventType = 'Fixation';
            break;
          case 'feedback':
            eventType = 'Feedback';
            break;
        }

        if (tag != 'trial') {
          trialType = tag == 'feedback' ? 0 : -1;

          if (tag == 'response') {
            trialType = types[response.question] || response.question;
          }
        } else {
          trialType = types[response.question] || response.question;
        }

        let responseValue = '.', responseAccuracy = '.', responseTouchTimestamp = '.', responseTime = '.';

        let videoDisplayRequestTimestamp = response.start_time + response.offset, eventStartTimestamp = response.start_timestamp;
        let eventOffset = eventStartTimestamp - trialStartTimestamp;

        if (tag == 'response') {
          eventOffset = eventStartTimestamp = '.';
          responseValue = (response.button_pressed === null || response.button_pressed === undefined) ? '.' : response.button_pressed === '0' ? 'L' : 'R';
          responseAccuracy = response.correct ? '1' : '0';
          responseTouchTimestamp = 'response_touch_timestamp' in response ? response.response_touch_timestamp || '.' : videoDisplayRequestTimestamp + response.duration;
          responseTime = response.duration;
          videoDisplayRequestTimestamp = '.';
        }

        return {
          blockNumber, trialNumber, trialType, eventType,
          responseValue, responseAccuracy, videoDisplayRequestTimestamp,
          responseTouchTimestamp, responseTime, eventStartTimestamp, eventOffset, failedPractice: ''
        }
      }

      let trialStartTimestamp = 0;

      let lastIndex = 1e6, totalCount = 0, correctCount = 0, failedPractice = 0;

      if (item.inputs.minimumAccuracy) {
        for (let i = responses.length-1; i >= 0; i--) {
          if (responses[i].trial_index > lastIndex) {
            if (correctCount / totalCount * 100 < item.inputs.minimumAccuracy) {
              failedPractice++;
            }

            correctCount = totalCount = 0;
          }

          lastIndex = responses[i].trial_index;

          if (responses[i].tag == 'trial') {
            totalCount++;

            if (responses[i].correct) {
              correctCount++;
            }
          }
        }

        if (correctCount / totalCount * 100 < item.inputs.minimumAccuracy) {
          failedPractice++;
        }
      }

      let lastTrialIndex = -1;

      for (let i = 0; i < responses.length; i++) {
        const blockClock = responses[0].start_timestamp;

        if (lastTrialIndex !== responses[i].trial_index) {
          trialStartTimestamp = responses[i].start_timestamp;
          lastTrialIndex = responses[i].trial_index;
        }

        const response = {
          ...getResponseObj(responses[i], responses[i].tag, item.inputs, trialStartTimestamp),
          blockClock, experimentClock,
          trialStartTimestamp,
          trialOffset: trialStartTimestamp - blockClock,
        }
        result.push(response);

        if (responses[i].tag == 'trial') {
          result.push({
            ...getResponseObj(responses[i], 'response', item.inputs, trialStartTimestamp),
            blockClock: '.', experimentClock: '.',
            trialStartTimestamp: '.',
            trialOffset: trialStartTimestamp - blockClock,
          })
        }
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].trialType == -1) {
          result[i].trialType = result[i + 1].trialType;
        }

        if (result[i].trialType == 0) {
          result[i].trialType = result[i - 1].trialType;
        }

        const timeFields = ['experimentClock', 'blockClock', 'trialStartTimestamp', 'eventStartTimestamp', 'videoDisplayRequestTimestamp', 'responseTouchTimestamp', 'trialOffset', 'eventOffset', 'responseTime'];
        for (let field of timeFields) {
          if (result[i][field] != '.') {
            result[i][field] = Number(result[i][field] / 1000).toFixed(3);
          }
        }
      }

      const keys = [
        {
          key: 'blockNumber',
          as: 'block_number',
        },
        {
          key: 'trialNumber',
          as: 'trial_number',
        },
        {
          key: 'trialType',
          as: 'trial_type'
        },
        {
          key: 'eventType',
          as: 'event_type',
        },
        {
          key: 'experimentClock',
          as: 'experiment_start_timestamp'
        },
        {
          key: 'blockClock',
          as: 'block_start_timestamp'
        },
        {
          key: 'trialStartTimestamp',
          as: 'trial_start_timestamp'
        },
        {
          key: 'eventStartTimestamp',
          as: 'event_start_timestamp'
        },
        {
          key: 'videoDisplayRequestTimestamp',
          as: 'video_display_request_timestamp'
        },
        {
          key: 'responseTouchTimestamp',
          as: 'response_touch_timestamp'
        },
        {
          key: 'trialOffset',
          as: 'trial_offset'
        },
        {
          key: 'eventOffset',
          as: 'event_offset'
        },
        {
          key: 'responseTime',
          as: 'response_time'
        },
        {
          key: 'responseValue',
          as: 'response'
        },
        {
          key: 'responseAccuracy',
          as: 'response_accuracy'
        }
      ];

      if (item.inputs.minimumAccuracy) {
        keys.push({
          key: 'failedPractice',
          as: 'failed_practices',
        });

        result[0].failedPractice = failedPractice.toString();
      }

      let otc = new ObjectToCSV({
        keys,
        data: result,
      });

      return otc.getCSV();
    },

    downloadFile({ name, content, type }) {
      const file = new Blob([content], { type })
      return new Promise(resolve => {
        saveAs(file, name);
        setTimeout(() => {
          resolve(true)
        })
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
    
    downloadReportPDFFromS3 (response) {
      if(!response.name.endsWith('.pdf')) {
        response.name += '.pdf'
      }

      const credentials = {
        accessKeyId: process.env.VUE_APP_ACCESS_KEY_ID,
        secretAccessKey: process.env.VUE_APP_SECRET_ACCES_KEY,
        httpOptions: {
          timeout: 320000
        },
      };

      const { bucket, key } = this.parseS3URL(response.uri);

      const client = new S3(credentials);
      client.getObject({
        Bucket: bucket,
        Key: key
      }).promise().then(data => {
        const blob = new Blob([data.Body], { type: 'application/pdf' });
        saveAs(blob, response.name);
      })
    },

    parseS3URL (value) {
      const identifier = 's3://';
      if (!value.includes(identifier)) return {};

      value = value.replace(identifier, '');
      const separator = value.indexOf('/');

      const bucket = value.slice(0, separator);
      const key = value.slice(separator + 1, value.length);

      const extension = value.slice(value.lastIndexOf('.'), value.length);

      return { bucket, key, extension };
    },

    getMediaResponseObject(value, response, item) {
      const { bucket, key, extension } = this.parseS3URL(value);

      if (!bucket) return ;

      const name = `${response._id}-${response.userId}-${item.id}${extension}`;

      this.mediaResponseObjects.push({ bucket, name, key });

      return name;
    },

    getStabilityCSV(responses) {
      const result = [];
      let startTime = 0;

      const getPointStr = (pos) => {
        if (pos.length == 2) {
          return `(${pos[0]}, ${pos[1]})`
        }

        return `${pos[0]}`;
      }

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];

        if (!startTime) {
          startTime = response.timestamp;
        }

        result.push({
          lambda: response.lambda,
          lambdaSlope: response.lambdaSlope,
          score: response.score,
          stimPos: getPointStr(response.stimPos),
          targetPos: getPointStr(response.targetPos),
          seconds: Number((response.timestamp - startTime) / 1000).toString(),
          epochTimeInSecondsStart: !i ? (startTime / 1000).toString() : '',
          utcTimestamp: Number(response.timestamp / 1000).toString(),
          userPos: getPointStr(response.userPos),
        });
      }

      let otc = new ObjectToCSV({
        keys: [
          {
            key: 'lambda',
            as: 'lambda_value'
          },
          {
            key: 'lambdaSlope',
            as: 'lambda_slope'
          },
          {
            key: 'score',
            as: 'score'
          },
          {
            key: 'stimPos',
            as: 'stimulus_position',
          },
          {
            key: 'targetPos',
            as: 'target_position',
          },
          {
            key: 'userPos',
            as: 'user_position'
          },
          {
            key: 'seconds',
            as: 'seconds'
          },
          {
            key: 'utcTimestamp',
            as: 'UTC_Timestamp'
          },
          {
            key: 'epochTimeInSecondsStart',
            as: 'epoch_time_in_seconds_start'
          },
        ],
        data: result,
      });

      return otc.getCSV();
    },

    getTrailsLinesAsCSV(lines, width) {
      const result = [];
      let totalTime = 0, errorCount = 0, startTime = 0, firstPoint = true;

      for (let i = 0; i < lines.length; i++) {
        let hasError = false;
        for (const point of lines[i].points) {
          if (!point.valid) {
            hasError = true;
          }

          if (!startTime) {
            startTime = point.time;
          }

          result.push({
            line_number: i.toString(),
            x: (point.x / width * 100).toString(),
            y: (100 - point.y / width * 100).toString(),
            utcTimestamp: Number(point.time / 1000).toString(),
            seconds: Number((point.time - startTime) / 1000).toString(),
            epochTimeInSecondsStart: firstPoint ? (startTime / 1000).toString() : '',
            error: point.valid ? 'E0' : point.actual != 'none' ? 'E1' : 'E2',
            total_time: '',
            total_number_of_errors: '',
            correct_path: `${point.start} ~ ${point.end}`,
            actual_path: `${point.start} ~ ${point.actual == 'none' ? '?' : (point.actual || point.end)}`
          })

          firstPoint = false;

          if (totalTime < point.time - startTime) {
            totalTime = point.time - startTime;
          }
        }

        if (hasError) {
          errorCount++;
        }
      }

      if (result.length) {
        result[0].total_time = Number(totalTime / 1000).toString();
        result[0].total_number_of_errors = errorCount;
      }

      let otc = new ObjectToCSV({
        keys: [
          { key: 'line_number', as: 'line_number' },
          { key: 'x', as: 'x' },
          { key: 'y', as: 'y' },
          { key: 'error', as: 'error' },
          { key: 'correct_path', as: 'correct_path' },
          { key: 'actual_path', as: 'actual_path' },
          { key: 'utcTimestamp', as: 'UTC_Timestamp' },
          { key: 'seconds', as: 'seconds' },
          { key: 'epochTimeInSecondsStart', as: 'epoch_time_in_seconds_start' },
          { key: 'total_time', as: 'total_time' },
          { key: 'total_number_of_errors', as: 'total_number_of_errors' }
        ],
        data: result,
      });

      return otc.getCSV();
    },

    getDrawingLinesAsCSV(lines, width) {
      const result = [];
      let startTime = 0, firstPoint = true;

      for (let i = 0; i < lines.length; i++) {
        for (const point of lines[i].points) {
          if (!startTime) {
            startTime = point.time;
          }

          result.push({
            line_number: i.toString(),
            x: (point.x / width * 100).toString(),
            y: (100 - point.y / width * 100).toString(),
            UTC_Timestamp: Number(point.time / 1000).toString(),
            seconds: Number((point.time - startTime) / 1000).toString(),
            epoch_time_in_seconds_start: firstPoint ? (startTime / 1000).toString() : '',
          });

          firstPoint = false;
        }
      }

      let otc = new ObjectToCSV({
        keys: [
          'line_number',
          'x',
          'y',
          'UTC_Timestamp',
          'seconds',
          'epoch_time_in_seconds_start',
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

    async generateMediaResponsesZip(mediaObjects, appletId) {
      if (mediaObjects.length < 1) return;
      try {
        const credentials = {
          accessKeyId: process.env.VUE_APP_ACCESS_KEY_ID,
          secretAccessKey: process.env.VUE_APP_SECRET_ACCES_KEY,
          httpOptions: {
            timeout: 320000
          },
        };
        const client = new S3(credentials);
        const zip = new JSZip();

        for (const mediaObject of mediaObjects) {
          const params = {
            Bucket: mediaObject.bucket,
            Key: mediaObject.key
          };
          let filename = mediaObject.name;
          if (mediaObject.isGCP || mediaObject.isAzure) {
            try {
              const blobFile = await this.gcpFileBlob(mediaObject.bucket, mediaObject.key, appletId, mediaObject.isAzure);
              if (filename && filename.includes('.quicktime')) filename = filename.replace('.quicktime', '.MOV');
              zip.file(filename, blobFile, { base64: true });
            } catch (error) {
              console.error(error);
            }

          } else {
            try {
              const data = await client.getObject(params).promise();
              if (filename && filename.includes('.quicktime')) filename = filename.replace('.quicktime', '.MOV');
              zip.file(filename, data.Body);
            } catch (e) {
              console.error(e);
            }
          }
        }

        const generatedZip = await zip.generateAsync({ type: 'blob' });
        saveAs(generatedZip, `media-responses-${(new Date()).toDateString()}.zip`);
        this.mediaResponseObjects.length = 0;
      } catch (err) {
        console.log(err);
      }
    },

    async gcpFileBlob(bucket, key, appletId, isAzure) {
      try {
        if (isAzure) key = key.replace('mindlogger/', '')
        const data = await api.downloadGCPFile(this.apiHost, this.token, appletId, bucket, key, isAzure)
        try {
          if (data.data.split("'").length > 1)
            return data.data.split("'")[1];
        } catch (error) {
          console.error(err.name, err.message);
        }
        return data.data;
      } catch (err) {
        console.error(err.name, err.message);
      }
    },
  },
}
