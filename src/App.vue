<template>
  <v-app>
    <v-stepper
      v-model="e1"
      style="overflow: auto; height: calc(100% - 48px);"
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

      <v-stepper-items class="bg bog">
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
      >
        Prev
      </v-btn>
      <v-flex>
        <v-flex style="text-align: right;">
          <v-btn
            v-if="e1 < steps.length"
            color="primary"
            :disabled="!readyToContinue"
            @click="next"
          >
            Continue
          </v-btn>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-app>
</template>

<style>

.primary {
    background-color: #005fa3 !important;
    border-color: #005fa3 !important;
}

.bg {
    z-index: 0;
    min-height: calc(100% - 72px);
    border-top-style: solid;
    border-top-width: 1px;
    border-top-color: #e1e1e1;
}

.bog {
    background-color: #ffffff;
    background-image: url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80), -moz-linear-gradient(0deg, rgba(255, 255, 255, 0.5) 5%, rgba(255, 255, 255, 1)), url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80);
    background-image: url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80), -webkit-linear-gradient(0deg, rgba(255, 255, 255, 0.5) 5%, rgba(255, 255, 255, 1)), url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80);
    background-image: url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80), -ms-linear-gradient(0deg, rgba(255, 255, 255, 0.5) 5%, rgba(255, 255, 255, 1)), url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80);
    background-image: url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80), linear-gradient(0deg, rgba(255, 255, 255, 0.5) 5%, rgba(255, 255, 255, 1)), url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80);
    background-repeat: no-repeat,	no-repeat,	no-repeat, no-repeat;
    background-size: 0px 0px, cover,	cover;
    background-position: top left,	center center, bottom center;
    background-attachment: fixed,	fixed,	fixed;
}
</style>


<script>
import store from './State/state';
import SetBackend from './Steps/SetBackend';
import Login from './Steps/Login';
import SetApplet from './Steps/SetApplet';
// import SetGroups from './Steps/SetGroups';
import SetUsers from './Steps/SetUsers';
// import SetReviewers from './Steps/SetReviewers';
import SetSchedule from './Steps/SetSchedule';

export default {

  name: 'App',

  store,

  components: {

  },

  data: () => ({
    /**
     * e1 is the variable for our step counter
     */
    e1: 1,
    /**
     * flag for when the component is mounted.
     */
    ready: false,
    /**
     * the set of components to render in order
     * for the stepper component.
     */
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

      // {
      //   name: 'groups',
      //   component: SetGroups
      // },
      {
        name: 'users',
        component: SetUsers,
      },
      {
        name: 'schedule',
        component: SetSchedule,
      },
      // {
      //   name: 'reviewers',
      //   component: SetReviewers,
      // }
    ],
  }),

  computed: {
    /**
     * Select the component to display based on the step
     * value of the stepper component
     */
    currentComponent() {
      if (this.ready) {
        return this.steps[this.e1 - 1].name, this.$refs[this.steps[this.e1 - 1].name][0];
      }
    },
    /**
     * return the current component's `readyToContinue` function.
     * each component has its own logic for determining whether
     * the user can move out of that screen.
     */
    readyToContinue() {
      if (this.ready) {
        return this.currentComponent.readyToContinue;
      }
      return true;
    },
  },
  /**
   * set a flag when the componentis mounted
   */
  mounted()
  {
    this.ready = true;
  },

  methods: {
    /**
     * method to increment the step counter.
     * it runs the component's continueAction before incrementing.
     */
    next() {
      this.currentComponent.continueAction();
      this.e1 += 1;
    }
  }
}
</script>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,400');
</style>

<style>

body, html, #app, #dayspan {
  font-family: 'IBM Plex Sans', sans-serif !important;
  width: 100%;
  height: 100%;
}

.v-btn--flat,
.v-text-field--solo .v-input__slot {
  background-color: #f5f5f5 !important;
  margin-bottom: 8px !important;
}

</style>
