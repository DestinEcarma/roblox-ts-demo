import { character } from "../Components/Character";
import { Mouse } from "../Components/Mouse";
import { MiningEvent } from "../Components/Networks";
import { GeneratorController } from "./GeneratorController";
import { InventoryController } from "./InventoryContoller";
import { Controller, OnStart, OnTick } from "@flamework/core";
import { UserInputService, Workspace } from "@rbxts/services";

@Controller()
class MiningController implements OnStart, OnTick {
	private static raycastParam = new RaycastParams();

	private static highlight = new Instance("SelectionBox");

	private static mineDebounce = false;

	static {
		this.raycastParam.FilterDescendantsInstances = [GeneratorController.folder];
		this.raycastParam.FilterType = Enum.RaycastFilterType.Include;

		this.highlight.Color3 = new Color3(0, 1, 0);
		this.highlight.Parent = Workspace.Debug;
	}

	onStart() {
		MiningEvent.Mined.connect((position, damage) => {
			GeneratorController.MineBlock(position, damage);
		});
	}

	onTick() {
		if (!character.Model?.FindFirstChildOfClass("Tool")?.HasTag("Pickaxe")) {
			MiningController.highlight.Adornee = undefined;
			return;
		}

		const block = Mouse.GetWorldInstance(500, MiningController.raycastParam);

		MiningController.highlight.Adornee = block;

		if (MiningController.mineDebounce) return;
		if (!block) return;
		if (!UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton1)) return;

		MiningController.mineDebounce = true;
		task.defer(() => {
			task.wait(InventoryController.CurrentPickaxe?.speed);
			MiningController.mineDebounce = false;
		});

		Mouse.RaycastDebugPoint(block.Position);
		MiningController.Mine(block.Position);
	}

	private static Mine(position: Vector3) {
		GeneratorController.MineBlock(position, math.huge);
		MiningEvent.Mine.fire(position);
	}
}

export { MiningController };
