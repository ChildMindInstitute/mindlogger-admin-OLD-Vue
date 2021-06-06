<template>
  <v-dialog max-width="800px" :value="value" persistent>
    <v-card>
      <v-card-title>
        <v-container fluid class="d-flex pa-0">
          <div class="mr-5">
            <template v-if="!share">
              <div class="title">
                {{
                  $t("shareAppletLibraryTitle", { appletName: appletData.name })
                }}
              </div>
              <div class="sub-title">
                {{ $t("shareAppletLibraryContent") }}
              </div>
            </template>
            <template v-else-if="isDuplicate">
              <div class="title">
                {{ $t("shareAppletNameDuplicate") }}
              </div>
            </template>
            <template v-else>
              <div class="title">
                {{
                  $t("shareAppletSetDetails", { appletName: appletData.name })
                }}
              </div>
              <template v-if="isPublished && appletUrl">
                <a
                  :href="'https://' + appletUrl"
                  class="copy-link"
                  @click.stop.prevent="onCopyLink"
                  @mousedown.stop
                >
                  {{ $t("shareAppletCopyLink") }}
                </a>
                <input
                  id="AppletURL"
                  type="text"
                  class="applet-url"
                  ref="appletUrl"
                  :value="appletUrl"
                />
                <v-snackbar
                  v-model="clipboardCopied"
                  :timeout="2000"
                  absolute
                  top
                  centered
                  color="green accent-4"
                  elevation="24"
                >
                  Copied!
                </v-snackbar>
              </template>
            </template>
          </div>
          <div class="ml-auto text-right">
            <v-btn color="secondary" icon @click="$emit('close')">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-switch
              v-model="share"
              @change="onSwitchShare"
              color="success"
              inset
            />
          </div>
        </v-container>
      </v-card-title>
      <v-card-text v-if="share" class="pt-0">
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
              <v-btn color="primary" @click="onChangeAppletName">
                Update
              </v-btn>
            </div>
          </v-container>
        </template>
        <template v-else>
          <v-form v-model="valid">
            <v-container fluid class="d-flex py-0">
              <v-container fluid class="mr-5 pa-0">
                <v-row v-if="false" align="center">
                  <v-col md="3" class="text-right"> Category: </v-col>
                  <v-col md="9">
                    <template v-if="isEditing">
                      <v-select
                        label="Category:"
                        :items="categories"
                        item-text="name"
                        item-value="_id"
                        v-model="categoryId"
                        :rules="categoryRules"
                        dense
                        solo
                        @change="onChangeCategoryId"
                      />
                    </template>
                    <template v-else>
                      {{ categoryName }}
                    </template>
                  </v-col>
                </v-row>
                <v-row v-if="false" align="center">
                  <v-col md="3" class="text-right"> Sub-Category: </v-col>
                  <v-col md="9">
                    <template v-if="isEditing">
                      <v-select
                        label="Sub-Category:"
                        :items="subCategories"
                        item-text="name"
                        item-value="_id"
                        v-model="subCategoryId"
                        :rules="subCategoryRules"
                        dense
                        solo
                      />
                    </template>
                    <template v-else>
                      {{ subCategoryName }}
                    </template>
                  </v-col>
                </v-row>
                <v-row align="center">
                  <v-col md="3" class="text-right"> Keywords: </v-col>
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
                      {{ keywords.join(", ") }}
                    </template>
                  </v-col>
                </v-row>
              </v-container>
              <div class="ml-auto pb-5 d-flex text-right">
                <template v-if="!isEditing">
                  <v-btn
                    color="secondary"
                    icon
                    tile
                    x-large
                    @click="isEditing = true"
                  >
                    <v-icon> mdi-square-edit-outline </v-icon>
                  </v-btn>
                </template>
                <template v-else>
                  <v-btn
                    class="align-self-end"
                    color="primary"
                    @click="onUpdateAppletDetails"
                    :disabled="!valid"
                  >
                    {{ !isPublished ? "Publish" : "Update" }}
                  </v-btn>
                </template>
              </div>
            </v-container>
          </v-form>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.copy-link {
  margin-left: 1rem;
}
.applet-url {
  position: absolute;
  left: -1000px;
}
.v-card__title {
  word-break: normal;
}
</style>

<script>
import { AppletLibraryMixin } from "@/Components/Utils/mixins/AppletLibraryMixin";
import copy from "copy-to-clipboard";

export default {
  name: "ShareAppletWithLibraryDialog",
  mixins: [AppletLibraryMixin],
  props: {
    appletData: {
      type: Object,
      required: true,
    },
    value: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    share: false,
    isDuplicate: false,
    appletName: "",
    isError: false,
    isEditing: true,
    appletUrl: "",
    libraryCategories: [],
    categories: [],
    categoryId: null,
    subCategories: [],
    subCategoryId: null,
    keywords: [],
    clipboardCopied: false,
    valid: false,
    categoryRules: [(v) => !!v || "Category is required"],
    subCategoryRules: [(v) => !!v || "Sub Category is required"],
  }),
  computed: {
    isPublished: {
      get() {
        return this.appletData.published;
      },
      set(published) {
        this.appletData.published = published;
      },
    },
    appletId() {
      return this.appletData.id;
    },
    categoryName() {
      return this.categoryId
        ? this.categories.find((c) => c._id == this.categoryId).name
        : "";
    },
    subCategoryName() {
      return this.subCategoryId
        ? this.subCategories.find((c) => c._id == this.subCategoryId).name
        : "";
    },
  },
  watch: {
    value(val) {
      if (val && this.appletData) {
        this.init();
      }
    },
    categoryId(val) {
      this.subCategories = this.libraryCategories.filter(
        (c) => c.parentId == val
      );
    },
  },
  beforeMount() {
    this.getLibraryCategories().then((res) => {
      this.libraryCategories = [...res];
      this.categories = this.libraryCategories.filter(
        (c) => c.parentId == null
      );
    });
  },
  methods: {
    async init() {
      this.share = this.isPublished;
      if (this.isPublished) {
        const {
          categoryId,
          subCategoryId,
          keywords,
        } = await this.getAppletSearchTerms(this.appletId);
        this.categoryId = categoryId;
        this.subCategoryId = subCategoryId;
        this.keywords = keywords;
        this.appletUrl = await this.getAppletLibraryUrl(this.appletId);
      } else {
        this.categoryId = null;
        this.subCategoryId = null;
        this.keywords = [];
      }
      this.appletName = this.appletData.name;
    },
    async onSwitchShare(val) {
      if (val) {
        this.checkAppletNameDuplicate();
      } else {
        await this.publishAppletToLibrary(this.appletData.id, false);
        this.isPublished = false;
        this.isEditing = true;
      }
    },
    async checkAppletNameDuplicate() {
      this.isDuplicate = !(await this.checkAppletNameInLibrary(
        this.appletId,
        this.appletName
      ));
    },
    async onChangeAppletName() {
      this.isError = false;
      try {
        await this.changeAppletName(this.appletId, this.appletName);
        this.appletData.name = this.appletName;
        await this.checkAppletNameDuplicate();
        this.isError = this.isDuplicate;
      } catch (e) {
        this.isError = true;
      }
    },
    onCopyLink() {
      this.clipboardCopied = true;
      copy(this.appletUrl);
    },
    onChangeCategoryId() {
      this.subCategoryId = null;
    },
    async onUpdateAppletDetails() {
      if (!this.isPublished) {
        await this.publishAppletToLibrary(this.appletId, true);
      }
      await this.updateAppletSearchTerms(this.appletId, {
        // category: this.categoryName,
        // subCategory: this.subCategoryName,
        keywords: JSON.stringify(this.keywords),
      });
      this.isPublished = true;
      this.isEditing = false;
    },
  },
};
</script>
