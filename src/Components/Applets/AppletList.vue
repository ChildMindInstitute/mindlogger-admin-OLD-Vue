<template>
  <div>
    <div class="applet-header">
      <div class="filter">
        <v-text-field
            v-model="searchText"
            :label="$t('searchApplets')"
            prepend-inner-icon="mdi-magnify"
            class="search-input"
            hide-details
            outlined
        />
      </div>
    </div>
    <div class="ml-auto">
        <v-btn
          color="primary"
          class="mx-2 mb-2"
          @click="onNewFolderCreated()"
        >
          <v-icon
            dark
          >mdi-plus</v-icon>
        New Folder
        </v-btn>
    </div>
    <div v-if="isSyncing" >
      <p class="text-center" style="color:gray">{{loaderMessage}}</p>  
      <v-progress-linear indeterminate rounded height="3" />
    </div>

    <v-expand-transition>
      <div class="red lighten-2 mx-4" v-show="showSaveFolderInstructions">
        <p class="text-center white--text" style="color:gray">Operation cannot be completed. Save folder first</p>  
      </div>
    </v-expand-transition>


    <div class="d-flex">
      <div style="min-width:10px;" @dragenter="draggingIntoRoot" @dragover.prevent 
        @dragover.stop="draggingIntoRoot"
        @drop.stop.prevent="doppedOnRoot"
        @dragleave.stop.prevent="isRootActive = false"
        :class="{'isRootActive': isRootActive}">
        
      </div>
     <v-data-table
          style="width: 100%"
          :headers="headers"
          :items="visibleItems"
          :hide-default-footer="true"
          :items-per-page="1000"
          depressed
          sort-by="calories"
          class="elevation-4"
          :loading="loading"
          >
        <template v-slot:item="{ item }">
          <applet-item
              v-on:expand-node="toggleExpand"
              :headers="headers"
              v-on:newfolder-created="onNewFolderCreated"
              v-on:item-drag-started="dragStarted"
              v-on:save-folder="onSaveFolder"
              v-on:item-dropped="itemDropped"
              v-on:pinStatusChanged="toggleAppletPin"
              v-on:rename-completed="renameFolder"
              :item="item"
              :key="item.id + item.parentId"
              v-on:unsaved-folder-operation="animateSaveInstructions"
              v-on:row-selected="handleRowSelect"
          >
            <template v-slot:actions v-if="selectedRowId === item.id">
              <applet-actions v-if="!item.isFolder" :key="item.id" :item="item"
                    @onViewUsers="onViewUsers"
                    @onViewGeneralCalendar="onViewGeneralCalendar"
                    @onEditApplet="onEditApplet" 
                    @onDeleteApplet="onDeleteApplet" 
                    @onDuplicateApplet="onDuplicateApplet"
                    @onRefreshApplet="onRefreshApplet"
                    @onTransferOwnership="onTransferOwnership" />

              <folder-actions v-else :key="item.id" :item="item"
                    @onSave="onSaveFolder"
                    @onDelete="deleteFolder" />
            </template>
            
          </applet-item>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary"> No data</v-btn>
    </template>
    </v-data-table>
    </div>

  
   
    <ConfirmationDialog
        v-model="appletDeleteDialog"
        :dialogText="deleteAppletDialogText"
        :title="deleteAppletDialogTitle"
        @onOK="deleteApplet"
    />

    <ConfirmationDialog
        v-model="appletEditDialog"
        :dialogText="$t('appletEditAlert')"
        :title="$t('appletEdit')"
        @onOK="editApplet"
    />

    <AppletName
        ref="appletNameDialog"
        v-model="appletDuplicateDialog"
        @set-value="onSetAppletDuplicateName"
    />

    <v-dialog
        v-model="ownershipDialog"
        persistent
        max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t('transferAppletOwnership') }}</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                  v-model="ownershipEmail"
                  class="ownershipField"
                  :label="$t('ownerEmail')"
                  required
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
              color="blue darken-1"
              text
              @click="ownershipDialog = false"
          >
            {{ $t('close') }}
          </v-btn>
          <v-btn
              color="blue darken-1"
              text
              :disabled="!emailRules.test(ownershipEmail)"
              @click="transferOwnership"
          >
            {{ $t('submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AppletPassword
        v-model="appletPasswordDialog"
        :hasConfirmPassword="true"
        @set-password="onClickSubmitPassword"
    />
  </div>
</template>

<style>
  .cell {
    text-align: center;
  }
  .applet-header {
    display: flex;
    justify-content: space-between;
  }
  .filter {
    flex: 1;
    width: 80%;
  }
  .right-action {
    flex: 1;
    text-align: right;
    margin-right: 1vw;
  }
  .filter .search-input {
    margin: 10px;
    width: 50%;
    display: inline-block;
  }
  .filter span {
    color: rgb(159, 110, 240);
    font-weight: 600;
    margin-left: 20px;
  }
  @media only screen and (max-width: 767px) {
    .filter .search-input {
      width: 80%;
    }
    .filter span {
      display: none;
    }
  }

  @media only screen and (min-width: 1200px) {
    .laptop-hidden {
      display: none;
    }
  }
  @media only screen and (max-width: 1199px ) {
    .laptop-only {
      display: none;
    }
  }
</style>

<script>
import api from "../Utils/api/api.vue";
import config from "../../config";
import encryption from "../Utils/encryption/encryption.vue";
import AppletName from "../Utils/dialogs/AppletName";
import ConfirmationDialog from '../Utils/dialogs/ConfirmationDialog';
import AppletPassword from "../Utils/dialogs/AppletPassword.vue";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/fr';
import AppletItem from "./AppletItem";
import AppletDirectoryManager from "./AppletDirectoryManager.js";
import AppletActions from "./AppletActions.vue";
import FolderActions from "./FolderActions.vue";



TimeAgo.addLocale(en);
TimeAgo.addLocale(fr);

export default {
  name: "AppletList",
  mixins: [AppletDirectoryManager],
  components: {
    AppletItem,
    AppletName,
    AppletActions,
    FolderActions,
    ConfirmationDialog,
    AppletPassword,
  },
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    applets: {
      type: Array,
      required: true
    },

  },
  data() {
    return {
      showSelectAll: true,
      directoryLookUp: {},
      flattenedDirectoryItems: [],
      visibleItems: [],
      draggedItem: undefined,
      appletPasswordDialog: false,
      requestedAction: null,
      headers: [
        {
          text: this.$i18n.t('appletName'),
          align: 'left',
          sortable: true,
          value: 'name',
          isPrimaryColumn: true,
          width: '30%',
        },
        {
          text: this.$i18n.t('lastEdit'),
          align: 'left',
          sortable: true,
          value: 'updated',
          width: '15%'
        },
        {
          align: 'left',
          text: 'Actions',
          sortable: false,
          value: 'actions'
        }
      ],
      searchText: '',
      showSaveFolderInstructions: false,
      appletDuplicateDialog: false,
      appletEditDialog: false,
      appletDeleteDialog: false,
      ownershipDialog: false,
      ownershipEmail: '',
      emailRules: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
      newProtocolUrl: "",
      appletUploadDialog: false,
      timeAgo: new TimeAgo(this.$i18n.locale.replace('_', '-')),
      selectedRowId: null,
    }
  },
  mounted() {
   this.loadFormattedData();
  },
  
  computed: {
    directoryItems() {
      return this.$store.state.fullDirectory;
    },

    deleteAppletDialogTitle() {
      return this.$t('deleteApplet');
    },
    deleteAppletDialogText() {
      return this.$t('deleteAppletConfirmation');
    },
    accountApplets() {
      return this.$store.state.currentAccount.applets;
    },
    formattedApplets() {
      const formatted = [];
      for (let applet of this.applets) {
        if (applet.name.includes(this.searchText)) {
          formatted.push({
            ...applet,
            timeAgo: this.timeAgo.format(new Date(applet.updated), 'round')
          })
        }
      }
      return formatted;
    },
    currentApplet: {
      get() {
        return this.$store.state.currentAppletMeta;
      },
      set(applet) {
        this.$store.commit('setCurrentApplet', applet);
      }
    }
  },
  methods: {
    animateSaveInstructions() {
      this.showSaveFolderInstructions = true;

      setTimeout(() => {
        this.showSaveFolderInstructions  = false;
      }, 2000);
    },

    renameFolder(item) {
      item.isRenaming = false
      const  similarFolders = this.flattenedDirectoryItems.filter(folder => folder.id != item.id && folder.name == item.name)
      if (similarFolders.length > 0 ) {
        item.name = `${item.name} (${similarFolders.length} )` ;
      }
    },

    loadFormattedData ()
    {
      const directoryItems = this.directoryItems;
      directoryItems.forEach((item) => {
        this.flattenDirectory(item);
      });
      this.visibleItems = this.flattenedDirectoryItems.filter(
          (item) => item.isVisible
      );
    },
    toggleExpand(item) {
      item.isExpanded = !item.isExpanded;
      this.toggleExpansion(item);
      this.updateVisibleItems();
    },

    toggleExpansion(item) {
      if (!item.items) return;
      item.items.forEach((_item) => {
        _item.isVisible = item.isExpanded;
        this.toggleExpansion(_item);
      });
    },
    handleRowSelect(item) {
      this.selectedRowId = item.id;
    },
    updateVisibleItems() {
      this.visibleItems = this.flattenedDirectoryItems.filter(
          (item) => item.isVisible
      );
    },

    onNewFolderCreated() {
      const userId = this.$store.state.currentUser['_id'] || ''
      const folder = {
        id: Math.random() + Math.random(),
        name: "New Folder",
        isFolder: true,
        description: "",
        isExpanded: false,
        items: [],
        roles: [],
        isNew: true,
        isRenaming: true,
        isVisible: true,
        depth: 0,
        parentId: userId,
      };
      this.flattenedDirectoryItems.unshift(folder);
      this.updateVisibleItems();
    },
    onSaveFolder(item)
    {
      if(!item.isNew)
      {
        this.updateFolder(item, item.id)
      }
      else {
        this.saveFolder(item);
      }
      item.isRenaming = false;
    },


    async doppedOnRoot() {
      this.isRootActive = false;
      if (!this.draggedItem.parentId) return; // already belongs to the root

      const previousFolder = this.flattenedDirectoryItems.filter(
          (folder) => folder.id == this.draggedItem.parentId
      )[0];


      if (previousFolder) {
        previousFolder.items = previousFolder.items.filter(
            (x) => x.id != this.draggedItem.id
        );
      }

      await this.moveAppletToRootDirectory(this.draggedItem);

      this.draggedItem.depth = 0;
      this.draggedItem.parentId = undefined;
      this.draggedItem.isVisible = true;

      var previousIndex = this.flattenedDirectoryItems.indexOf(
          this.draggedItem
      );

      if (previousIndex > -1)
        this.flattenedDirectoryItems.splice(previousIndex, 1);

      this.flattenedDirectoryItems.push(this.draggedItem);
      this.updateVisibleItems();
      this.isRootActive = false;
    },

    async itemDropped(destination) {
      const dragSourceIsSameAsDragDestination = destination.id == this.draggedItem.id;

      if (dragSourceIsSameAsDragDestination) return;

      const isDroppingOnRootApplet = destination.parentId == undefined;
      const isMovingAppletOutOfFolders = isDroppingOnRootApplet && 
                                        !this.draggedItem.isFolder 
                                        && !destination.isFolder;
      //disable nested folders for now                                        
      if (destination.isFolder && this.draggedItem.isFolder) return;

      if (isMovingAppletOutOfFolders) {
        await this.doppedOnRoot();
        return;
      }

      if (!destination.isFolder) return;

      if (!this.draggedItem) return;

      // Disassocciate dropped item from previous tree
      const previousFolder = this.flattenedDirectoryItems.filter(
          (folder) => folder.id == this.draggedItem.parentId
      )[0];

      if (previousFolder) {
        previousFolder.items = previousFolder.items.filter(
            (x) => x.id != this.draggedItem.id
        );
      }
      const wasNotInFolder =  !this.draggedItem.parentId;
      const wasInFolder = this.draggedItem.parentId != undefined;
      const isMovingToFolder = this.draggedItem.parentId != destination.id
      this.loaderMessage = `'${this.draggedItem.name}' moved to '${destination.name}'. Saving changes. `;
      if (wasNotInFolder && isMovingToFolder)
      {
          await this.addAppletToFolder(this.draggedItem, destination)        
      }

      if (isMovingToFolder && wasInFolder) {
           await this.changeFolder(previousFolder, destination, this.draggedItem)        
      } 

      this.draggedItem.parentId = destination.id;
      this.draggedItem.depth = destination.depth + 1;
      destination.items.push(this.draggedItem);

      var previousIndex = this.flattenedDirectoryItems.indexOf(
          this.draggedItem
      );
      if (previousIndex > -1)
        this.flattenedDirectoryItems.splice(previousIndex, 1);

      var indexOfParent = this.flattenedDirectoryItems.indexOf(destination);

    

      if (indexOfParent > -1) {
        this.flattenedDirectoryItems.splice(
            indexOfParent + 1,
            0,
            this.draggedItem
        );
      }

      this.draggedItem.isVisible = destination.isExpanded;




      if (this.draggedItem.isFolder) {
        const destination = this.draggedItem;
        this.draggedItem.items.forEach((item) => {
          this.draggedItem = item;
          this.itemDropped(destination);
        });
      }

      this.updateVisibleItems();
    },

    dragStarted(draggedItem) {
      this.draggedItem = draggedItem;
    },

    flattenDirectory(item) {
      this.directoryLookUp[item.id] = item;
      item.isNew = false;
      this.flattenedDirectoryItems.push(item);

      if (!item.depth) {
        this.$set(item, "depth", 0);
      }

      // initiallise visibility of subfolders to false
      item.isVisible = item.depth <= 0;

      if (!item.isFolder) return;
      this.$set(item, "isExpanded", false);
      item.items.forEach((_item) => {
        _item.parentId = item.id;
        _item.depth = item.depth + 1;
        this.flattenDirectory(_item);
      });
    },
    rowClicked(row) {
      this.selectedRowId = row.id;
    },
    setAppletPassword(appletPassword) {
      let apiHost = this.$store.state.backend;
      let token = this.$store.state.auth.authToken.token;
      let appletId = this.selectedRowId;
      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword: appletPassword,
        accountId: this.$store.state.currentAccount.accountId,
      });

      const encryptionForm = new FormData();
      encryptionForm.set(
          "encryption",
          JSON.stringify({
            appletPublicKey: Array.from(encryptionInfo.getPublicKey()),
            appletPrime: Array.from(encryptionInfo.getPrime()),
            base: Array.from(encryptionInfo.getGenerator()),
          })
      );

      api
          .setAppletEncryption({
            token,
            apiHost,
            data: encryptionForm,
            appletId,
          })
          .then(() =>
              api.getApplet({
                token,
                apiHost,
                id: appletId,
                allEvent: this.accountApplets.find(
                    (value) => value.id == appletId
                ).allEvent,
              })
          )
          .then((resp) => {
            this.$store.commit("updateAppletData", resp.data);
            this.$emit("onAppletPasswordChanged");
          });
    },

    transferOwnership() {
      api
          .transferOwnership({
            apiHost: this.$store.state.backend,
            token: this.$store.state.auth.authToken.token,
            appletId: this.selectedRowId,
            email: this.ownershipEmail,
          })
          .then((resp) => {
            this.ownershipDialog = false;
            this.$emit("onOwnerShipInviteSuccessful", this.ownershipEmail);
          })
          .catch((err) => {
            this.$emit("onOwnerShipInviteError");
          });
    },

    deleteApplet() {
      api
          .deleteApplet({
            apiHost: this.$store.state.backend,
            token: this.$store.state.auth.authToken.token,
            appletId: this.selectedRowId,
          })
          .then((resp) => {
            this.$emit("refreshAppletList");
          });
    },

    editApplet() {
      this.currentApplet = this.formattedApplets.find(applet => applet.id === this.selectedRowId);
      this.$router.push({
        name: 'Builder',
        params: {isEditing: true},
      }).catch(err => {
      });
    },

    onClickSubmitPassword(appletPassword) {
      this.appletPasswordDialog = false;
      this.requestedAction(appletPassword);
    },

    onSetAppletDuplicateName(appletName) {
      api
          .duplicateApplet({
            apiHost: this.$store.state.backend,
            token: this.$store.state.auth.authToken.token,
            appletId: this.selectedRowId,
            options: {
              name: appletName,
            },
          })
          .then((resp) => {
            this.appletDuplicateDialog = false;
            this.$emit('onDuplicateRequestReceived', resp.data.message);
          });
    },
    onUpdateAppletPassword() {
      this.appletPasswordDialog = true;
      this.requestedAction = this.setAppletPassword.bind(this);
    },
    onTransferOwnership(applet) {
      this.ownershipDialog = true;
    },
    
    isNotEncrypted(item) {
      return !item.encryption && !item.applet.encryption;
    },

    onViewUsers(item) {
      if (item.roles.includes('owner') && this.isNotEncrypted(item)) {
        this.onUpdateAppletPassword();
      } else {
        this.currentApplet = item;
        this.$router.push(`applet/${item.id}/users`).catch(err => {
        });
      }
    },
    onDeleteApplet(applet) {
      this.appletDeleteDialog = true;
    },
    onEditApplet(applet) {
      if (applet.hasUrl) {
        this.appletEditDialog = true;
      } else {
        this.editApplet();
      }
    },
    onViewGeneralCalendar(item) {
       if ( item.roles.includes('owner') && this.isNotEncrypted(item)) {
        this.onUpdateAppletPassword();
      } else {
        this.currentApplet = item;
        this.$store.commit('setCurrentUsers', {});
       this.$router.push(`applet/${this.currentApplet.id}/schedule`).catch(err => {
        });
      }
    },
    onDuplicateApplet(applet) {
      api
          .validateAppletName({
            apiHost: this.$store.state.backend,
            token: this.$store.state.auth.authToken.token,
            name: `${applet.name} (1)`
          })
          .then(resp => {
            this.appletDuplicateDialog = true;
            this.$refs.appletNameDialog.appletName = resp.data;
          })
    },
    onRefreshApplet(applet) {
      api
          .refreshApplet({
            apiHost: this.$store.state.backend,
            token: this.$store.state.auth.authToken.token,
            appletId: applet.id,
          })
          .then((resp) => {
            this.$emit("onRefreshAppletRequestReceived", resp.data.message);
          });
    },

    deleteFolder(folder) {
      if (folder.isNew && folder.items.length == 0) {
        this.flattenedDirectoryItems = this.flattenedDirectoryItems.filter(item => item.id != folder.id);
        this.updateVisibleItems();
      } else {
        this.deleteFolderOnServer(folder).then(() => {
          this.flattenedDirectoryItems = this.flattenedDirectoryItems.filter(item => item.id != folder.id);
          this.isSyncing = false;
          this.loaderMessage = null;
          this.updateVisibleItems();
        });
      }
    },
  },
};
</script>


<style scoped>
  .cell {
    text-align: center;
  }
  .applet-header {
    display: flex;
    justify-content: space-between;
  }
  .filter {
    flex: 1;
    width: 80%;
  }
  .filter .search-input {
    margin: 10px;
    width: 50%;
    display: inline-block;
  }
  .filter span {
    color: rgb(159, 110, 240);
    font-weight: 600;
    margin-left: 20px;
  }

  @media only screen and (max-width: 767px) {
    .filter .search-input {
      width: 80%;
    }
    .filter span {
      display: none;
    }
  }

  .isRootActive {
    width: 30px;
    background: steelblue;
    
  }
</style>
