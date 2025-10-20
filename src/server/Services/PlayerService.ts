import { Character } from "@/shared/Character";
import { OnStart, Service } from "@flamework/core";
import Log from "@rbxts/log";
import { Players } from "@rbxts/services";

@Service()
class PlayerService implements OnStart {
	private static subscribers = new Map<number, RBXScriptConnection>();

	onStart() {
		Players.GetPlayers().forEach(PlayerService.onPlayerAdded);
		Players.PlayerAdded.Connect(PlayerService.onPlayerAdded);
		Players.PlayerRemoving.Connect(PlayerService.onPlayerRemoving);
	}

	private static onSpawned = (character: Model) => {
		Log.Info(`${character} has spawned`);

		const humanoid = character.FindFirstChildOfClass("Humanoid");
		if (!humanoid) return Log.Error(`Unable to find ${character}'s Humanoid`);

		const connection = humanoid.Died.Connect(() => {
			connection.Disconnect();
			Log.Info(`${character} has died`);
		});

		character.PivotTo(new CFrame(0, 2, 0));
	};

	private static onPlayerAdded = (player: Player) => {
		Log.Info(`${player} has joined the game`);

		PlayerService.subscribers.set(player.UserId, new Character(player).Spawned.Connect(PlayerService.onSpawned));
	};

	private static onPlayerRemoving = (player: Player) => {
		Log.Info(`${player} has left the game`);

		PlayerService.subscribers.get(player.UserId)?.Disconnect();
		PlayerService.subscribers.delete(player.UserId);
	};
}

export { PlayerService };
