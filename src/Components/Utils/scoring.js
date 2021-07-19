import { Parser } from "expr-eval";

export const getScoreFromResponse = (item, response) => {
  if (response === null || item.inputType !== 'radio' && item.inputType !== 'slider') {
    return 0;
  }
  if (!item.scoring) {
    return 0;
  }

  const { responseId } = response;

  const itemResponse = item.responses.find(res => res.responseId === responseId)

  if (!itemResponse) {
    return 0;
  }

  let score = 0;

  for (const choice of item.responseOptions) {
    if (itemResponse[choice.id] !== undefined && choice.score) {
      score += choice.score;
    }
  }

  return score;
}

export const getMaxScore = (item) => {
  if (item.inputType !== 'radio' && item.inputType !== 'slider') {
    return 0;
  }

  if (!item.scoring) {
    return 0;
  }

  const oo = 1e6;
  return item.responseOptions.reduce((previousValue, currentOption) => {
    return item.isMultipleChoice ? Math.max(currentOption.score + previousValue, previousValue) : Math.max(currentOption.score, previousValue)
  }, item.isMultipleChoice ? 0 : -oo);
}

export const evaluateScore = (testExpression, items = [], scores = [], subScaleResult = {}) => {
  const parser = new Parser();

  try {
    let expression = testExpression;

    for (const variableName in subScaleResult) {
      expression = expression.replace(
        new RegExp(`\\(${variableName}\\)`, 'g'), subScaleResult[variableName].tScore
      );
    }

    for (let i = 0; i < items.length; i++) {
      expression = expression.replace(
        new RegExp(`\\b${items[i]['data']['@id']}\\b`, 'g'), scores[i]
      );
    }

    // Run the expression
    const expr = parser.parse(expression);

    const result = expr.evaluate();
    return result;
  } catch (error) {
    console.log('error is', error);
    return null;
  }
};
