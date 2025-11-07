import { InventoryEvent, MiningEvent } from "../Components/Networks";
import { PlayerService } from "./PlayerService";
import { Pickaxe } from "@/shared/Pickaxe";
import { OnStart, Service } from "@flamework/core";
import Log from "@rbxts/log";

@Service()
class MiningService implements OnStart {
	private static pickaxe = new Map<number, Pickaxe>();

	onStart() {
		MiningEvent.Mine.connect(MiningService.onMine);
		PlayerService.PlayerLeft.Connect(MiningService.onPlayerLeft);
	}

	static setPickaxe(player: Player, pickaxe: Pickaxe) {
		MiningService.pickaxe.set(player.UserId, pickaxe);
		InventoryEvent.SetPickaxe.fire(player, Pickaxe.Deserialize(pickaxe));
	}

	private static onMine = (player: Player, position: Vector3) => {
		const pickaxe = MiningService.pickaxe.get(player.UserId);
		if (!pickaxe) return Log.Warn(`${player} does not contain a pickaxe`);

		MiningEvent.Mined.except(player, position, pickaxe.damage);
	};

	private static onPlayerLeft = (player: Player) => {
		MiningService.pickaxe.delete(player.UserId);
	};
}

export { MiningService };
