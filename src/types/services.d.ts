interface ServerScriptService extends Instance {
	TS: Folder & {
		Services: Folder;
	};
}

interface Player extends Instance {
	PlayerScripts: PlayerScripts & {
		TS: Folder & {
			Modules: Folder;
		};
	};
}
