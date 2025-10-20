import { Character } from "@/shared/Character";
import { Players, RunService } from "@rbxts/services";

class ClientCharacter extends Character<{ moved: BindableEvent<(position: Vector3) => void> }> {
	Moved: RBXScriptSignal<(position: Vector3) => void>;

	constructor(player: Player) {
		super(player);

		this.signals.moved = new Instance("BindableEvent");
		this.Moved = this.signals.moved.Event;

		this.setMovedEvent();
	}

	private setMovedEvent = () => {
		let previousPosition = Vector3.zero;

		this.connections.push(
			RunService.Heartbeat.Connect(() => {
				if (!this.RootPart) return;

				const position = this.RootPart.Position;

				if (previousPosition !== position) {
					previousPosition = position;
					this.signals.moved.Fire(position);
				}
			}),
		);
	};
}

const character = new ClientCharacter(Players.LocalPlayer);

export { character };
