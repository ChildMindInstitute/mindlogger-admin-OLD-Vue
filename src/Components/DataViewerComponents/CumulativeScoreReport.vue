<template>
  <div class="cumulative-score-report">
    <div v-for="activity in activities" :key="activity.id">
      <p class="text-decoration-underline font-weight-bold mb-4">
        {{ activity.id }} Report
      </p>
      <p class="text-body-2 mb-4">
        {{ activity.scoreOverview }}
      </p>
      <div v-for="report in activity.reports" :key="report.name" class="my-4">
        <p class="blue--text font-weight-bold mb-1">
          {{ report.name }}
        </p>
        <p class="text-body-2 mb-4">
          {{ report.description }}
        </p>
        <img src="@/assets/score_bar.png" class="score-bar" />
        <div v-for="(item, index) in report.messages" :key="index">
          <p class="text-uppercase font-weight-bold font-italic mb-1">
            If score
            <span class="ml-2">{{ item.jsExpression }}</span>
          </p>
          <p class="text-body-2 mb-4">
            <vue-markdown>{{ item.message }}</vue-markdown>
          </p>
        </div>
        <p class="text-body-2 mb-4">
          {{ additionalText }}
        </p>
        <p class="text-body-2 mb-4">
          Helpful Resources:
        </p>
        <div
          v-for="(resource, index) in resources"
          :key="resource.text + index"
        >
          <a :href="resource.link">
            {{ resource.text }}
          </a>
        </div>
      </div>
    </div>
    <p>
      {{ termsText }}
    </p>
    <p>
      {{ footerText }}
    </p>
  </div>
</template>

<style scoped>
  @media all {
    .page-break {
      display: none;
    }
  }

  @media print {
    .page-break {
      display: block;
      page-break-before: always;
    }
  }

  .cumulative-score-report {
    width: 500px;
  }
  div, p {
    font-size: 0.8rem;
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
    font-size: 0.7rem;
  }
  .blue--text {
    color: #2196f3;
  }
  .my-4 {
    margin-top: 1em;
    margin-bottom: 1em;
  }
  .mb-4 {
    margin-bottom: 1em;
  }
  .mb-1 {
    margin-bottom: 0.25em;
  }
  .ml-2 {
    margin-left: 0.5em;
  }
  .score-bar {
    width: 300px;
  }
</style>

<script>
import { Parser } from "expr-eval";
import { getMaxScore, evaluateScore } from "../Utils/scoring";
import VueMarkdown from "vue-markdown";

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
  data: () => ({
    resources: [
      {
        text: "Teen Suicides: What Are the Warning Signs?",
        link: "https://google.com",
      },
      {
        text: "Taking a Child to the Emergency Room",
        link: "https://google.com",
      },
      {
        text: "Signs a Child Might Be Suicidal",
        link: "/",
      },
    ],
    additionalText:
      "If not currently being addressed, high scores on this scale may signal the need for further clinical evaluation and attention depending on the level of difficulties encountered in the home, work, or social environments.",
    termsText:
      "I understand that the information provided by this questionnaire is not intended to replace the advice, diagnosis, or treatment offered by a medical or mental health professional, and that my anonymous responses may be used and shared for general research on children’s mental health.",
    footerText:
      "CHILD MIND INSTITUTE, INC. AND CHILD MIND MEDICAL PRACTICE, PLLC (TOGETHER, “CMI”) DOES NOT DIRECTLY OR INDIRECTLY PRACTICE MEDICINE OR DISPENSE MEDICAL ADVICE AS PART OF THIS QUESTIONNAIRE. CMI ASSUMES NO LIABILITY FOR ANY DIAGNOSIS, TREATMENT, DECISION MADE, OR ACTION TAKEN IN RELIANCE UPON INFORMATION PROVIDED BY THIS QUESTIONNAIRE, AND ASSUMES NO RESPONSIBILITY FOR YOUR USE OF THIS QUESTIONNAIRE.",
  }),
  beforeMount() {
    const parser = new Parser({
      logical: true,
      comparison: true,
    });

    for (const activity of this.activities) {
      const maxScores = (activity.items || []).map((item) => getMaxScore(item));

      activity.scoreOverview = _.get(activity.data, ["reprolib:terms/scoreOverview", 0, "@value"], "");

      activity.reports = activity.data["reprolib:terms/compute"].map((itemCompute) => {
        const computeName = _.get(itemCompute, ["reprolib:terms/variableName", 0, "@value"]).trim();
        const messages = []
        activity.data["reprolib:terms/messages"].map((itemMessage) => {
          const jsExpression = _.get(itemMessage, ["reprolib:terms/jsExpression", 0, "@value"]);
          const variableName = jsExpression.split(/[><]/g)[0];
          if (variableName.trim() == computeName) {
            messages.push({
              jsExpression: jsExpression.substr(variableName.length),
              message: _.get(itemMessage, ["reprolib:terms/message", 0, "@value"]),
              outputType: _.get(itemMessage, ["reprolib:terms/outputType", 0, "@value"]),
            });
          }
        })
        return {
          name: computeName,
          description: _.get(itemCompute, ["reprolib:terms/description", 0, "@value"]),
          direction: _.get(itemCompute, ["reprolib:terms/direction", 0, "@value"], true),
          cumulativeMaxScore: evaluateScore(itemCompute.jsExpression, activity.items, maxScores),
          messages,
        }
      });
    }
  },
};
</script>
