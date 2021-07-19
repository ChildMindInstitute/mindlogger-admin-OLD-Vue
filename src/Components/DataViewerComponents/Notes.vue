<template>
  <div>
    <div class="comments">
      <v-card
        v-for="note in notes"
        class="my-2"
        :key="note._id"
      >
        <v-card-text>
          <div
            @mouseover="note.hover = true"
            @mouseleave="note.hover = false"
          >
            {{ note.reviewerName }} added a comment - {{ note.hover ? note.datetime  : note.ago }}
          </div>
          <div class="my-1">
            <v-textarea
              v-model="note.note"
              :rows="note.open ? 4 : 2"
              :disabled="!note.my_note"
              :readonly="!note.open"
              hide-details
            >
            </v-textarea>
          </div>
        </v-card-text>

        <v-card-actions
          v-if="note.my_note"
        >
          <v-spacer />

          <v-btn
            v-if="!note.open"
            icon
            @click="note.open=true"
          >
            <v-icon
              color="grey lighten-1"
            >
              mdi-square-edit-outline
            </v-icon>
          </v-btn>

          <v-btn
            v-else
            icon
            @click="updateNote(note)"
          >
            <v-icon
              color="grey lighten-1"
            >
              mdi-content-save
            </v-icon>
          </v-btn>

          <v-btn
            v-if="!note.open"
            icon
            @click="deleteNote(note)"
          >
            <v-icon color="grey lighten-1">
              mdi-delete
            </v-icon>
          </v-btn>
          <v-btn
            v-else
            icon
            @click="note.open=false, note.note=note.current"
          >
            <v-icon color="grey lighten-1">
              mdi-cancel
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <div class="new-comment my-2">
      <v-textarea
        v-model="comment"
        solo
        label="Add a comment"
        hide-details
      ></v-textarea>

      <div class="actions">
        <v-btn
          class="mt-2"
          color="primary"
          @click="addComment"
        >
          Save
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.new-comment .actions {
  text-align: right;
}
</style>

<script>
import api from '../Utils/api/api';
import { AppletMixin } from '../Utils/mixins/AppletMixin';
import TimeAgo from 'javascript-time-ago';

import en from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/fr';
import * as moment from "moment-timezone";

TimeAgo.addLocale(en);
TimeAgo.addLocale(fr);

export default {
  mixins: [AppletMixin],
  props: {
    responseId: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      notes: [],
      comment: '',
      timeAgo: new TimeAgo(this.$i18n.locale.replace('_', '-'))
    }
  },

  mounted() {
    if (this.responseId) {
      api.getNotes(this.apiHost, this.token, this.currentAppletMeta.id, this.responseId).then(resp => {
        for (let note of resp.data) {
          this.notes.push(this.getNoteData(note));
        }
      });
    }
  },

  computed: {

  },

  methods: {
    getNoteData(note) {
      let name = note.reviewer.firstName;

      if (note.reviewer.lastName && note.reviewer.lastName != name) {
        name = name + ' ' + note.reviewer.lastName;
      }

      return {
        ...note,
        reviewerName: name,
        ago: this.timeAgo.format(new Date(note.created), 'round'),
        datetime: moment(new Date(note.created)).format("ddd, D MMM YYYY hh:mm:ss A"),
        current: note.note,
        open: false,
        hover: false,
      }
    },

    addComment() {
      api.addNote(this.apiHost, this.token, this.currentAppletMeta.id, this.responseId, this.comment).then(resp => {
        this.notes.unshift(this.getNoteData(resp.data));
        this.comment = '';
      })
    },

    deleteNote(note) {
      api.deleteNote(this.apiHost, this.token, this.currentAppletMeta.id, note._id).then(() => {
        const index = this.notes.findIndex(n => n._id == note._id);
        this.notes.splice(index, 1);
      });
    },

    updateNote(note) {
      api.updateNote(this.apiHost, this.token, this.currentAppletMeta.id, note._id, note.note).then((resp) => {
        const index = this.notes.findIndex(n => n._id == resp.data._id);

        this.$set(this.notes, index, this.getNoteData(resp.data));
      })
    }
  }
}
</script>
