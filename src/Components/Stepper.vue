<template>
  <div>
    <v-stepper
      v-model="e1"
      class="elevation-0"
    >
      <v-stepper-header>
        <v-stepper-step
          v-for="(step, index) in steps"
          :key="`step_tab_${index}`"
          :complete="e1 > index"
          :step="index+1"
        >
          {{ step.name }}
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content
          v-for="(step, index) in steps"
          :key="`step_content_${index}`"
          :step="index+1"
        >
          <component
            :is="step.component"
            :ref="step.name"
          />
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

    <v-layout
      row
      wrap
    >
      <v-btn
        v-if="e1 > 1"
        flat
        @click="e1 -= 1"
        fixed
        bottom
        left
      >
        Prev
      </v-btn>
      <v-flex>
        <v-flex style="text-align: right;">
          <v-btn
            v-if="e1 < steps.length"
            :disabled="!readyToContinue"
            @click="next"
            color="primary"
            fixed
            bottom
            right
          >
            Continue
          </v-btn>
          <v-btn
            v-else
            color="primary"
            :disabled="!readyToContinue"
            @click="save"
          >
            Save
          </v-btn>
        </v-flex>
      </v-flex>
    </v-layout>
  </div>
</template>


<script>
import store from '../State/state';
import SetBackend from '../Steps/SetBackend';
import Login from '../Steps/Login';
import SetApplet from '../Steps/SetApplet';
import SetUsers from '../Steps/SetUsers';
import SetSchedule from '../Steps/SetSchedule';

export default {

  name: 'Stepper',

  data: () => ({
    e1: 1,
    ready: false,
    steps: [
      {
        name: 'server',
        component: SetBackend,
      },
       {
        name: 'login',
        component: Login,
      },
      {
        name: 'applet',
        component: SetApplet,
      },
      {
        name: 'users',
        component: SetUsers,
      },
      {
        name: 'schedule',
        component: SetSchedule,
      },
    ],
  }),

  computed: {
    currentComponent() {
      return this.steps[this.e1 - 1].name, this.$refs[this.steps[this.e1 - 1].name][0];
    },
    readyToContinue() {
      if (this.ready) {
        return this.currentComponent.readyToContinue;
      }
      return true;
    },
  },
  mounted() {
    this.ready = true;
  },
  methods: {
    next() {
      this.currentComponent.continueAction();
      this.e1 += 1;
    },
    save() {
      this.currentComponent.continueAction();
    },
  },
}
</script>