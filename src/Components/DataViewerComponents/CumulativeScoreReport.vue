<template>
  <div class="cumulative-score-report">
    <section class="pdf-item" v-for="({ activity, reportMessages, scoreOverview }, index) in activityResponses" :key="activity.id">
      <div
        v-if="index && splashScreenType(activity) == 'image'"
        class="html2pdf__page-break"
      />

      <div
        v-if="splashScreenType(activity) === 'image'"
        class="html2pdf__page-break splash-screen"
        :style="'margin-top:' + 2 * (index + 1) + 'px'"
      >
        <img
          class="splash-image"
          crossorigin="anonymous"
          :src="activity.splash.en + '?not-from-cache-please'"
          alt="Splash Activity"
        />
      </div>
      <div v-if="appletImage && !index" class="applet-logo">
        <img
          :src="appletImage + '?not-from-cache-please'"
          crossorigin="anonymous"
          width="100"
          alt=''
        />
      </div>
      <p class="text-body-2 mb-4">
        <markdown :source="scoreOverview.replace(MARKDOWN_REGEX, '$1$2')" useCORS></markdown>
      </p>
      <div v-for="item in reportMessages" :key="item.category" class="mt-4">
        <p class="blue--text text-body-2 mb-1">
          <b>{{ (item.category || "").replace(/_/g, " ") }}</b>
        </p>
        <p class="text-body-2 mb-4">
          <markdown :source="item.compute.description.replace(MARKDOWN_REGEX, '$1$2')" useCORS></markdown>
        </p>
        <div class="score-area mb-4">
          <p class="score-title text-body-2 text-nowrap" :style="{ left: `max(90px, ${(item.scoreValue / item.maxScoreValue) * 100}%)` }">
            <b>{{ $t('childScore') }}</b>
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
            class="score-bar score-above"
            :class="{
              'score-positive': !item.compute.direction,
              'score-negative': item.compute.direction,
            }"
          />
          <div class="score-spliter" :style="{ left: `${(item.scoreValue / item.maxScoreValue) * 100}%` }" />
          <p class="score-max-value text-body-2">
            <b>{{ item.maxScoreValue }}</b>
          </p>
        </div>

        <div class="text-body-2">
          {{ $t('childScoreOnSubScale', { name: item.category.replace(/_/g, " ") }) }}
          <span class="red--text">{{ item.scoreValue }}</span>
          .
          <markdown :source="item.message.replace(MARKDOWN_REGEX, '$1$2')" useCORS></markdown>
        </div>
      </div>
    </section>
    <section class="mt-4 divider" />
    <section class="pdf-item">
      <p class="text-footer text-body-1 mb-5">
        {{ $t('termsText') }}
      </p>
      <p class="text-footer text-body-3">
        {{ $t('pdfFooterText') }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.cumulative-score-report {
  width: 656px;
  font-family: Arial, Helvetica, sans-serif;
}
.applet-logo {
  float: right;
  margin-top: 2px;
  margin-left: 15px;
}
.text-uppercase {
  text-transform: uppercase;
}
.text-body-2 {
  font-size: 0.9rem;
}
.text-body-1 {
  font-size: 0.8rem;
}
.text-body-3 {
  font-size: 0.7rem;
}
.blue--text {
  color: #2196f3;
}
.red--text {
  color: #ff0000;
}
.text-nowrap {
  white-space: nowrap;
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
.mt-4 {
  margin-top: 1em;
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
  width: 400px;
  padding: 50px 0 30px;
}
.score-bar {
  height: 40px;
}
.divider {
  border: 1px solid black;
  margin-bottom: 3.5em;
  margin-top: 3.5em;
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
  height: 80px;
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
.splash-screen {
  display: flex;
  justify-content: center;
}
.splash-image {
  object-fit: cover;
  max-height: calc(297mm - 80px);
}
.full-height {
  height: 100%;
}
.full-width {
  width: 100%;
}
</style>

<script>
import Markdown from "../Utils/Markdown";
import { Parser } from "expr-eval";
import _ from "lodash";
import Mimoza from "mimoza";
import { getScoreFromResponse, getMaxScore, evaluateScore } from "../Utils/scoring";
import { replaceItemVariableWithName } from "../Utils/helper";

export default {
  name: "CumulativeScoreReport",
  components: {
    Markdown,
  },
  props: {
    secretIds: {
      type: Array,
      required: true
    },
    appletImage: {
      type: String,
      required: true,
    },
    activities: {
      type: Array,
      required: true,
    },
    applySecretIdSelector: {
      type: Boolean,
      required: false,
      default: true
    },
  },
  data() {
    return {
      MARKDOWN_REGEX: /(!\[.*\]\s*\(.*?) =\d*x\d*(\))/g,
      termsText:
        "I understand that the information provided by this questionnaire is not intended to replace the advice, diagnosis, or treatment offered by a medical or mental health professional, and that my anonymous responses may be used and shared for general research on children’s mental health.",
      footerText:
        "CHILD MIND INSTITUTE, INC. AND CHILD MIND MEDICAL PRACTICE, PLLC (TOGETHER, “CMI”) DOES NOT DIRECTLY OR INDIRECTLY PRACTICE MEDICINE OR DISPENSE MEDICAL ADVICE AS PART OF THIS QUESTIONNAIRE. CMI ASSUMES NO LIABILITY FOR ANY DIAGNOSIS, TREATMENT, DECISION MADE, OR ACTION TAKEN IN RELIANCE UPON INFORMATION PROVIDED BY THIS QUESTIONNAIRE, AND ASSUMES NO RESPONSIBILITY FOR YOUR USE OF THIS QUESTIONNAIRE.",
      activityResponses: [],
    };
  },

  watch: {
    applySecretIdSelector: {
      handler () {
        this.activityResponses = this.getActivityResponses();
      },
      immediate: true
    },
    secretIds: {
      deep: true,
      handler () {
        this.activityResponses = this.getActivityResponses();
      }
    }
  },

  mounted () {
    this.activityResponses = this.getActivityResponses();
  },
  methods: {
    getActivityResponses () {
      const parser = new Parser({
        logical: true,
        comparison: true,
      });
      const activityResponses = [];

      for (const activity of this.activities) {
        if (activity.responses.length === 0) {
          continue;
        }

        activity.scoreOverview = _.get(activity, ["data", "reprolib:terms/scoreOverview", 0, "@value"], "");
        activity.compute = _.get(activity, ["data", "reprolib:terms/compute"], []).map((itemCompute) => ({
          jsExpression: _.get(itemCompute, ["reprolib:terms/jsExpression", 0, "@value"]),
          variableName: _.get(itemCompute, ["reprolib:terms/variableName", 0, "@value"]),
          description: _.get(itemCompute, ["schema:description", 0, "@value"]),
          direction: _.get(itemCompute, ["reprolib:terms/direction", 0, "@value"], true),
        }));
        activity.messages = _.get(activity, ["data", "reprolib:terms/messages"], []).map((itemMessage) => ({
          jsExpression: _.get(itemMessage, ["reprolib:terms/jsExpression", 0, "@value"]),
          message: _.get(itemMessage, ["reprolib:terms/message", 0, "@value"]),
          outputType: _.get(itemMessage, ["reprolib:terms/outputType", 0, "@value"]),
        }));

        let scores = [],
          maxScores = [];

        let lastResponseIndex = activity.responses.length - 1;

        if (this.applySecretIdSelector) {
          while (lastResponseIndex >= 0) {
            if (this.secretIds.includes(activity.responses[lastResponseIndex].secretId)) {
              break;
            }

            lastResponseIndex--;
          }
        }

        if (lastResponseIndex < 0) {
          continue;
        }

        const rawResponses = activity.items.map(
          item => item.rawResponses.find(resp => resp.responseId == activity.responses[lastResponseIndex].responseId)
        );

        for (let i = 0; i < activity.items.length; i++) {
          const { variableName, responses } = activity.items[i];
          try {
            if (!variableName && !responses) continue;

            let score = getScoreFromResponse(
              activity.items[i],
              responses[lastResponseIndex][variableName]
                ? responses[lastResponseIndex][variableName]
                : responses[lastResponseIndex]
            );
            scores.push(score);
            maxScores.push(getMaxScore(activity.items[i]));
          } catch (error) {
            console.log("ERR: ", error);
          }
        }

        const cumulativeScores = activity.compute.reduce(
          (accumulator, itemCompute) => ({
            ...accumulator,
            [itemCompute.variableName.trim().replace(/\s/g, "__")]: evaluateScore(
              itemCompute.jsExpression,
              activity.items,
              scores
            ),
          }),
          {}
        );

        const cumulativeMaxScores = activity.compute.reduce(
          (accumulator, itemCompute) => ({
            ...accumulator,
            [itemCompute.variableName.trim().replace(/\s/g, "__")]: evaluateScore(
              itemCompute.jsExpression,
              activity.items,
              maxScores
            ),
          }),
          {}
        );

        const reportMessages = [];
        let cumActivities = [];
        activity.messages.forEach((msg) => {
          const { jsExpression, message, outputType, nextActivity } = msg;

          const exprArr = jsExpression.split(/[><]/g);
          const variableName = exprArr[0];
          const exprValue = parseFloat(exprArr[1].split(" ")[1]);
          const category = variableName.trim().replace(/\s/g, "__");

          let expr, key;
          try {
            expr = parser.parse(category + jsExpression.substr(variableName.length));
          } catch (error) {
            if (category.match(/[&\/\\#,+()$~%.'":*?<>{}]/g)) {
              key = category.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
              expr = parser.parse(key + jsExpression.substr(variableName.length));
            }
          }

          const variableScores = {
            [key ? key : category]:
              outputType == "percentage"
                ? Math.round(
                    cumulativeMaxScores[category] ? (cumulativeScores[category] * 100) / cumulativeMaxScores[category] : 0
                  )
                : cumulativeScores[category],
          };
          try {
            if (expr.evaluate(variableScores)) {
              if (nextActivity) cumActivities.push(nextActivity);

              const compute = activity.compute.find(
                (itemCompute) => itemCompute.variableName.trim() == variableName.trim()
              );

              reportMessages.push({
                category,
                message: replaceItemVariableWithName(message, activity.items, rawResponses),
                score: variableScores[key ? key : category] + (outputType == "percentage" ? "%" : ""),
                compute: {
                  ...compute,
                  description: replaceItemVariableWithName(compute.description, activity.items, rawResponses)
                },
                jsExpression: jsExpression.substr(variableName.length),
                scoreValue: cumulativeScores[category],
                maxScoreValue: cumulativeMaxScores[category],
                exprValue: outputType == "percentage" ? (exprValue * cumulativeMaxScores[category]) / 100 : exprValue,
              });
            }
          } catch (error) {
            console.log("ERR: ", error);          }
        });
        activityResponses.push({
          activity,
          reportMessages,
          scoreOverview: replaceItemVariableWithName(activity.scoreOverview, activity.items, rawResponses)
        });
      }

      return activityResponses;
    },

    splashScreenType (activity) {
      const isSplashScreen = activity.splash && activity.splash.en;
      let type = "";

      if (isSplashScreen) {
        const uri = activity.splash.en;
        const mimeType = Mimoza.getMimeType(uri) || "";

        if (mimeType.startsWith("video/")) {
          type = "video";
        } else {
          type = "image";
        }
      }
      return type;
    },
  },
};
</script>
