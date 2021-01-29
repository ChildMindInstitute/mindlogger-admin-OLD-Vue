import api from "../api/api.vue";
import Applet from "../../../models/Applet";
import Item from "../../../models/Item";
import ObjectToCSV from 'object-to-csv';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/fr';
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
    exportUserData(appletMeta, key=null) {
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
        for (let itemUrl in appletData.items) {
          currentItems[itemUrl] = new Item(appletData.items[itemUrl]);
        }

        for (let itemId in data.items) {
          data.items[itemId] = new Item(data.items[itemId])
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
          const _id = response.userId, MRN = response.MRN;

          for (let subScaleName in response.subScales) {
            let subScale = response.subScales[subScaleName];

            if (subScale && subScale.ptr !== undefined && subScale.src !== undefined) {
              response.subScales[subScaleName] = data.subScaleSources[subScale.src].data[subScale.ptr];
            }

            if (subScaleNames.indexOf(subScaleName) < 0) {
              subScaleNames.push(subScaleName);
            }
          }

          let isSubScaleExported = false;

          for (let itemUrl in response.data) {
            let itemData = response.data[itemUrl];

            if (itemData && itemData.ptr !== undefined && itemData.src !== undefined) {
              response.data[itemUrl] =
                data.dataSources[itemData.src].data[itemData.ptr];
            }

            let item = (data.itemReferences[response.version] && data.itemReferences[response.version][itemUrl])
                            || currentItems[itemUrl];
            if (!item) {
              continue;
            }

            let options = [], scores = [];
            let responseData = [];

            if (response.data[itemUrl] === null ) {
              responseData = null;
            } else if (item.inputType === 'radio' || item.inputType === 'slider') {
              options = item.responseOptions.map(option => 
                `${Object.values(option.name)[0]}: ${option.value} ${item.scoring ? '(score: ' + option.score + ')' : ''}`
              );

              if (!Array.isArray(response.data[itemUrl])) {
                response.data[itemUrl] = [response.data[itemUrl]]
              }

              response.data[itemUrl].forEach(val => {
                if (typeof val === 'string') {
                  let option = item.responseOptions.find(option => Object.values(option.name)[0] === val);
                  if (option) {
                    responseData.push(option.value);
                    if (item.scoring) {
                      scores.push(option.score);
                    }
                  }
                } else {
                  responseData.push(val);

                  if (item.scoring) {
                    let option = item.responseOptions.find(option => option.value === val);
                    if (option) {
                      scores.push(option.score);
                    }
                  }
                }
              });
            } else {
              if (typeof response.data[itemUrl] == 'object' && response.data[itemUrl]) {
                responseData = Object.keys(response.data[itemUrl]).map(key => `${key}: ${JSON.stringify(response.data[itemUrl][key]).replace(/[,"]/g, ' ')}`);
              } else {
                responseData = [response.data[itemUrl]];
              }
            }

            result.push({
              id: response._id,
              created: response.created,
              MRN: MRN || null,
              userId: _id,
              activity: response.activity.name,
              item: itemUrl,
              response: responseData,
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

        let otc = new ObjectToCSV({
          keys: [
            'id',
            'created',
            'secretUserId',
            'userId',
            'activity',
            'item',
            'response',
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
    }
  }
}
