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
  const getTimeString = (obj) => {
    if (!obj) return '';

    return `${obj.hour.toString().padStart(2, '0')}:${obj.minute.toString().padStart(2, '0')}`;
  }

  const getDateString = (obj) => {
    if (!obj) return '';
    return `${obj.year}-${Number(obj.month+1).toString().padStart(2, '0')}-${Number(obj.day).toString().padStart(2, '0')}`;
  }
  try {
    const variableNames = getTextBetweenBrackets(markdown);
    if (variableNames && variableNames.length) {
      variableNames.forEach(variableName => {
        let index;
        _.forEach(items, (val, key) => {
          if (val && val.id === variableName) index = key;
        });

        const reg = new RegExp(`\\[\\[${variableName}\\]\\]`, "gi");
        if (answers[index] && Array.isArray(answers[index].value)) {
          let names = [];
          answers[index].value.forEach(ans => {
            const item = _.find(items[index] && items[index].responseOptions, { value: ans });
            if (item) names.push(item.name.en);
          })
          markdown = markdown.replace(reg, names.join(', ') + ' ');

        } else if (typeof answers[index] === "object") {
          switch (items[index].inputType) {
            case 'radio':
              const item = index > -1 && _.find(items[index].responseOptions, { value: answers[index].value });
              if (item) {
                markdown = markdown.replace(reg, item.name.en + ' ');
              }
              break;
            case 'slider':
              markdown = markdown.replace(reg, answers[index].value + ' ');
              break;
            case 'timeRange':
              markdown = markdown.replace(reg, getTimeString(answers[index].value && answers[index].value.from) + ' - ' + getTimeString(answers[index].value && answers[index].value.to) + ' ');
              break;
            case 'date':
              markdown = markdown.replace(reg, getDateString(answers[index].value) + ' ');
              break;
            case 'ageSelector':
              markdown = markdown.replace(reg, answers[index].value + ' ');
              break;
            case 'text':
              markdown = markdown.replace(reg, answers[index].value.toString().replace(/(?=[$&])/g, '\\') + '');
              break;
          }
        } else if (answers[index]) {
          markdown = markdown.replace(reg, answers[index].toString().replace(/(?=[$&])/g, '\\') + ' ');
        }

        markdown = markdown.replace(reg, ' ');
      });
    }
  } catch (error) {
    console.warn(error)
  }

  return markdown;
}
