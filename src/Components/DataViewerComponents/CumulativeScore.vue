<template>
  <div class="cumulative-results">
    <div v-for="cumulativeResult in cumulativeResults" :key="cumulativeResult.response.responseId">
      <div class="cumulative-date">{{ cumulativeResult.response.date }}</div>
      <div class="cumulative-result">
        <div v-for="(item, index) in cumulativeResult.reportMessages" :key="index" class="cumulative-score">
          <div>{{ item.category.replace(/_/g, " ") }}</div>
          <div>{{ item.score }}</div>
          <div>{{ item.message }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cumulative-results {
  padding: 1rem;
}
.cumulative-date {
  font-weight: bold;
}
.cumulative-result {
  padding: 1rem;
}
.cumulative-score {
  border-bottom: 1px solid #aaa;
}
</style>

<script>
import { Parser } from "expr-eval";
import moment from "moment";
import _ from "lodash";
import {
  getScoreFromResponse,
  getMaxScore,
  evaluateScore,
} from "../Utils/scoring";

export default {
  name: 'CumulativeScore',
  props: {
    activity: {
      type: Object,
      required: true,
    },
  },
  data() {
    const parser = new Parser({
      logical: true,
      comparison: true,
    });

    this.activity.compute = this.activity.data["reprolib:terms/compute"].map(
      (itemCompute) => ({
        jsExpression: _.get(itemCompute, ["reprolib:terms/jsExpression", 0, "@value"]),
        variableName: _.get(itemCompute, ["reprolib:terms/variableName", 0, "@value"]),
      })
    );
    this.activity.messages = this.activity.data["reprolib:terms/messages"].map(
      (itemMessage) => ({
        jsExpression: _.get(itemMessage, ["reprolib:terms/jsExpression", 0, "@value"]),
        message: _.get(itemMessage, ["reprolib:terms/message", 0, "@value"]),
        outputType: _.get(itemMessage, ["reprolib:terms/outputType", 0, "@value"]),
      })
    );

    const cumulativeResults = this.activity.responses.map(
      (activityResponse) => {
        const scores = (this.activity.items || []).map((item) =>
          getScoreFromResponse(item, activityResponse)
        );
        const maxScores = (this.activity.items || []).map((item) =>
          getMaxScore(item)
        );

        const cumulativeScores = this.activity.compute.reduce((accumulator, itemCompute) => ({
          ...accumulator,
          [itemCompute.variableName.trim().replace(/\s/g, "__")]: evaluateScore(itemCompute.jsExpression, this.activity.items, scores),
        }), {});
        const cumulativeMaxScores = this.activity.compute.reduce((accumulator, itemCompute) => ({
          ...accumulator,
          [itemCompute.variableName.trim().replace(/\s/g, "__")]: evaluateScore(itemCompute.jsExpression, this.activity.items, maxScores),
        }), {});

        const reportMessages = [];
        this.activity.messages.forEach((msg) => {
          const { jsExpression, message, outputType } = msg;

          const variableName = jsExpression.split(/[><]/g)[0];
          const category = variableName.trim().replace(/\s/g, "__");
          const expr = parser.parse(
            category + jsExpression.substr(variableName.length)
          );

          if (expr.evaluate(cumulativeScores)) {
            reportMessages.push({
              category,
              message,
              score: outputType == "percentage" ? Math.round(cumulativeMaxScores[category] ? (cumulativeScores[category] * 100) / cumulativeMaxScores[category] : 0) + "%" : cumulativeScores[category]
            });
          }
        });

        return {
          response: {
            ...activityResponse,
            date: moment(activityResponse.date).format("MM/DD hh:mm A"),
          },
          reportMessages,
        };
      }
    );

    return {
      cumulativeResults,
    };
  },
};
</script>
