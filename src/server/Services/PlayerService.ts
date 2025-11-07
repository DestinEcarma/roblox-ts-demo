import { OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";

@Service()
class PlayerService implements OnStart {
	private static signals = {
		playerJoined: new Instance("BindableEvent") as BindableEvent<(player: Player) => void>,
		playerLeft: new Instance("BindableEvent") as BindableEvent<(player: Player) => void>,
	};

	static readonly PlayerJoined = PlayerService.signals.playerJoined.Event;
	static readonly PlayerLeft = PlayerService.signals.playerLeft.Event;

	onStart() {
		Players.GetPlayers().forEach(PlayerService.onPlayerAdded);
		Players.PlayerAdded.Connect(PlayerService.onPlayerAdded);
		Players.PlayerRemoving.Connect(PlayerService.onPlayerRemoving);
	}

	private static onPlayerAdded = (player: Player) => {
		PlayerService.signals.playerJoined.Fire(player);
	};

	private static onPlayerRemoving = (player: Player) => {
		PlayerService.signals.playerLeft.Fire(player);
	};
}

export { PlayerService };
