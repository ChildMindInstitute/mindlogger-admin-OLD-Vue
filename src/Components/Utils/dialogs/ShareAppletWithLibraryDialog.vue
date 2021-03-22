<template>
  <v-dialog
    max-width="800px"
    :value="value"
    persistent
  >
    <v-card>
      <v-card-title>
        <v-container fluid class="d-flex pa-0">
          <div class="mr-5">
            <template v-if="!isShared">
              <div class="title">
                {{ $t('shareAppletLibraryTitle', { appletName: appletData.name }) }}
              </div>
              <div class="sub-title">
                {{ $t('shareAppletLibraryContent') }}
              </div>
            </template>
            <template v-else-if="isDuplicate">
              <div class="title">
                {{ $t('shareAppletNameDuplicate') }}
              </div>
            </template>
            <template v-else>
              <div class="title">
                {{ $t('shareAppletSetDetails', { appletName: appletData.name }) }}
              </div>
              <div class="sub-title">
                {{ $t('shareAppletCopyLink') }}
              </div>
            </template>
          </div>
          <div class="ml-auto text-right">
            <v-btn
              color="secondary"
              icon
              @click="$emit('close')"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-switch
              v-model="isShared"
              color="success"
              inset />
          </div>
        </v-container>
      </v-card-title>
      <v-card-text v-if="isShared" class="pt-0">
        <template v-if="isDuplicate">
          <v-container fluid class="py-0">
            <v-text-field
              label="New Name:"
              v-model="appletName"
              :hint="$t('newNameNote')"
              persistent-hint
              :error="isError"
              :error-messages="isError ? $t('tryAgain') : ''"
            >
            </v-text-field>
            <div class="text-right">
              <v-btn
                color="primary"
                @click="onUpdateAppletName"
              >
                Update
              </v-btn>
            </div>
          </v-container>
        </template>
        <template v-else>
          <v-container fluid class="d-flex py-0">
            <v-container fluid class="mr-5 pa-0">
              <v-row align="center">
                <v-col md="3" class="text-right">
                  Category:
                </v-col>
                <v-col md="9">
                  <template v-if="isEditing">
                    <v-select
                      label="Category:"
                      :items="categories"
                      v-model="category"
                      dense
                      solo
                      hide-details
                    />
                  </template>
                  <template v-else>
                    {{ category }}
                  </template>
                </v-col>
              </v-row>
              <v-row align="center">
                <v-col md="3" class="text-right">
                  Sub-Category:
                </v-col>
                <v-col md="9" class="">
                  <template v-if="isEditing">
                    <v-select
                      label="Sub-Category:"
                      :items="subCategories"
                      v-model="subCategory"
                      dense
                      solo
                      hide-details
                    />
                  </template>
                  <template v-else>
                    {{ subCategory }}
                  </template>
                </v-col>
              </v-row>
              <v-row align="center">
                <v-col md="3" class="text-right">
                  Keywords:
                </v-col>
                <v-col md="9">
                  <template v-if="isEditing">
                    <v-combobox
                      label="Keywords:"
                      :items="keywordsList"
                      v-model="keywords"
                      clearable
                      multiple
                      small-chips
                      dense
                      solo
                      hide-details
                    />
                  </template>
                  <template v-else>
                    {{ keywords.join(', ') }}
                  </template>
                </v-col>
              </v-row>
            </v-container>
            <div class="ml-auto pb-5 d-flex text-right">
              <template v-if="!isPublished">
                <v-btn
                  class="align-self-end"
                  color="primary"
                  @click="onPublishApplet"
                >
                  Publish
                </v-btn>
              </template>
              <template v-else-if="!isEditing">
                <v-btn
                  color="secondary"
                  icon
                  tile
                  x-large
                  @click="isEditing = true"
                >
                  <v-icon>
                    mdi-square-edit-outline
                  </v-icon>
                </v-btn>
              </template>
              <template v-else>
                <v-btn
                  class="align-self-end"
                  color="primary"
                  @click="onUpdateAppletDetails"
                >
                  Update
                </v-btn>
              </template>
            </div>
          </v-container>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>

</template>

<script>
export default {
  name: 'ShareAppletWithLibraryDialog',
  props: {
    appletData: {
      type: Object,
      required: true,
    },
    value: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({
    isShared: false,
    isDuplicate: true,
    appletName: '',
    isError: false,
    isPublished: false,
    isEditing: true,
    categories: ['Mental Health', 'Option1'],
    category: '',
    subCategory: '',
    subCategories: ['ADHD', 'Option1'],
    keywordsList: ['ADHD', 'learning disabilities'],
    keywords: [],
  }),
  methods: {
    onUpdateAppletName() {
      this.isDuplicate = false;
    },
    onPublishApplet() {
      this.isPublished = true;
      this.isEditing = false;
    },
    onUpdateAppletDetails() {
      this.isEditing = false;
    }
  }
};
</script>
