import { Workspace } from "@rbxts/services";

type BaseSignals = {
	spawned: BindableEvent<(character: Model) => void>;
	humanoidAdded: BindableEvent<(humanoid: Humanoid) => void>;
	rootPart: BindableEvent<(rootPart: BasePart) => void>;
};

class Character<S extends Record<string, BindableEvent>> {
	protected connections = new Array<RBXScriptConnection>();
	protected signals = {
		spawned: new Instance("BindableEvent"),
		humanoidAdded: new Instance("BindableEvent"),
		rootPart: new Instance("BindableEvent"),
	} as BaseSignals & S;

	readonly Spawned = this.signals.spawned.Event;
	readonly HumanoidAdded = this.signals.humanoidAdded.Event;
	readonly RootPartAdded = this.signals.rootPart.Event;

	RootPart?: BasePart;

	constructor(player: Player) {
		if (player.Character?.IsDescendantOf(Workspace)) {
			// Fire if there is already a character and it's parent is Workspace
			this.fireSpawned(player.Character);

			// Fire if character already contains a Humanoid
			const humanoid = player.Character.FindFirstChildOfClass("Humanoid");
			if (humanoid) this.fireHumanoidAdded(humanoid);

			// Fire if character already contains a RootPart
			const rootPart = player.Character.PrimaryPart;
			if (rootPart) this.fireRootPartAdded(rootPart);
		}

		// Track when a new character is added
		this.connections.push(player.CharacterAdded.Connect(this.onCharacterAdded));

		// Track when character has spawned
		this.connections.push(this.Spawned.Connect(this.onSpawned));

		// Disconnect the connection when the player's parent is not Players
		this.connections.push(player.AncestryChanged.Connect(this.onAncestoryChanged));
	}

	readonly Destroy = () => {
		this.connections.forEach((connection) => connection.Disconnect());
		this.connections.clear();

		for (const [, signal] of pairs(this.signals as Record<string, BindableEvent>)) {
			signal.Destroy();
		}
	};

	private fireSpawned = (character: Model) => {
		this.signals.spawned.Fire(character);
	};

	private fireHumanoidAdded = (humanoid: Humanoid) => {
		this.signals.humanoidAdded.Fire(humanoid);
	};

	private fireRootPartAdded = (humanoidRootPart: BasePart) => {
		this.signals.rootPart.Fire(humanoidRootPart);
	};

	private onCharacterAdded = (character: Model) => {
		if (character?.IsDescendantOf(Workspace)) {
			// Fire if the character's parent is already Workspace
			this.fireSpawned(character);
		} else {
			// Fire once the character's parent is Workspace
			const connection = character.AncestryChanged.Connect((_, parent) => {
				if (parent?.IsA("Workspace")) {
					connection.Disconnect();
					task.wait();
					this.fireSpawned(character);
				}
			});
		}
	};

	private onSpawned = (character: Model) => {
		const humanoid = character.FindFirstChildOfClass("Humanoid");

		if (humanoid) {
			// Fire if character already contains a Humanoid
			this.fireHumanoidAdded(humanoid);
		} else {
			// Fire once the humanoid is added
			const connection = character.ChildAdded.Connect((child) => {
				if (child.IsA("Humanoid")) {
					connection.Disconnect();
					this.fireHumanoidAdded(child);
				}
			});
		}

		const rootPart = character.PrimaryPart;

		// Fire if character already contains a RootPart
		if (rootPart) {
			this.RootPart = rootPart;
			this.fireRootPartAdded(rootPart);
		} else {
			// Fire once the primary part is added
			const connection = character.GetPropertyChangedSignal("PrimaryPart").Connect(() => {
				if (character.PrimaryPart) {
					connection.Disconnect();
					this.RootPart = character.PrimaryPart;
					this.fireRootPartAdded(character.PrimaryPart);
				}
			});
		}
	};

	private onAncestoryChanged = (_: Instance, parent?: Instance) => {
		if (!parent?.IsA("Players")) {
			this.Destroy();
		}
	};
}

export { Character };
