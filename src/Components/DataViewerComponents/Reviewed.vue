<template>
  <v-expansion-panels
    v-model="selected"
    multiple
    focusable
  >
    <v-expansion-panel
      v-for="(review, index) in reviews"
      :key="index"
    >
      <v-expansion-panel-header>
        {{ review.profile.firstName }} {{ review.profile.lastName }}
      </v-expansion-panel-header>

      <v-expansion-panel-content>
        <div
          v-for="(item, index) in activity.items"
          :key="item.slug"
          class="item"
        >
          <h3> - {{ item.getQuizWithoutImage() }} {{ review.data[index].edited ? '( edited )' : '' }} </h3>

          <div class="title">
            <Radio
              v-if="item.inputType == 'radio' && !item.isMultipleChoice"
              v-model="review.data[index]"
              :item="item"
              disabled
            />

            <Checkbox
              v-if="item.inputType == 'radio' && item.isMultipleChoice"
              v-model="review.data[index]"
              :item="item"
              disabled
            />

            <Slider
              v-if="item.inputType == 'slider'"
              v-model="review.data[index]"
              :item="item"
              disabled
            />
          </div>
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<style scoped>
.item {
  margin: 10px 0px;
}

.item .title {
  margin: 0px 10px;
}
</style>

<script>
import Checkbox from "../ReviewerAssessment/Checkbox";
import Radio from "../ReviewerAssessment/Radio";
import Slider from "../ReviewerAssessment/Slider";

export default {

  components: {
    Checkbox,
    Radio,
    Slider,
  },
  props: {
    activity: {
      type: Object,
      required: true
    },
    reviews: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      selected: []
    }
  }
}
</script>
