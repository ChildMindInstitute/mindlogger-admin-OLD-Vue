<template>
  <v-content>
    <About v-if="loading" />
    <AppletSchemaBuilder
      v-if="!loading"
      exportButton
      :initialData="(isEditing || null) && currentApplet"
      :key="componentKey"
      :getProtocols="getProtocols"
      :versions="versions"
      :templates="itemTemplates"
      @removeTemplate="onRemoveTemplate"
      @updateTemplates="onUpdateTemplates"
      @uploadProtocol="onUploadProtocol"
      @updateProtocol="onUpdateProtocol"
      @prepareApplet="onPrepareApplet"
      @onUploadError="onUploadError"
      @setLoading="setLoading"
    />

    <Information
      v-model="dialog"
      :dialogText="dialogText"
      :title="dialogTitle"
    />

    <AppletPassword
      v-model="appletPasswordDialog"
      @set-password="onClickSubmitPassword"
    />
  </v-content>
</template>

<style lang="scss">
.v-card__text {
  padding: 16px !important; 
}
</style>

<script>
import Components from "applet-schema-builder";
import About from "./AboutBuilder";
import PackageJson from "../../../package.json";
import api from "../Utils/api/api.vue";
import { cloneDeep } from "lodash";
import axios from "axios";

import encryption from '../Utils/encryption/encryption.vue';
import AppletPassword from '../Utils/dialogs/AppletPassword'
import Information from '../Utils/dialogs/information';

const RESPONSE_OPTIONS = "reprolib:terms/responseOptions";
const ITEM_LIST_ELEMENT = "schema:itemListElement";
const ITEM_NAME = "schema:name";
const ITEM_VALUE = "schema:value";
const TYPE = "@type";
const CONTEXT = "@context";

export default {
  name: "Builder",
  components: {
    ...Components,
    About,
    AppletPassword,
    Information,
  },
  data() {
    return {
      loading: true,
      drawer: false,
      aboutOpen: false,
      package: PackageJson,
      dialog: false,
      dialogText: "",
      dialogTitle: "",
      appletPasswordDialog: false,
      newApplet: {},
      isEditing: false,
      versions: [],
      itemTemplates: null,
      componentKey: 1,
      templateId: "",
      tokenTemplate: [
        {
          "@context": [
            "https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json"
          ],
          "name": "token",
          "@id": "token",
          "skos:prefLabel": "token_template",
          "skos:altLabel": "token_template",
          "schema:description": "token_template",
          "ui": {
            "inputType": "radio",
            "allow": [
              "autoAdvance"
            ]
          },
          "responseOptions": {
            "@valueType": "xsd:anyURI",
            "multipleChoice": false,
            "schema:minValue": 1,
            "schema:maxValue": 2,
            "choices": []
          },
        }
      ]
    };
  },
  async beforeMount() {
    const { apiHost, token } = this;
    this.versions = [];

    if (this.$route.params.isEditing) {
      const appletId = this.currentApplet.applet._id.split('/')[1];
      this.isEditing = true;
      const resp = await api.getAppletVersions({ apiHost, token, appletId });
      this.versions = resp.data;
    }
    const templateResp = await api.getItemTemplates({ apiHost, token });
    this.formatItemTemplates(templateResp.data)
  },
  computed: {
    apiHost() {
      return this.$store.state.backend;
    },
    token() {
      return this.$store.state.auth.authToken.token;
    },
    currentApplet() {
      return this.$store.state.currentApplet;
    }
  },
  methods: {
    onClickSubmitPassword(appletPassword) {
      this.appletPasswordDialog = false;
      this.addNewApplet(appletPassword);
    },
    onUploadProtocol(newApplet) {
      this.newApplet = newApplet;
      this.appletPasswordDialog = true;
    },
    async onRemoveTemplate(option) {
      const { itemTemplates } = this;
      const updatedItems = itemTemplates.filter(({ text, value }) => text !== option.text || value !== option.value)
      this.itemTemplates = [...updatedItems]
      await this.onUpdateTemplates(option)
    },
    async onUpdateTemplates(option) {
      const form = new FormData();
      const { apiHost, token, tokenTemplate } = this;
      const contextURL = "https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json";
      const optionData = {
        contexts: {},
        templates: tokenTemplate
      }
      const choices = this.itemTemplates.map(template => {
        return {
          [TYPE]: "schema:option",
          [ITEM_NAME]: template.text,
          [ITEM_VALUE]: template.value
        }
      })
      optionData.contexts[contextURL] = (await axios.get(contextURL)).data[CONTEXT];
      optionData.templates[0]["responseOptions"]["choices"] = choices;
      if (this.templateId) {
        optionData.templates[0]["_id"] = this.templateId
      }
      form.set("templateInfo", JSON.stringify(optionData));
      await api.updateItemTemplates({ 
        apiHost, 
        token, 
        data: form 
      });
    },
    addNewApplet(appletPassword) {
      const form = new FormData();
      form.set("protocol", JSON.stringify(this.newApplet || {}));

      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword: appletPassword,
        accountId: this.$store.state.currentAccount.accountId
      });
      form.set('encryption', JSON.stringify({
        appletPublicKey: Array.from(encryptionInfo.getPublicKey()),
        appletPrime: Array.from(encryptionInfo.getPrime()),
        base: Array.from(encryptionInfo.getGenerator())
      }));

      api
        .createApplet({
          data: form,
          email: this.$store.state.userEmail,
          token: this.$store.state.auth.authToken.token,
          apiHost: this.$store.state.backend,
        })
        .then(resp => {
          this.onUploadSucess(resp.data.message);
        })
        .catch((e) => {
          console.log(e);
          this.onUploadError();
        });
    },
    formatItemTemplates(templatesData) {
      const templates = []
      templatesData.forEach(data => {
        data[RESPONSE_OPTIONS].forEach(responseOption => {
          responseOption[ITEM_LIST_ELEMENT].forEach(itemElement => {
            const template = {
              text: itemElement[ITEM_NAME][0]["@value"],
              value: itemElement[ITEM_VALUE][0]["@value"]
            }
            if (templates.some(({ text, value }) => text === template.text && value === template.value)) {
              // template found inside the array
            } else {
              templates.push(template)
            }
          })
        })
      })
      if (templatesData.length) {
        this.templateId = templatesData[0]["_id"]
      }
      this.itemTemplates = [...templates]
      this.loading = false;
    },
    onUpdateProtocol(updateData) {
      const protocol = new FormData();
      protocol.set("protocol", JSON.stringify(updateData|| {}));

      const appletId = this.currentApplet.applet._id.split('/')[1];
      const token = this.$store.state.auth.authToken.token;
      const apiHost = this.$store.state.backend;
      api.updateApplet({
        data: protocol,
        appletId,
        token,
        apiHost,
      }).then(resp => {
        this.$store.commit('updateAppletData', {
          ...resp.data,
          roles: this.currentApplet.roles
        });

        api.getAppletVersions({ apiHost, token, appletId }).then(resp => {
          this.versions = resp.data;
          this.componentKey = this.componentKey + 1;
        });

        this.onUploadSucess();
      }).catch(e => {
        this.onUploadError();
      })
    },
    onPrepareApplet(data) {
      const protocol = new FormData();
      protocol.set("protocol", JSON.stringify(data || {}));

      const appletId = this.currentApplet.applet._id.split('/')[1];
      const token = this.$store.state.auth.authToken.token;
      const apiHost = this.$store.state.backend;
      api.prepareApplet({
        apiHost, token, data: protocol, appletId
      }).then(resp => {
        this.$store.commit('updateAppletData', {
          ...resp.data,
          roles: this.currentApplet.roles
        });

        return api.getAppletVersions({ apiHost, token, appletId });
      }).then(resp => {
        this.versions = resp.data;
        this.componentKey = this.componentKey + 1;
      });
    },
    onUploadSucess(msg) {
        this.dialogText = msg || 'Your applet is successfully updated';
        this.dialogTitle = 'Upload Received';
        this.dialog = true;
    },
    onUploadError(msg) {
        this.dialogText = msg || "There was an error uploading your applet. Please try again or report the issue.";
        this.dialogTitle = 'Upload Error';
        this.dialog = true;
    },
    getProtocols(versions) {
      if (!this.isEditing) return [];
      const appletId = this.currentApplet.applet._id.split('/')[1];

      return api.getProtocolData({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId,
        versions
      })
    },
    setLoading(isLoading) {
      this.aboutOpen = isLoading;
    }
  }
};
</script>
