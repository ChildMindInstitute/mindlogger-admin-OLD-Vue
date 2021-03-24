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
              <v-btn
                text
                class="copy-link"
                @click="onCopyLink"
              >
                {{ $t('shareAppletCopyLink') }}
              </v-btn>
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
              v-model="share"
              @change="onSwitchShare"
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
                @click="onChangeAppletName"
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
                      item-text="name"
                      item-value="_id"
                      v-model="category"
                      dense
                      solo
                      hide-details
                      @change="onChangeCategory"
                    />
                  </template>
                  <template v-else>
                    {{ categoryName }}
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
                      item-text="name"
                      item-value="_id"
                      v-model="subCategory"
                      dense
                      solo
                      hide-details
                    />
                  </template>
                  <template v-else>
                    {{ subCategoryName }}
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
                  @click="onUpdateAppletDetails"
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

<style scoped>
  .data-filter {
    width: 25%;
    padding-left: 5px;
  }
</style>

<script>
import { AppletLibraryMixin } from '@/Components/Utils/mixins/AppletLibraryMixin';

export default {
  name: 'ShareAppletWithLibraryDialog',
  mixins: [AppletLibraryMixin],
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
    share: false,
    isShared: false,
    isDuplicate: false,
    appletName: '',
    isError: false,
    isPublished: false,
    isEditing: true,
    appletUrl: '',
    libraryCategories: [],
    categories: [],
    category: null,
    subCategories: [],
    subCategory: null,
    keywords: [],
  }),
  computed: {
    categoryName() {
      return this.category ? this.categories.find(c => c._id == this.category).name : '';
    },
    subCategoryName() {
      return this.subCategory ? this.subCategories.find(c => c._id == this.subCategory).name : '';
    },
  },
  mounted() {
    this.getLibraryCategories()
      .then(res => {
        this.libraryCategories = [...res];
        this.categories = this.libraryCategories.filter(c => c.parentId == null);
        this.category = null;
        this.subCategories = [];
        this.subCategory = null;
      })
  },
  methods: {
    onSwitchShare(val) {
      if (val) {
        this.onCheckAppletName();
      } else {
        this.isShared = false;
      }
    },
    async onCheckAppletName() {
      this.isDuplicate = !(await this.checkAppletNameInLibrary(this.appletData));
      try {
        const { url } = await this.publishAppletToLibrary(this.appletData.id, true);
        this.appletUrl = url;
        this.isShared = true;
      } catch (e) {
      }
    },
    async onChangeAppletName() {
      this.isError = false;
      try {
        const response = await this.changeAppletName(this.appletData, this.appletName);
        this.isDuplicate = false;
      } catch (e) {
        this.isError = true;
      }
    },
    onCopyLink() {
    },
    onChangeCategory() {
      this.subCategories = this.libraryCategories.filter(c => c.parentId == this.category);
      this.subCategory = null;
    },
    async onUpdateAppletDetails() {
      const { id: appletId } = this.appletData;
      try {
        const response = await this.updateAppletSearchTerms(appletId, this.category, this.subCategory, this.keywords);
        this.isPublished = true;
        this.isEditing = false;
      } catch (e) {
      }
    }
  }
};
</script>
