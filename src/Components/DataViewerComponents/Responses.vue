<template>
  <div
    class="responses"
  >
    <h2> {{ activityName }} </h2>

    <div>
      <div
        v-for="item in items"
        :key="item.slug"
        class="item"
      >
        <h3> - {{ item.getQuizWithoutImage() }} </h3>

        <div
          class="item-response"
        >
          <div
            v-if="item.inputType == 'radio' && item.isMultipleChoice"
          >
            <v-checkbox
              v-for="choice in item.responseOptions"
              :key="choice.id"
              :input-value="item.response && item.response[choice.id] !== undefined"
              :label="choice.name.en"
              hide-details
              disabled
            ></v-checkbox>
          </div>

          <div
            v-if="item.inputType == 'radio' && !item.isMultipleChoice"
          >
              <v-radio-group
                :value="item.value"
                disabled
                hide-details
              >
                <v-radio
                  v-for="choice in item.responseOptions"
                  :key="choice.id"
                  :value="choice.id"
                  :label="choice.name.en"
                ></v-radio>
              </v-radio-group>
          </div>

          <div
            v-else-if="item.inputType == 'slider'"
          >
            <v-slider
              :value="item.value"
              :tick-labels="item.responseOptions.map(option => option.name.en)"
              :max="item.responseOptions.length"
              :min="1"
              disabled
            ></v-slider>
          </div>

          <div
            v-else-if="item.inputType == 'date'"
          >
            {{
              item.response && item.response.value &&
                `${item.response.value.year} - ${item.response.value.month} - ${item.response.value.day}`
            }}
          </div>

          <div
            v-else-if="item.inputType == 'text'"
          >
            {{ item.response && item.response.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  text-align: center;
}
.responses {
  padding: 20px 10px;
}

.item {
  margin: 10px 0px;
}

.item-response {
  padding: 10px 20px;
}

.item-response .option {
  margin-right: 10px;
}

</style>

<script>
export default {
  props: {
    activity: {
      type: Object,
      required: true
    },
    responseId: {
      type: String,
      required: true
    }
  },
  data() {
    const items = (this.activity.items || []).map(item => {
      const response = item.responses.find(response => response.responseId == this.responseId)

      let value = 0;
      if ( response && (item.inputType == 'radio' && !item.isMultipleChoice || item.inputType == 'slider')) {
        for (const choice of item.responseOptions) {
          if (response[choice.id] !== undefined) {
            value = choice;
          }
        }

        if (value) {
          value = item.inputType == 'radio' ? value.id : item.responseOptions.indexOf(value) + 1;
        }
      }

      return {
        ...item,
        response,
        value,
        getQuizWithoutImage: item.getQuizWithoutImage.bind(item),
      }
    })

    return {
      items
    }
  },
  computed: {
    activityName() {
      return this.activity.label && this.activity.label.en;
    }
  }
}
</script>
