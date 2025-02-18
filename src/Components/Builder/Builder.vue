<template>
  <div>
    <About 
      v-if="loading && !infinityDialog" 
      :text="loadingText"
      :error="appletCreationFailed"
    />
    <AppletSchemaBuilder
      v-if="!initializing"
      v-show="!loading"
      :key="componentKey"
      exportButton
      :initialData="(isEditing || null) && currentAppletData"
      :getProtocols="getProtocols"
      :versions="versions"
      :nodeEnv="nodeEnv"
      :templates="itemTemplates"
      :cacheData="currentAppletBuilderData"
      :basketApplets="basketApplets"
      :themes="themes"
      :viewMode="!canEditApplet"
      :updatePDFPassword="onSetPDFPassword"
      :pdf-server-token="token"
      :appletCreated="appletCreated"
      @removeTemplate="onRemoveTemplate"
      @updateTemplates="onAddTemplate"
      @uploadProtocol="onUploadProtocol"
      @updateProtocol="onUpdateProtocol"
      @prepareApplet="onPrepareApplet"
      @onUploadError="onUploadError"
      @setLoading="setLoading"
      @switchToLibrary="onSwitchToLibrary"
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

    <AppletPassword
      ref="pdfPasswordDialog"
      v-model="pdfPasswordDialog.visible"
      :hasConfirmPassword="false"
      @set-password="onAppletPassword"
      @input="pdfPasswordDialog.callback(false)"
    />

    <v-dialog
      v-model="infinityDialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span>No Access </span>
        </v-card-title>
        <v-card-text>
          <span class="px-2">This account doesn't have enough rights/access to edit the applet.</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click="onConfirmInfinity()"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.v-dialog {
  .v-card {
    .v-card__title {
      display: block !important;
    }
  }
}
</style>

<script>
import About from "./AboutBuilder";
import PackageJson from "../../../package.json";
import api from "../Utils/api/api.vue";
import { cloneDeep } from "lodash";
import axios from "axios";
import { mapState, mapGetters, mapMutations } from "vuex";
import { AppletMixin } from "../Utils/mixins/AppletMixin";
import { AccountMixin } from "../Utils/mixins/AccountMixin";
import { RolesMixin } from '../Utils/mixins/RolesMixin';

import encryption from "../Utils/encryption/encryption.vue";
import AppletPassword from "../Utils/dialogs/AppletPassword";
import Information from "../Utils/dialogs/InformationDialog.vue";

const RESPONSE_OPTIONS = "reprolib:terms/responseOptions";
const ITEM_LIST_ELEMENT = "schema:itemListElement";
const ITEM_NAME = "schema:name";
const ITEM_VALUE = "schema:value";
const ITEM_DESCRIPTION = "schema:description";
const TYPE = "@type";
const CONTEXT = "@context";

export default {
  name: "Builder",
  components: {
    About,
    AppletPassword,
    Information,
  },
  mixins: [AppletMixin, AccountMixin, RolesMixin],
  data() {
    return {
      loading: true,
      initializing: true,
      package: PackageJson,
      dialog: false,
      dialogText: "",
      dialogTitle: "",
      appletPasswordDialog: false,
      newApplet: {},
      themeId: null,
      isEditing: false,
      uploadingApplet: false,
      infinityDialog: false,
      versions: [],
      componentKey: 1,
      itemTemplates: null,
      templateId: "",
      tokenTemplate: [
        {
          "@context": [
            "https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json",
          ],
          name: "token",
          "@id": "token",
          "skos:prefLabel": "token_template",
          "skos:altLabel": "token_template",
          "schema:description": "token_template",
          ui: {
            inputType: "radio",
            allow: ["autoAdvance"],
          },
          responseOptions: {
            "@valueType": "xsd:anyURI",
            multipleChoice: false,
            "schema:minValue": 1,
            "schema:maxValue": 2,
            choices: [],
          },
        },
      ],
      cacheData: null,
      nodeEnv: process.env.VUE_APP_NODE_ENV,
      pdfPasswordDialog: {
        visible: false,
        callback: null,
        configs: ''
      },
      loadingText: '',
      appletCreationFailed: false,
      appletCreated: null,
    };
  },
  computed: {
    ...mapState(["currentAppletBuilderData", "basketApplets", "themes"]),
    accountApplets() {
      return (
        (this.$store.state.currentAccount &&
          this.$store.state.currentAccount.applets) ||
        []
      );
    },
    canEditApplet() {
			return !this.isEditing || (this.currentAppletMeta && (!this.currentAppletMeta.welcomeApplet || this.hasRoles(this.currentAppletMeta, 'owner')));
		},
  },
  async beforeMount() {
    const { apiHost, token } = this;
    this.versions = [];
    if (!this.$route.params.isLibrary) {
      this.setBasketApplets({});
      this.cacheAppletBuilderData(null);
    }

    if (this.$route.query.accountId) {
      await this.switchAccount(this.$route.query.accountId);
    }

    if (this.$route.query.appletId) {
      if (this.accountApplets && Array.isArray(this.accountApplets)) {
        this.setCurrentApplet(
          this.accountApplets.find(
            (applet) => applet && applet.id === this.$route.query.appletId
          )
        );
      } else {
        this.infinityDialog = true;
        return;
      }
    }

    if (this.$route && (this.$route.params.isEditing || this.$route.query.appletId)) {
      const appletId = this.currentAppletMeta.id;
      this.isEditing = true;

      if (!this.isLatestApplet(this.currentAppletMeta)) {
        await this.loadApplet(this.currentAppletMeta.id);
      }

      const versions = await api.getAppletVersions({
        apiHost,
        token,
        appletId,
      });
      this.versions = versions.data;
    }
    const templateResp = await api.getItemTemplates({ apiHost, token });
    if (templateResp)
      this.formatItemTemplates(templateResp.data);

    if (this.versions && this.versions.length) {
      this.loading = false;
    }

    this.initializing = false;
  },
  methods: {
    ...mapMutations([
      "cacheAppletBuilderData", 
      "setCurrentApplet", 
      "updateAppletData",
      "setBasketApplets",
    ]),

    onSetPDFPassword (callback, configs) {
      if (this.isEditing) {
        this.pdfPasswordDialog.visible = true;
        this.pdfPasswordDialog.callback = callback;
        this.pdfPasswordDialog.configs = configs;
      } else {
        callback(false);
      }
    },

    onAppletPassword (appletPassword) {
      const accountId = this.$store.state.currentAccount.accountId;
      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword,
        accountId,
        prime: this.currentAppletMeta.encryption.appletPrime,
        baseNumber: this.currentAppletMeta.encryption.base,
      });

      const { callback, configs } = this.pdfPasswordDialog;

      if (
        encryptionInfo
          .getPublicKey()
          .equals(Buffer.from(this.currentAppletMeta.encryption.appletPublicKey))
      ) {
        this.pdfPasswordDialog.visible = false;

        api.setPDFPassword(
          configs.serverIp,
          this.$store.state.auth.authToken.token,
          encryption.publicEncrypt(JSON.stringify({ password: appletPassword, privateKey: encryptionInfo.getPrivateKey().toString() }), configs.publicKey),
          configs.serverAppletId,
          accountId,
          this.currentAppletMeta.id
        ).then(() => callback(true)).catch(() => callback(false))
      } else {
        this.$refs.pdfPasswordDialog.defaultErrorMsg = this.$t('incorrectAppletPassword');
      }
    },

    onClickSubmitPassword(appletPassword) {
      this.appletPasswordDialog = false;
      this.addNewApplet(appletPassword);
    },
    onUploadProtocol({applet, themeId}) {
      this.newApplet = applet;
      this.themeId = themeId;
      this.appletPasswordDialog = true;
    },
    async onAddTemplate(option) {
      this.itemTemplates = [...this.itemTemplates, option];
      await this.onUpdateTemplates(option);
    },
    async onRemoveTemplate(option) {
      const updatedItems = this.itemTemplates.filter(
        ({ text, value, description }) =>
          text !== option.text ||
          value !== option.value ||
          description !== option.description
      );
      this.itemTemplates = [...updatedItems];
      await this.onUpdateTemplates(option);
    },
    async onUpdateTemplates(option) {
      const form = new FormData();
      const { apiHost, token, tokenTemplate } = this;
      const contextURL =
        "https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json";
      const optionData = {
        contexts: {},
        templates: tokenTemplate,
      };
      const choices = this.itemTemplates.map((template) => {
        return {
          [TYPE]: "schema:option",
          [ITEM_NAME]: template.text,
          [ITEM_VALUE]: template.value,
          [ITEM_DESCRIPTION]: template.description,
        };
      });
      optionData.contexts[contextURL] = (await axios.get(contextURL)).data[
        CONTEXT
      ];
      optionData.templates[0]["responseOptions"]["choices"] = choices;
      if (this.templateId) {
        optionData.templates[0]["_id"] = this.templateId;
      }
      form.set("templateInfo", JSON.stringify(optionData));
      const updatedTemplates = await api.updateItemTemplates({
        apiHost,
        token,
        data: form,
      });
      if (updatedTemplates.data.length) {
        this.templateId = updatedTemplates.data[0]["_id"];
      }
    },
    onConfirmInfinity() {
      this.infinityDialog = false;
      this.$router.push("/dashboard").catch(err => {});
    },
    async subscribe(request_guid) {
      const response = await api.checkState({
        apiHost: this.apiHost,
        token: this.token,
        request_guid
      });

      if(!Object.keys(response.data).length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.subscribe(request_guid);
        return
      }

      if(!response.data.is_success) {
        this.appletCreationFailed = true
        this.loadingText = 'Applet creation failed, returning to builder...'
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        this.loading = false
        this.loadingText = ''
        this.appletCreationFailed = false
        return
      }

      this.loadingText = 'Applet created successfully, loading data...'
      this.isEditing = true;

      this.analytics.track('Applet Created Successfully');

      // Getting applets with roles
      const accountResponse = await api.switchAccount({
        apiHost: this.apiHost,
        token: this.token,
        accountId: this.$store.state.currentAccount.accountId
      });

      const accountApplet = accountResponse.data.account.applets.find(
        (applet) => applet && applet.id === response.data.applet_id
      )

      // Setting meta+data without protocol
      this.setCurrentApplet(accountApplet);
      this.$store.state.currentAccount.applets.splice(0, 0, accountApplet)

      // Getting applet with protocol
      const appletResponse = await api.getApplet({
        apiHost: this.apiHost,
        token: this.token,
        allEvent: accountApplet.roles.includes('coordinator') || appletMeta.roles.includes('manager'),
        retrieveSchedule: true,
        id: accountApplet.id
      })

      // Setting applet protocol data
      this.cacheAppletBuilderData(null);
      this.updateAppletData(appletResponse.data)
      this.appletCreated = true
    },

    addNewApplet(appletPassword) {
      const accountId = this.$store.state.currentAccount.accountId;
      const form = new FormData();
      form.set("protocol", JSON.stringify(this.newApplet || {}));

      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword: appletPassword,
        accountId
      });
      const token = this.$store.state.auth.authToken.token;
      const configs = this.newApplet.protocol.data.reportConfigs;

      const serverIp = configs.find(config => config['schema:name'] == 'serverIp');
      const publicKey = configs.find(config => config['schema:name'] == 'publicEncryptionKey');
      const serverAppletId = configs.find(config => config['schema:name'] == 'serverAppletId');

      if (serverAppletId && serverAppletId['schema:value']) {
        api.setPDFPassword(
          serverIp['schema:value'],
          token,
          encryption.publicEncrypt(JSON.stringify({ password: appletPassword, privateKey: encryptionInfo.getPrivateKey().toString() }), publicKey['schema:value']),
          serverAppletId['schema:value'],
          accountId,
        );
      }

      form.set(
        "encryption",
        JSON.stringify({
          appletPublicKey: Array.from(encryptionInfo.getPublicKey()),
          appletPrime: Array.from(encryptionInfo.getPrime()),
          base: Array.from(encryptionInfo.getGenerator()),
        })
      );

      api
        .createApplet({
          data: form,
          email: this.$store.state.userEmail,
          token,
          apiHost: this.$store.state.backend,
          themeId: this.themeId
        })
        .then((resp) => {
          this.setBasketApplets({});
          return resp.data.request_guid
        })
        .then((request_guid) => {
          this.loadingText = 'Your applet is creating, please wait...'
          this.loading = true

          this.subscribe(request_guid)
        })
        .catch((e) => {
          console.log(e);
          this.onUploadError();
        });
    },
    formatItemTemplates(templatesData) {
      const templates = [];
      templatesData.forEach((data) => {
        data[RESPONSE_OPTIONS].forEach((responseOption) => {
          responseOption[ITEM_LIST_ELEMENT].forEach((itemElement) => {
            const template = {
              text: itemElement[ITEM_NAME][0]["@value"],
              value: itemElement[ITEM_VALUE][0]["@value"],
              description:
                (itemElement[ITEM_DESCRIPTION] &&
                  itemElement[ITEM_DESCRIPTION][0]["@value"]) ||
                "",
            };
            if (
              templates.some(
                ({ text, value, description }) =>
                  text === template.text &&
                  value === template.value &&
                  description === template.description
              )
            ) {
              // template found inside the array
            } else {
              templates.push(template);
            }
          });
        });
      });
      if (templatesData.length) {
        this.templateId = templatesData[0]["_id"];
      }
      this.itemTemplates = [...templates];
    },
    onUpdateProtocol({protocol, themeId}) {
     let protocolData;

      if (protocol) {
        protocolData = new FormData();
        protocolData.set("protocol", JSON.stringify(protocol));
      }

      const appletId = this.currentAppletMeta.id;
      const token = this.$store.state.auth.authToken.token;
      const apiHost = this.$store.state.backend;

      if (this.uploadingApplet) {
        this.onUploadError('Your applet is being edited');
        return ;
      }

      this.uploadingApplet = true;
      api
        .updateApplet({
          ...(protocolData && {data: protocolData}),
          appletId,
          token,
          apiHost,
          themeId
        })
        .then((resp) => this.loadApplet(appletId))
        .then((data) => {
          this.updateAppletData({
            ...data,
            roles: this.currentAppletMeta.roles,
          });

          api.getAppletVersions({ apiHost, token, appletId }).then((resp) => {
            this.versions = resp.data;
            this.componentKey = this.componentKey + 1;
          });

          this.setBasketApplets({});
          this.cacheAppletBuilderData(null);

          this.onUploadSucess();

          this.analytics.track('Applet edit successful');
        })
        .catch((e) => {
          this.onUploadError();
        })
        .finally(() => {
          this.uploadingApplet = false;
        })
    },
    onPrepareApplet(data) {
      const protocol = new FormData();

      const blob = new Blob([JSON.stringify(data || {})], {
        type: "application/json",
      });
      protocol.append("protocol", blob);

      const appletId = this.currentAppletMeta.id;
      const token = this.$store.state.auth.authToken.token;
      const apiHost = this.$store.state.backend;

      api
        .prepareApplet({
          apiHost,
          token,
          data: protocol,
          appletId,
          thread: false,
        })
        .then((resp) => this.loadApplet(appletId))
        .then(() => api.getAppletVersions({ apiHost, token, appletId }))
        .then((resp) => {
          this.versions = resp.data;
          this.componentKey = this.componentKey + 1;
          this.loadingText = ''
        });
    },
    onUploadSucess(msg) {
      this.dialogText = msg || "Your applet is successfully updated";
      this.dialogTitle = "Upload Received";
      this.dialog = true;
    },
    onUploadError(msg) {
      this.dialogText =
        msg ||
        "There was an error uploading your applet. Please try again or report the issue.";
      this.dialogTitle = "Upload Error";
      this.dialog = true;
    },
    getProtocols(versions) {
      if (!this.isEditing) return [];
      const appletId = this.currentAppletMeta.id;

      return api.getProtocolData({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId,
        versions,
      });
    },
    setLoading(isLoading) {
      this.loading = isLoading;
    },
    onSwitchToLibrary(appletBuilderData) {
      api
        .getOneTimeToken({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
        })
        .then((res) => {
          const { token } = res.data;
          this.cacheAppletBuilderData(appletBuilderData);
          window.location.href = `${process.env.VUE_APP_LIBRARY_URI}/#/?from=builder&token=${token}`;
        });
    },
  },
};
</script>
