interface Workspace extends Instance {
	Debug: Folder;
	BasePart: Part;
}

interface Player extends Instance {
	Backpack: Backpack;
	PlayerGui: PlayerGui;
	PlayerScripts: PlayerScripts & {
		TS: Folder & {
			Modules: Folder;
		};
	};
}

interface ServerScriptService extends Instance {
	TS: Folder & {
		Services: Folder;
	};
}
