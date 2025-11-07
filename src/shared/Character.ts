import { Workspace } from "@rbxts/services";
import { Trove } from "@rbxts/trove";

type BaseSignals = {
	spawned: BindableEvent<(character: Model) => void>;
	humanoidAdded: BindableEvent<(humanoid: Humanoid) => void>;
	rootPart: BindableEvent<(rootPart: BasePart) => void>;
};

class Character<S extends Record<string, BindableEvent>> {
	protected trove = new Trove();
	protected signals = {
		spawned: new Instance("BindableEvent"),
		humanoidAdded: new Instance("BindableEvent"),
		rootPart: new Instance("BindableEvent"),
	} as BaseSignals & S;

	readonly Spawned = this.signals.spawned.Event;
	readonly HumanoidAdded = this.signals.humanoidAdded.Event;
	readonly RootPartAdded = this.signals.rootPart.Event;

	Model?: Model;
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

		// Set Model to character when character spawned
		this.trove.connect(this.Spawned, (character) => (this.Model = character));

		// Track when a new character is added
		this.trove.connect(player.CharacterAdded, this.onCharacterAdded);

		// Track when character has spawned
		this.trove.connect(this.Spawned, this.onSpawned);

		// Add signals to trove to handle clean up
		this.trove.add(this.signals.humanoidAdded);
		this.trove.add(this.signals.rootPart);
		this.trove.add(this.signals.spawned);
	}

	Destroy() {
		this.trove.clean();
	}

	private fireSpawned(character: Model) {
		this.signals.spawned.Fire(character);
	}

	private fireHumanoidAdded(humanoid: Humanoid) {
		this.signals.humanoidAdded.Fire(humanoid);
	}

	private fireRootPartAdded(humanoidRootPart: BasePart) {
		this.signals.rootPart.Fire(humanoidRootPart);
	}

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
					this.trove.remove(connection);
				}
			});

			// Add to trove just in-case the conneciton was never disconnected
			this.trove.add(connection);
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
}

export { Character };
