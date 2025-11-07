import { MiningService } from "./MiningService";
import { PlayerService } from "./PlayerService";
import { Pickaxe } from "@/shared/Pickaxe";
import { OnStart, Service } from "@flamework/core";

@Service()
class InventoryService implements OnStart {
	onStart() {
		PlayerService.PlayerJoined.Connect(InventoryService.onPlayerJoined);
	}

	private static onPlayerJoined = (player: Player) => {
		// TODO: Remove this
		const pickaxe = new Pickaxe("Stone Pickaxe", math.huge);
		const tool = new Instance("Tool");

		tool.Name = pickaxe.name;

		MiningService.setPickaxe(player, pickaxe);

		task.wait(2);
		tool.Parent = player.Backpack;
	};
}

export { InventoryService };
