import _ from "lodash";

export const getTextBetweenBrackets = (str) => {
  const reBrackets = /\[\[(.*?)\]]/g;
  const listOfText = [];
  let found;
  while (found = reBrackets.exec(str)) {
    listOfText.push(found[1]);
  };
  return listOfText;
};

export const replaceItemVariableWithName = (markdown, items, answers) => {
  try {
    const variableNames = getTextBetweenBrackets(markdown);
    if (variableNames && variableNames.length) {
      variableNames.forEach(variableName => {
        let index;
        _.forEach(items, (val, key) => {
          if (val && val.id === variableName) index = key;
        });

        if (answers[index] && Array.isArray(answers[index].value)) {
          let names = [];
          answers[index].value.forEach(ans => {
            const item = _.find(items[index] && items[index].responseOptions, { value: ans });
            if (item) names.push(item.name.en);
          })
          const reg = new RegExp(`${variableName}`, "gi");
          markdown = markdown.replace(reg, names.join(', '));

        } else if (typeof answers[index] === "object") {
          const item = _.find(items[index] && items[index].responseOptions, answers[index]);
          if (item || answers[index]) {
            const reg = new RegExp(`${variableName}`, "gi");
            markdown = markdown.replace(reg, (item && item.name && item.name.en) || (answers[index] && answers[index].value));
          }

        } else if (answers[index]) {
          const reg = new RegExp(`${variableName}`, "gi");
          markdown = markdown.replace(reg, answers[index]);
        }
      });
    }
    markdown = markdown.replace(/[\[\]']+/g, '');

  } catch (error) {
    console.warn(error)
  }
  return markdown;
}
