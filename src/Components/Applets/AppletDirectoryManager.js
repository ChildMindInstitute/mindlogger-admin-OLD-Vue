
import api from "@/Components/Utils/api/api.vue";

const SERVERADDRESS = process.env.VUE_APP_SERVER_URL;

export default {

	data () {
		return {
      		loaderMessage: "",
      		isSyncing: false,
      		isRootActive: false,
		}
	},

	methods: {
		async toggleAppletPin(applet) {
			const newState = applet.pinOrder > 0 ? false : true;
			this.loaderMessage = `Please wait...`;
			this.isSyncing = true;

			await api.togglePin(SERVERADDRESS, this.token, applet, newState)
				.then((response) => {
					this.$set(applet, "pinOrder", newState ? 1 : 0);
				})

			this.isSyncing = false;
		},

		// Deletes the folder from current directory
		async deleteFolderOnServer(folder) {
			this.isSyncing = true;
			this.loaderMessage = `Deleting '${folder.name}'. Please wait...`
			const apiRequest = api.deleteFolder(SERVERADDRESS, this.token, folder.id)
			return apiRequest;
		},

		// Updates folder name on the server
		async updateFolder(updatedFolder, folderId ) {
			this.isSyncing = true;
			this.loaderMessage = `Updating '${updatedFolder.name}'. Please wait...`
			await api.updateFolder(SERVERADDRESS, this.token, updatedFolder, folderId)
				.then((response) => {
					this.isSyncing = false;
					this.loaderMessage = null;
				})
		},

		draggingIntoRoot() {
			this.isRootActive = true;
		},

		async saveFolder(folder) {
			this.isSyncing = true;
			this.loaderMessage = `Saving '${folder.name}'. Please wait...`
			await api.saveFolder(SERVERADDRESS, this.token,folder)
				.then((response) => {
					this.isSyncing = false;
					folder.isNew = false;
					folder.id = response.data._id;
					this.loaderMessage = null;
				})
		},

		// Get Applets in a folder
		async getAppletsInFolder(folder) {
			return await api.getAppletsInFolder(SERVERADDRESS, this.token, folder.id)
		},

		// Updates the parent directory of a folder
		async changeFolder(previousFolder, newFolder, applet) {
			this.isSyncing = true;
			return await api.removeApplet(SERVERADDRESS, this.token, previousFolder.id, applet.id)
					.then(async (response) => {
						// then add applet to new Folder
						await api.addAppletToFolder(SERVERADDRESS, this.token, newFolder.id, applet.id);
						this.isSyncing = false;
					})
		},

		async addAppletToFolder(applet, folder) {
			this.isSyncing = true;
			const response = await api.addAppletToFolder(SERVERADDRESS, this.token, folder.id, applet.id);
			this.isSyncing = false;
			return response;
		},

		async removeAppletFromFolder(applet) {
			return await api.removeApplet(SERVERADDRESS, this.token, applet.parentId, applet.id)
		},

		async loadFolderData() {
			const currentAccount = this.$store.state.currentAccount;

	    	const folders = currentAccount.folders;	

	    	const loadedFolders = []
	    	const allAppletsInFolders = [];

	    	if (folders) {
		    	for (var i = folders.length - 1; i >= 0; i--) {
		    		const folder = folders[i];
		    		const loadedFolder = await this.setAppletsInFolder(folder);

		    		allAppletsInFolders.push(...loadedFolder.items);
		    		loadedFolders.push(loadedFolder)
		    	}
	    	}

	    	return { allFoldersForCurrentAccount: loadedFolders, allAppletsInFolders };
		},

		async setAppletsInFolder(folder) {
			folder.isFolder = true;
    		this.$set(folder, 'items', [])
    		
    		await this.getAppletsInFolder(folder).then((res) => {
    			if (res.data.length > 0) {
    				folder.items = res.data.map(applet => this.setAppletDirectoryProperties(applet, false));
    				this.removeDuplicateApplets(folder);
    			}
    		}).catch((error) => {
    			return folder;
    		});

    		return folder;	
		},

		removeDuplicateApplets(folder) {
			const hash = {}
			if (folder.items.length == 0) return;

			folder.items.forEach(applet => {
				if (hash[applet.id]) return;

				hash[applet.id] = applet
			})

			folder.items = Object.values(hash);
		},

		async getOrganisedAppletsDirectory() {
			const { allFoldersForCurrentAccount, allAppletsInFolders } = await this.loadFolderData();


			let fullDirectory = [...allFoldersForCurrentAccount]

			const currentAccount = this.$store.state.currentAccount;
	    	let appletsNotInFolders = currentAccount.applets;

	    	const allAppletsInCurrentAccount = [...allAppletsInFolders]

	    	if (appletsNotInFolders && Array.isArray(appletsNotInFolders)) {
		    	appletsNotInFolders = appletsNotInFolders.map(applet => {
		    		return this.setAppletDirectoryProperties(applet, true)
		    	})
	    		allAppletsInCurrentAccount.push(...appletsNotInFolders)
	    		fullDirectory.push(...appletsNotInFolders);
	    	}

	    	return  { fullDirectory, appletsOnly: allAppletsInCurrentAccount }
		},

		setAppletDirectoryProperties(appletInfo, isExpanded) {
			if (!appletInfo.name) {
				appletInfo.name = appletInfo.applet.displayName;
			}

			if (!appletInfo.id) {
				appletInfo.id = appletInfo.applet._id.split("/")[1]
			}
			if (!appletInfo.encryption) { 
				appletInfo.encryption =  appletInfo.applet.encryption;
			}
			this.$set(appletInfo, "isExpanded", isExpanded)

			return {
    			...appletInfo,
    			items: [],
    			isFolder: false
    		}
		},

		async moveAppletToRootDirectory(applet) {
			this.isSyncing = true;
			 const userId = this.$store.state.currentUser['_id']

			this.loaderMessage = `Saving '${applet.name}' in root directory. Please wait...`
			await api.removeApplet(SERVERADDRESS, this.token, applet.parentId, applet.id)
				.then(async (response) => {
					this.isSyncing = false;
				})
		}
	},

	computed: {
		apiHost() {
			return this.$store.state.backend;
		},
		token() {
			return this.$store.state.auth.authToken.token;
		},
	}
}