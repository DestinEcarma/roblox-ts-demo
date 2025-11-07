import { InventoryEvent } from "../Components/Networks";
import { Controller, OnStart } from "@flamework/core";
import Log from "@rbxts/log";

@Controller()
class InventoryController implements OnStart {
	onStart() {
		InventoryEvent.SetPickaxe.connect((rawPickaxe) => {
			Log.Info(`${rawPickaxe.name}`);
		});
	}
}

export { InventoryController };
