<template>
  <div class="screen-list">
    <template
      v-for="(item, index) in items"
    >
      <v-card
        v-if="(item.inputType == 'radio' || item.inputType == 'slider') && index <= currentScreen"
        class="screen"
        :key="item.slug"
      >
        <v-card-title class="question">
          {{ item.question.en }}
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
            rounded
          >
            {{ isLastScreen ? 'Submit' : 'Next' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
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
}

.screen .content {
  padding: 5px 20px;
}
</style>

<script>
import Checkbox from "./Checkbox";
import Radio from "./Radio";
import Slider from "./Slider";

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
    Slider
  },

  data() {
    const responses = this.responseHistory.map(resp => resp);
    const itemCount = this.activity.items.length;

    while (responses.length < itemCount) {
      responses.push({
        value: null,
        edited: null
      });
    }

    return {
      responses,
      itemCount,
      currentScreen: 0
    }
  },
  computed: {
    items() {
      return this.activity.items;
    },

    isLastScreen() {
      return this.currentScreen == this.items.length-1
    },
    isFirstScreen() {
      return this.currentScreen == 0;
    },
    nextEnabled() {
      return true;
    }
  },
  methods: {
    onNext() {
      if (this.currentScreen == this.items.length-1) {
        console.log('submit response ... ');
      } else {
        this.currentScreen++;
      }
    },
    onBack() {
      this.currentScreen--;
    }
  }
}
</script>
