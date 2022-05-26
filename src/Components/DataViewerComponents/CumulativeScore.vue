<template>
  <div
    v-if="reportCount"
    class="cumulative-results"
  >
    <h2>{{ $t("summary") }}</h2>
    <template v-for="cumulativeResult in results">
      <div
        v-if="(!applySecretIdSelector || secretIds.includes(cumulativeResult.response.secretId))"
        :key="cumulativeResult.response.responseId"
      >
        <div class="cumulative-date">
          {{ cumulativeResult.response.date }}
        </div>

        <div class="cumulative-result">
          <div
            v-for="(item, index) in cumulativeResult.reportMessages"
            :key="index"
            class="cumulative-score"
          >
            <div>{{ item.category.replace(/_/g, " ") }}</div>
            <div>{{ item.score }}</div>
            <markdown :source="item.message" />
          </div>
        </div>
      </div>
    </template>
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

.cumulative-score /deep/ img {
  max-width: 100%;
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
import Markdown from "../Utils/Markdown";
import { replaceItemVariableWithName } from "../Utils/helper";

export default {
  name: "CumulativeScore",
  components: {
    Markdown,
  },
  props: {
    secretIds: {
      type: Array,
      required: true
    },
    activity: {
      type: Object,
      required: true,
    },
    applySecretIdSelector: {
      type: Boolean,
      required: false,
      default: false
    },
    focusExtent: {
      type: Array,
      required: true
    }
  },
  data() {
    const parser = new Parser({
      logical: true,
      comparison: true,
    });

    this.activity.compute = (this.activity.data["reprolib:terms/compute"] || []).map(
      (itemCompute) => ({
        jsExpression: _.get(itemCompute, ["reprolib:terms/jsExpression", 0, "@value"]),
        variableName: _.get(itemCompute, ["reprolib:terms/variableName", 0, "@value"]),
      })
    );
    this.activity.messages = (this.activity.data["reprolib:terms/messages"] || []).map(
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
        const rawResponses = (this.activity.items || []).map(
          item => item.rawResponses.find(resp => resp.responseId == activityResponse.responseId)
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
          const scoreCategory = replaceItemVariableWithName(category, this.activity.items, rawResponses).replace(/\s/g, '__');
          const expr = parser.parse(
            scoreCategory + jsExpression.substr(variableName.length)
          );

          const variableScores = {
            [scoreCategory]: outputType == "percentage" ? Math.round(cumulativeMaxScores[category] ? cumulativeScores[category] * 100 / cumulativeMaxScores[category] : 0) : cumulativeScores[category]
          }

          if (expr.evaluate(variableScores)) {
            reportMessages.push({
              category: scoreCategory,
              message: replaceItemVariableWithName(message, this.activity.items, rawResponses),
              score: variableScores[scoreCategory] + (outputType == "percentage" ? "%" : ""),
            });
          }
        });

        return {
          response: {
            ...activityResponse,
            date: moment.utc(activityResponse.date).format("MM/DD hh:mm A"),
            datetime: activityResponse.date
          },
          reportMessages,
        };
      }
    );

    return {
      cumulativeResults,
    };
  },

  computed: {
    results () {
      return this.cumulativeResults.filter(
        result => result.response.datetime >= this.focusExtent[0] && result.response.datetime <= this.focusExtent[1]
      )
    },
    reportCount () {
      let count = 0;
      for (let i = 0; i < this.results.length; i++) {
        count += this.results[i].reportMessages.length
      }

      return count
    }
  }
};
</script>
