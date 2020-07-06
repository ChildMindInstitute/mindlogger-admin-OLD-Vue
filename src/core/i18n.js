export default {
  /**
   * Converts the given i18n array to an object.
e  *
   * This function expects the array to have the following format:
   *  [
   *    { "@language": "en", "@value": "Paid attention" },
   *    { "@language": "es", "@value": "Prestó atención" },
   *  ]
   *
   * and it returns an object with the following format:
   *  {
   *    en: 'Paid attention',
   *    es: 'Prestó atención',
   *  }
   *
   * @param {Array} data the i18n array.
   * @return {Object} the i18n object.
   */
  arrayToObject: (data = []) => data.reduce(
    (translations, current) => {
      translations[current['@language']] = current['@value']

      return translations;
    },
    {},
  ),
};
