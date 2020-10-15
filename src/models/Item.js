import axios from 'axios';

import i18n from '../core/i18n';
import ReproLib from '../schema/ReproLib';
import SKOS from '../schema/SKOS';


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
    this.type = data['@type'];
    this.label = i18n.arrayToObject(data[SKOS.prefLabel]);
    this.inputType = data[ReproLib.inputType][0]['@value'];
    this.url = data['schema:url'];
    this.description = i18n.arrayToObject(data['schema:description']);
    this.version = i18n.arrayToObject(data['schema:version']);
    this.schemaVersion = i18n.arrayToObject(data['schema:schemaVersion']);
    this.responseOptions = this.parseResponseOptions(data[ReproLib.responseOptions]);
    this.responses = [];
    this.maxValue = 'schema:maxValue' in data[ReproLib.responseOptions][0]
      ? data[ReproLib.responseOptions][0]['schema:maxValue'][0]['@value']
      : 0;
    this.minValue = 'schema:minValue' in data[ReproLib.responseOptions][0]
      ? data[ReproLib.responseOptions][0]['schema:minValue'][0]['@value']
      : 0;
    this.chart = {
      data: [],
    };
    this.dateToVersions = {};
    this.schemas = [];
    this.valueMapping = {};
  }

  /**
   * Given the JSON-LD object generates the list of available choices for this
   * item.
   *
   * @param {Object} responseOptions the json-ld object with the choice data.
   * @return {Array} available response choices.
   */
  parseResponseOptions(responseOptions) {
    const itemListElement = responseOptions[0]['schema:itemListElement'];

    return itemListElement.map((choice, index) => ({
      name: i18n.arrayToObject(choice['schema:name']),
      value: choice['schema:value'][0]['@value'],
      color: choice['schema:value'][0]['@value'] > 0
        ? this.coldColors.shift()
        : this.warmColors.shift(),
    }));
  }

  appendResponseOption(option) {
    this.responseOptions.push({
      ...option,
      color: option.value > 0 ? this.coldColors.shift() : this.warmColors.shift()
    })

    return this.responseOptions.length - 1;
  }

  getChoiceByValue(value) {
    return this.responseOptions.find(choice => choice.value === value);
  }

  getChoiceByName(name) {
    return this.responseOptions.find(choice => choice.name.en === name);
  }

  getChoice(str, version) {
    const numericValue = +str;

    return Number.isNaN(numericValue)
      ? this.getChoiceByName(str)
      : this.valueMapping[version] && this.valueMapping[version][numericValue] !== undefined 
      ? this.responseOptions[this.valueMapping[version][numericValue]]
      : this.getChoiceByValue( 
        numericValue
      );
  }


  appendResponses(responses) {
    this.responses = this.responses.concat(responses.map(response => {
      if (!Array.isArray(response.value)) {
        // Ensure that it is an array.
        response.value = [response.value];
      }

      return response.value.reduce(
        (obj, tokenValue) => {
          const choice =  this.getChoice(tokenValue, response.version);
          const { value, name } = choice;

          return {
            ...obj,
            cummulative: obj.cummulative + value,
            positive: value > 0 ? obj.positive + value : obj.positive,
            negative: value < 0 ? obj.negative + value : obj.negative,
            userActivity: true,
            [name.en]: (obj[name.en] || 0) + value,
            barIndex: response.barIndex,
            bars: this.dateToVersions[response.date].length,
            version: response.version
          };
        },
        {
          date: new Date(response.date),
          cummulative: 0,
          positive: 0,
          negative: 0,
          userActivity: false,
          bars: 1,
          barIndex: 0,
          version: null
        },
      );
    }));
  }
}
