<template>
  <div class="cumulative-score-report">
    <div v-for="{activity, reportMessages} in activityResponses" :key="activity.id" class="mb-5">
      <p class="text-decoration-underline font-weight-bold mb-4">
        {{ activity.id }} Report
      </p>
      <p class="text-body-2 mb-4">
        <vue-markdown>{{ (activity.scoreOverview || '').replace(MARKDOWN_REGEX, '$1$2') }}</vue-markdown>
      </p>
      <div v-for="item in reportMessages" :key="item.category" class="my-4">
        <p class="blue--text font-weight-bold mb-1">
          {{ (item.category || '').replace(/_/g, ' ') }}
        </p>
        <p class="text-body-2 mb-4">
          <vue-markdown>{{ (item.compute.description || '').replace(MARKDOWN_REGEX, '$1$2') }}</vue-markdown>
        </p>
        <div class="score-area mb-4">
          <p
            class="score-title font-weight-bold text-nowrap"
            :style="{ left: `${(item.scoreValue / item.maxScoreValue) * 100}%` }">
            Your/Your Child's Score
          </p>
          <div
            class="score-bar score-below"
            :class="{
              'score-positive': item.compute.direction,
              'score-negative': !item.compute.direction,
            }"
            :style="{ width: `${(item.exprValue / item.maxScoreValue) * 100}%` }"
          />
          <div
            class='score-bar score-above'
            :class="{
              'score-positive': !item.compute.direction,
              'score-negative': item.compute.direction,
            }"
          />
          <div
            class='score-spliter'
            :style="{ left: `${(item.scoreValue / item.maxScoreValue) * 100}%` }"
          />
          <p class="score-max-value font-weight-bold">
            <strong>{{item.maxScoreValue}}</strong>
          </p>
        </div>
        <p class="text-uppercase font-weight-bold font-italic mb-1">
          If score
          <span class="ml-2">{{item.jsExpression}}</span>
        </p>

        <div class="mb-4">
          Your/Your child’s score on the {{item.category.replace(/_/g, ' ')}} subscale was 
          <span class="red--text">{{item.scoreValue}}</span>.
          <vue-markdown>{{ item.message.replace(MARKDOWN_REGEX, '$1$2') }}</vue-markdown>
        </div>
      </div>
    </div>
    <p class="text-footer text-body-2 mb-5">
      {{ termsText }}
    </p>
    <p class="text-footer">
      {{ footerText }}
    </p>
  </div>
</template>

<style scoped>
  .cumulative-score-report {
    width: 600px;
  }
  .text-decoration-underline {
    text-decoration: underline;
  }
  .text-uppercase {
    text-transform: uppercase;
  }
  .font-weight-bold {
    font-weight: bold;
  }
  .font-italic {
    font-style: italic;
  }
  .text-body-2 {
    font-size: 0.9rem;
  }
  .blue--text {
    color: #2196f3;
  }
  .red--text {
    color: #ff0000;
  }
  .mb-1 {
    margin-bottom: 0.25em;
  }
  .ml-2 {
    margin-left: 0.5em;
  }
  .mb-4 {
    margin-bottom: 1em;
  }
  .my-4 {
    margin-top: 1em;
    margin-bottom: 1em;
  }
  .mb-5 {
    margin-bottom: 2em;
  }
  .score-bar {
    width: 400px;
  }
  .text-footer {
    line-height: 2em;
  }
  .score-area {
    position: relative;
    display: flex;
    width: 100%;
    max-width: 400px;
    padding: 60px 0 30px;
  }
  .score-bar {
    height: 60px;
  }
  .score-positive {
    background-color: #a1cd63;
  }
  .score-negative {
    background-color: #b02318;
  }
  .score-above {
    flex: 1;
  }
  .score-spliter {
    position: absolute;
    top: 30px;
    width: 5px;
    height: 120px;
    background-color: #000;
  }
  .score-title {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
  }
  .score-max-value {
    position: absolute;
    margin: 0;
    right: 0;
    bottom: 0;
  }
</style>

<script>
import VueMarkdown from "vue-markdown";
import { Parser } from "expr-eval";
import _ from "lodash";
import {
  getScoreFromResponse,
  getMaxScore,
  evaluateScore,
} from "../Utils/scoring";

export default {
  name: "CumulativeScoreReport",
  components: {
    VueMarkdown,
  },
  props: {
    activities: {
      type: Array,
      required: true,
    },
  },
  data() {
    const parser = new Parser({
      logical: true,
      comparison: true,
    });
    const activityResponses = [];
    for (const activity of this.activities) {
      if (activity.responses.length === 0) {
        continue;
      }

      activity.compute = (activity.data["reprolib:terms/compute"] || []).map(
        (itemCompute) => ({
          jsExpression: _.get(itemCompute, ["reprolib:terms/jsExpression", 0, "@value"]),
          variableName: _.get(itemCompute, ["reprolib:terms/variableName", 0, "@value"]),
        })
      );
      activity.messages = (activity.data["reprolib:terms/messages"] || []).map(
        (itemMessage) => ({
          jsExpression: _.get(itemMessage, ["reprolib:terms/jsExpression", 0, "@value"]),
          message: _.get(itemMessage, ["reprolib:terms/message", 0, "@value"]),
          outputType: _.get(itemMessage, ["reprolib:terms/outputType", 0, "@value"]),
        })
      );

      let scores = [], maxScores = [];
      const lastResponseIndex = activity.responses.length - 1;
      for (let i = 0; i < activity.items.length; i++) {
        const { variableName, responses } = activity.items[i];
        let score = getScoreFromResponse(
          activity.items[i],
          responses[lastResponseIndex][variableName] ? responses[lastResponseIndex][variableName] : responses[lastResponseIndex],
        );
        scores.push(score);
        maxScores.push(getMaxScore(activity.items[i]));
      }

      const cumulativeScores = activity.compute.reduce((accumulator, itemCompute) => ({
        ...accumulator,
        [itemCompute.variableName.trim().replace(/\s/g, '__')]: evaluateScore(itemCompute.jsExpression, activity.items, scores),
      }), {});

      const cumulativeMaxScores = activity.compute.reduce((accumulator, itemCompute) => ({
        ...accumulator,
        [itemCompute.variableName.trim().replace(/\s/g, '__')]: evaluateScore(itemCompute.jsExpression, activity.items, maxScores),
      }), {});

      const reportMessages = [];
      let cumActivities = [];
      activity.messages.forEach((msg) => {
        const { jsExpression, message, outputType, nextActivity } = msg;

        const exprArr = jsExpression.split(/[><]/g);
        const variableName = exprArr[0];
        const exprValue = parseFloat(exprArr[1].split(' ')[1]);
        const category = variableName.trim().replace(/\s/g, '__');
        const expr = parser.parse(category + jsExpression.substr(variableName.length));

        const variableScores = {
          [category]: outputType == 'percentage' ? Math.round(cumulativeMaxScores[category] ? (cumulativeScores[category] * 100) / cumulativeMaxScores[category] : 0) : cumulativeScores[category],
        };

        if (expr.evaluate(variableScores)) {
          if (nextActivity) cumActivities.push(nextActivity);

          const compute = activity.compute.find(
            (itemCompute) => itemCompute.variableName.trim() == variableName.trim(),
          );

          reportMessages.push({
            category,
            message,
            score: variableScores[category] + (outputType == 'percentage' ? '%' : ''),
            compute,
            jsExpression: jsExpression.substr(variableName.length),
            scoreValue: cumulativeScores[category],
            maxScoreValue: cumulativeMaxScores[category],
            exprValue: outputType == 'percentage' ? (exprValue * cumulativeMaxScores[category]) / 100 : exprValue,
          });
        }
      });
      activityResponses.push({
        activity,
        reportMessages
      })
    }

    return {
      MARKDOWN_REGEX: /(!\[.*\]\s*\(.*?) =\d*x\d*(\))/g,
      termsText:
        "I understand that the information provided by this questionnaire is not intended to replace the advice, diagnosis, or treatment offered by a medical or mental health professional, and that my anonymous responses may be used and shared for general research on children’s mental health.",
      footerText:
        "CHILD MIND INSTITUTE, INC. AND CHILD MIND MEDICAL PRACTICE, PLLC (TOGETHER, “CMI”) DOES NOT DIRECTLY OR INDIRECTLY PRACTICE MEDICINE OR DISPENSE MEDICAL ADVICE AS PART OF THIS QUESTIONNAIRE. CMI ASSUMES NO LIABILITY FOR ANY DIAGNOSIS, TREATMENT, DECISION MADE, OR ACTION TAKEN IN RELIANCE UPON INFORMATION PROVIDED BY THIS QUESTIONNAIRE, AND ASSUMES NO RESPONSIBILITY FOR YOUR USE OF THIS QUESTIONNAIRE.",
      activityResponses,
    }
  },
};
</script>
