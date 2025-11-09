import { InventoryEvent } from "../Components/Networks";
import { Pickaxe } from "@/shared/Pickaxe";
import { Controller, OnStart } from "@flamework/core";

@Controller()
class InventoryController implements OnStart {
	static CurrentPickaxe?: Pickaxe;

	onStart() {
		InventoryEvent.SetPickaxe.connect((rawPickaxe) => {
			InventoryController.CurrentPickaxe = Pickaxe.Serialize(rawPickaxe);
		});
	}
}

export { InventoryController };
