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
    this.data = data;
    this.id = data['@id'];
    this.type = data['@type'];
    this.label = i18n.arrayToObject(data[SKOS.prefLabel]);
    this.inputType = data[ReproLib.inputType][0]['@value'];
    this.url = data['schema:url'];
    this.description = i18n.arrayToObject(data['schema:description']);
    this.version = i18n.arrayToObject(data['schema:version']);
    this.schemaVersion = i18n.arrayToObject(data['schema:schemaVersion']);
    this.responseOptions = Item.parseResponseOptions(data[ReproLib.responseOptions]);
  }

  /**
   * Given the JSON-LD object generates the list of available choices for this
   * item.
   *
   * @param {Object} responseOptions the json-ld object with the choice data.
   * @return {Array} available response choices.
   */
  static parseResponseOptions(responseOptions) {
    const itemListElement = responseOptions[0]['schema:itemListElement'];
    const warmColors = [
      '#E91E63',
      '#F44336',
      '#F46E48',
      '#FDAF5C',
      '#FDDF87',
      '#9C27B0',
      '#673AB7',
    ];
    const coldColors = [
      '#45aaf2',
      '#5FC3A9',
      '#ABDEA3',
      '#E6F59A',
      '#4b7bec',
      '#2B87C6',
      '#778ca3',
    ];

    return itemListElement.map((choice, index) => ({
      name: i18n.arrayToObject(choice['schema:name']),
      value: choice['schema:value'][0]['@value'],
      color: choice['schema:value'][0]['@value'] > 0
        ? coldColors.shift()
        : warmColors.shift(),
    }));
  }
}
