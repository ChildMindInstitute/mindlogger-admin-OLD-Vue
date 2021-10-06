<template>
  <div>
    <div class="screen-list">
      <template
        v-for="(item, index) in items"
      >
        <v-card
          v-if="(item.inputType == 'radio' || item.inputType == 'slider') && index <= currentScreen"
          class="screen"
          :key="item.slug"
        >
          <v-card-title>
            <div class="question text-center">
              <div>
                <img :src="item.getQuestionImage()" />
              </div>
              <markdown :source="item.getQuizWithoutImage()"></markdown>
            </div>
          </v-card-title>

          <div
            class="content"
          >
            <Radio
              v-if="item.inputType == 'radio' && !item.isMultipleChoice"
              v-model="responses[index]"
              :item="activity.items[index]"
              :disabled="index != currentScreen"
            />

            <Slider
              v-if="item.inputType == 'slider'"
              v-model="responses[index]"
              :item="activity.items[index]"
              :disabled="index != currentScreen"
            />

            <Checkbox
              v-if="item.inputType == 'radio' && item.isMultipleChoice"
              v-model="responses[index]"
              :item="activity.items[index]"
              :disabled="index != currentScreen"
            />
          </div>

          <v-card-actions
            v-if="index == currentScreen"
          >
            <v-btn
              v-if="!isFirstScreen"
              @click="onBack"
              color="primary"
              rounded
              outlined
            >
              Back
            </v-btn>

            <v-spacer />

            <v-btn
              @click="onNext"
              color="primary"
              :disabled="
                !activity.items[index].isSkippable &&
                (responses[index].value === null || Array.isArray(responses[index].value) && !responses[index].value.length)
              "
              rounded
            >
              {{ isLastScreen ? 'Submit' : 'Next' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </div>

    <ConfirmationDialog
      v-model="responseSubmitDialog"
      :dialogText="$t('responseSubmitConfirmation')"
      :title="$t('responseSubmit')"
      @onOK="$emit('submit', responses)"
    />
  </div>
</template>

<style scoped>
.screen-list {
  display: flex;
  flex-direction: column-reverse;
}

.screen {
  margin: 10px;
}

.question {
  justify-content: center;
  padding-bottom: 0px;
  width: 100%;
}

.question img {
  max-width: 200px;
  margin: auto;
}

.screen .content {
  padding: 5px 20px;
}
</style>

<script>
import Checkbox from "./Checkbox";
import Radio from "./Radio";
import Slider from "./Slider";
import Markdown from "../Utils/Markdown";
import ConfirmationDialog from "../Utils/dialogs/ConfirmationDialog";
import { Parser } from "expr-eval";

export default {
  props: {
    activity: {
      type: Object,
      required: true
    },
    responseHistory: {
      type: Array,
      required: true
    }
  },

  components: {
    Checkbox,
    Radio,
    Slider,
    ConfirmationDialog,
    Markdown,
  },

  data() {
    const responses = this.responseHistory.map(resp => ({
      ...resp,
      edited: null
    }));
    const itemCount = this.activity.items.length;

    while (responses.length < itemCount) {
      const response = { value: null }

      if (this.responseHistory.length) {
        response.edited = null
      }

      responses.push(response)
    }

    return {
      responses,
      itemCount,
      currentScreen: 0,
      responseSubmitDialog: false,
    }
  },
  computed: {
    items() {
      return this.activity.items;
    },

    isLastScreen() {
      return this.currentScreen == this.itemCount - 1
    },
    isFirstScreen() {
      return this.currentScreen == 0;
    }
  },
  methods: {
    isVisible (item) {
      const addProperty = this.activity.addProperties.find(
        addProperty => item.id == addProperty.variableName
      )

      if (addProperty) {
        return this.testVisibility(
          addProperty.isVis, this.activity.items, this.responses
        )
      }

      return true;
    },

    onNext () {
      if (this.currentScreen == this.itemCount-1) {
        this.responseSubmitDialog = true
      } else {
        for (let i = this.currentScreen + 1; i < this.itemCount; i++) {
          if (this.isVisible(this.activity.items[i])) {
            this.currentScreen = i;
            return ;
          }
        }

        this.responseSubmitDialog = true
      }
    },

    onBack () {
      for (let i = this.currentScreen - 1; i >= 0; i--) {
       if (this.isVisible(this.activity.items[i])) {
         this.currentScreen = i;
         return
       }
      }

      this.currentScreen--;
    },

    testVisibility (testExpression = true, items = [], responses = []) {
      // Short circuit for common testExpression
      if (testExpression === true || testExpression === 'true') {
        return true;
      }

      const parser = new Parser({
        logical: true,
        comparison: true,
      });

      let testExpressionFixed = testExpression.replace(/&&/g, ' and ')
                                  .replace(/\|\|/g, ' or ')
                                  .replace('===', '==')
                                  .replace('!==', '!=')
                                  .replace(/(\w+\.)/g, 'arrayIncludes($&')
                                  .replace(/.includes\(/g, ', ')

      // Custom function to test if element is present in array
      const arrayIncludes = (array, element) => {
        if (array === undefined || array === null) {
          return false;
        }
        for (let i = 0; i < array.length; i += 1) {
          if (array[i] === element) {
            return true;
          }
        }
        return false;
      };

      parser.functions.arrayIncludes = arrayIncludes;

      try {
        const expr = parser.parse(testExpressionFixed);
        // Build an object where the keys are item variableNames, and values are
        // item responses
        const inputs = items.reduce((acc, item, index) => {
          const response = (responses[index] && (responses[index].value || responses[index].value === 0))
            ? responses[index].value
            : responses[index];

          return {
            ...acc,
            [item.id]: responses[index] === 0 ? 0 : (response === 0 ? 0 : response || null), // cast undefined to null
          }
        }, {});

        // Run the expression
        const result = expr.evaluate(inputs);
        return !!result; // Cast the result to true or false
      } catch (error) {
        return true; // Default to true if we can't parse the expression
      }
    }

  }
}
</script>
