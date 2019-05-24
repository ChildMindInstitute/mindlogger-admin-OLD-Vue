<template>
  <v-app>
  <v-stepper v-model="e1" style="overflow: scroll;">
    <v-stepper-header>
      <v-stepper-step 
      v-for="(step, index) in steps"
      :key="`step_tab_${index}`"
      :complete="e1 > index" :step="index+1">
      {{step.name}}
      </v-stepper-step>
      
    </v-stepper-header>

    <v-stepper-items>

      <v-stepper-content v-for="(step, index) in steps" :step="index+1"
       :key="`step_content_${index}`">
        <component v-bind:is="step.component" />
      </v-stepper-content>

    </v-stepper-items>

  </v-stepper>

  <v-layout row wrap>
    <v-btn flat v-if="e1 > 1" @click="e1 -= 1">Prev</v-btn>
    <v-flex></v-flex>
    <v-flex></v-flex>
    <v-flex>

    <v-flex style="text-align: right;">
      <v-btn
      color="primary"
      @click="e1 += 1"
      v-if="e1 < steps.length"
      >
      Continue
      </v-btn>
    </v-flex>
    </v-flex>
  </v-layout>

       

  </v-app>
</template>

<script>
import SetBackend from './Steps/SetBackend';
import Login from './Steps/Login';
import SetApplet from './Steps/SetApplet';
import SetGroups from './Steps/SetGroups';
import SetUsers from './Steps/SetReviewers';
import SetReviewers from './Steps/SetReviewers';
import SetSchedule from './Steps/SetSchedule';

export default {

  name: 'app',

  components: {

  },

  data: () => ({
    e1: 0,
    steps: [
      {
        name: 'backend',
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
        name: 'schedule',
        component: SetSchedule,
      },
      {
        name: 'groups',
        component: SetGroups
      },
      {
        name: 'users',
        component: SetUsers,
      },
      {
        name: 'reviewers',
        component: SetReviewers,
      }
    ],
  }),

  mounted()
  {

  },

  methods: {

  }
}
</script>

<style>

body, html, #app, #dayspan {
  font-family: Roboto, sans-serif !important;
  width: 100%;
  height: 100%;
}

.v-btn--flat,
.v-text-field--solo .v-input__slot {
  background-color: #f5f5f5 !important;
  margin-bottom: 8px !important;
}

</style>
