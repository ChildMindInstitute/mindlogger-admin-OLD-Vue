import i18n from '../core/i18n';
import ReproLib from '../schema/ReproLib';
import SKOS from '../schema/SKOS';


export default class Activity {
  /**
   * Initialize the Activity instance with the given data.
   *
   * @param {Object} data the data for this activity.
   */
  constructor(data) {
    this.id = data['@id'];
    this.label = i18n.arrayToObject(data[SKOS.prefLabel]);
    this.description = i18n.arrayToObject(data['schema:description']);
    this.question = i18n.arrayToObject(data['schema:question']);
    this.version = i18n.arrayToObject(data['schema:version']);
    this.url = data['schema:url'];
    this.choices = Activity.parseResponseOptions(data[ReproLib.responseOptions]);
  }

  /**
   * Given the JSON-LD object generates the list of available choices for this
   * activity.
   *
   * @param {Object} responseOptions the json-ld object with the choice data.
   * @return {Array} available response choices.
   */
  static parseResponseOptions(responseOptions) {
    const itemListElement = responseOptions['schema:itemListElement'];

    return itemListElement.map(choice => ({
      name: i18n.arrayToObject(choice['schema:name']),
      value: choice['schema:value'][0]['@value']),
    }));
  }
}
