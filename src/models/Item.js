import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';

import i18n from '../core/i18n';
import ReproLib from '../schema/ReproLib';
import SKOS from '../schema/SKOS';
import slugify from '../core/slugify';
import { ReportBase } from 'istanbul-lib-report';

export default class Item {
  /**
   * Initialize the Item instance with the given data.
   *
   * @param {Object} data the data for this item.
   */
  constructor(data) {
    this.warmColors = [
      '#FDBB93',
      '#E65751',
      '#ED7465',
      '#B83A49',
      '#6A0A3D',
      '#edd5b9',
      '#f2d1c2',
      '#f39a87',
      '#c86311',
      '#582400',
      '#9a5c08',
    ];
    this.coldColors = [
      '#419DC5',
      '#70C3D0',
      '#BEE0CC',
      '#223B89',
      '#316BA7',
      '#1976D2',
      '#6a7177',
      '#afb3b6',
      '#ed91b6',
      '#e03e91',
      '#af035b'
    ];

    this.data = data;
    this.id = data['@id'];
    this._id = data['_id'];
    this.slug = slugify(this.id);
    this.type = data['@type'];
    this.label = i18n.arrayToObject(data[SKOS.prefLabel]);
    this.inputType = data[ReproLib.inputType][0]['@value'];
    this.inputs = this.transformInputs(_.get(data, ['reprolib:terms/inputs'], []))
    this.url = data['schema:url'];
    this.description = i18n.arrayToObject(data['schema:description']);
    this.question = i18n.arrayToObject(data['schema:question']);
    this.version = data['schema:version'] && i18n.arrayToObject(data['schema:version']);
    this.schemaVersion = data['schema:schemaVersion'] && i18n.arrayToObject(data['schema:schemaVersion']);
    this.responseOptions = this.parseResponseOptions(data[ReproLib.responseOptions], this.inputType);
    this.responses = [];
    this.maxValue = _.get(data, [ReproLib.responseOptions, 0, 'schema:maxValue', 0, '@value'], 0);
    this.maxValueImg = _.get(data, [ReproLib.responseOptions, 0, 'schema:maxValueImg', 0, '@value'], '');

    this.minValue = _.get(data, [ReproLib.responseOptions, 0, 'schema:minValue', 0, '@value'], 0);
    this.minValueImg = _.get(data, [ReproLib.responseOptions, 0, 'schema:minValueImg', 0, '@value'], 0);

    this.scoring = data[ReproLib.responseOptions] && ReproLib.scoring in data[ReproLib.responseOptions][0]
      && data[ReproLib.responseOptions][0][ReproLib.scoring][0]['@value'];

    this.dateToVersions = {};
    this.multiChoiceStatusByVersion = {};
    this.schemas = [];
    this.valueMapping = {};
    this.isTokenItem = data[ReproLib.responseOptions] && ReproLib.valueType in data[ReproLib.responseOptions][0]
      ? data[ReproLib.responseOptions][0][ReproLib.valueType][0]['@id'].includes('#token') : false;
    this.isMultipleChoice = data[ReproLib.responseOptions] && ReproLib.multipleChoice in data[ReproLib.responseOptions][0]
      ? data[ReproLib.responseOptions][0][ReproLib.multipleChoice][0]['@value'] : false;

    this.isContinuousSlider = _.get(data, [ReproLib.responseOptions, 0, ReproLib.continuousSlider, 0, '@value'], false);
    this.showTickMarks = _.get(data, [ReproLib.responseOptions, 0, ReproLib.showTickMarks, 0, '@value']);

    this.dataColor = '#8076B2';
    this.partOfSubScale = false;
    this.allowEdit = data[ReproLib.allowEdit] && data[ReproLib.allowEdit][0]
      ? data[ReproLib.allowEdit][0]['@value'] : true;
    this.enableNegativeTokens = _.get(data, [ReproLib.responseOptions, 0, ReproLib.enableNegativeTokens, 0, '@value'], false);
    this.isResponseIdentifier = _.get(data, [ReproLib.responseOptions, 0, 'reprolib:terms/isResponseIdentifier', 0, '@value'], false);
    this.correctAnswer = _.get(data, ['schema:correctAnswer', 0, '@value'], null);

    const allowList = _.get(data, [ReproLib.allow, 0, "@list"], [])
    this.isSkippable = allowList.some(allow => allow && ( allow['@id'] == ReproLib.refusedToAnswer || allow['@id'] == ReproLib.doNotKnow ))
  }

  transformInputs(inputs) {
    return inputs.reduce((acc, current) => {
      const name = _.get(current, ['schema:name', 0, '@value'])
      const value = _.get(current, ['schema:value', 0, '@value'])

      return {
        ...acc,
        [name]: value
      }
    }, {})
  }

  /**
   * Given the JSON-LD object generates the list of available choices for this
   * item.
   *
   * @param {Object} responseOptions the json-ld object with the choice data.
   * @return {Array} available response choices.
   */
  parseResponseOptions(responseOptions, inputType) {
    if (
      !responseOptions || !Array.isArray(responseOptions) || typeof(responseOptions[0]) != 'object'
    ) {
      return null;
    }

    if (inputType == 'radio' || inputType == 'slider') {
      const itemListElement = responseOptions[0]['schema:itemListElement'];
      if (!itemListElement) return null;

      return itemListElement.map((choice, index) => ({
        name: i18n.arrayToObject(choice['schema:name']),
        value: Number(choice['schema:value'][0]['@value']),
        score: Number(Array.isArray(choice['schema:score']) && choice['schema:score'][0] && choice['schema:score'][0]['@value']),
        color: choice['schema:value'][0]['@value'] > 0
          ? this.coldColors.shift()
          : this.warmColors.shift(),
        image: choice['schema:image'],
        description: _.get(choice, ['schema:description', 0, "@value"], '')
      })).map(choice => ({
        ...choice,
        id: `${Object.values(choice.name)[0]} (${choice.value || 0})`
      }));
    } else if (inputType == 'stackedRadio') {
      return _.get(responseOptions, [0, 'reprolib:terms/itemList'], []).map(item => ({
        name: i18n.arrayToObject(item['schema:name'])
      }))
    } else if (inputType == 'stackedSlider') {
      return _.get(responseOptions, [0, 'reprolib:terms/sliderOptions'], []).map(option => ({
        name: i18n.arrayToObject(option['schema:sliderLabel'])
      }))
    }

    return null;
  }

  appendResponseOption(option) {
    this.responseOptions.push({
      ...option,
      color: option.value > 0 ? this.coldColors.shift() : this.warmColors.shift()
    })

    return this.responseOptions.length - 1;
  }

  getChoiceByValue(value) {
    return this.responseOptions && this.responseOptions.find(choice => choice.value === Math.floor(value + 0.5));
  }

  getChoiceByName(name) {
    return this.responseOptions && this.responseOptions.find(choice => choice.name.en === name);
  }

  getChoice(str, version) {
    const numericValue = +str;

    return Number.isNaN(numericValue)
      ? this.valueMapping[version] &&
      this.valueMapping[version][str] !== undefined &&
      this.responseOptions[this.valueMapping[version][str]]
      ||
      this.getChoiceByName(str)

      : this.valueMapping[version] &&
      this.valueMapping[version][numericValue] !== undefined &&
      this.responseOptions[this.valueMapping[version][numericValue]]
      ||
      this.getChoiceByValue(
        numericValue
      );
  }

  isRadioSlider() {
    return this.inputType == 'radio' && !this.multipleChoice || this.inputType == 'slider';
  }

  isCheckBox() {
    return this.inputType == 'radio' && this.multipleChoice;
  }

  appendResponses(responses, inputType, secretIDs) {
    this.responses = this.responses.concat(responses.map(response => {
      if (response.value.value !== undefined) {
        response.value = response.value.value;
      }

      if (!Array.isArray(response.value)) {
        // Ensure that it is an array.
        response.value = [response.value];
      } else {
        response.value = response.value;
      }

      if (inputType === 'time' || inputType == 'text' || inputType == 'timeRange' || inputType == 'date') {
        return {
          date: new Date(response.date),
          value: response.value[0],
          version: response.version,
          responseId: response.responseId,
          secretId: (secretIDs[response.responseId] || null)
        };
      }

      return response.value.reduce(
        (obj, tokenValue) => {
          const choice = this.getChoice(tokenValue, response.version);

          if (!choice) {
            return obj;
          }

          const { value, name } = choice;

          return {
            ...obj,
            [choice.id]: (obj[choice.id] || 0) + Number(value),
          };
        },
        {
          date: new Date(response.date),
          version: response.version,
          responseId: response.responseId,
          secretId: (secretIDs[response.responseId] || null)
        },
      );
    }));
  }

  getFormattedTokenData() {
    /** merge responses with same version/date */
    let merged = [], last = null;
    let dateToVersions = {};

    this.responses.forEach(resp => {
      let dateStr = moment.utc(resp.date).format('YYYY-MM-DD');

      /** consider that responses are already sorted by date/version */
      if (last && dateStr == last.date && resp.version == last.version) {
        for (let choice of this.responseOptions) {
          if (resp[choice.id]) {
            last[choice.id] = last[choice.id] ? last[choice.id] + resp[choice.id] : resp[choice.id];
          }
        }
      } else if (resp.version) {
        dateToVersions[dateStr] = dateToVersions[dateStr] || [];
        dateToVersions[dateStr].push(resp.version);

        merged.push({
          ...resp,
          date: dateStr,
          barIndex: dateToVersions[dateStr].length-1
        });

        last = merged[merged.length - 1];
      }
    });

    return {
      data: merged.map(response => {
        let positive = 0, negative = 0, cummulative = 0;

        for (let choice of this.responseOptions) {
          let value = response[choice.id];

          if (value) {
            positive = value > 0 ? positive + value : positive;
            negative = value < 0 ? negative + value : negative;
            cummulative = cummulative + value;
          }
        }

        return {
          ...response,
          bars: dateToVersions[response.date].length,
          positive,
          negative,
          cummulative,
          date: new Date(response.date)
        }
      }),
      versionsByDate: dateToVersions,
      features: this.responseOptions.map(choice => ({
        ...choice,
        slug: slugify(choice.id)
      })),
    }
  }

  getTimeResponseData() {
    return {
      data: this.responses.map(response => {
        return {
          ...response,
          value: new Date().setHours(response.value.hour, response.value.minute, 0, 0)
        };
      }),
    }
  }

  getFormattedResponseData() {
    let features = this.responseOptions.map(choice => ({
      ...choice,
      slug: slugify(choice.name.en),
    }));

    return {
      data: this.responses.map(response => {
        let formatted = { ...response };

        for (let choice of features) {
          if (formatted[choice.id] !== undefined) {
            formatted[choice.slug] = formatted[choice.id];

            delete formatted[choice.id];
          }
        }

        return formatted;
      }),
      features: features.filter((feature, index) => features.findIndex(value => value.slug == feature.slug) == index),
    }
  }

  getQuestionImage() {
    const imageUrlRE = new RegExp(/http([\S]+)/i);
    const imageMatch = this.question.en && this.question.en.match(imageUrlRE);

    return imageMatch && imageMatch[0] || '';  // The image URL.
  }

  getQuizWithoutImage() {
    const imageRE = new RegExp(/[\r\n]*\!\[.*\]\(.*=.*\)[\r\n]*/i);
    return this.question.en && this.question.en.replace(imageRE, '').replace(/\*\*/g, '') || this.label.en;  // Remove the image from the question.
  }
}
