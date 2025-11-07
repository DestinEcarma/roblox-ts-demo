import { Mouse } from "../Components/Mouse";
import { MiningEvent } from "../Components/Networks";
import { GeneratorController } from "./GeneratorController";
import { Controller, OnStart } from "@flamework/core";
import { RunService, UserInputService, Workspace } from "@rbxts/services";

@Controller()
class MiningController implements OnStart {
	private static raycastParam = new RaycastParams();

	private static highlight = new Instance("SelectionBox");

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

		let mineDebounce = false;

		RunService.Heartbeat.Connect(() => {
			const block = Mouse.GetWorldInstance(500, MiningController.raycastParam);

			MiningController.highlight.Adornee = block;

			if (mineDebounce) return;
			if (!block) return;
			if (!UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton1)) return;

			mineDebounce = true;
			task.defer(() => {
				// TODO: Use mining speed
				task.wait();
				mineDebounce = false;
			});

			Mouse.RaycastDebugPoint(block.Position);
			MiningController.Mine(block.Position);
		});
	}

	private static Mine(position: Vector3) {
		GeneratorController.MineBlock(position, math.huge);
		MiningEvent.Mine.fire(position);
	}
}

export { MiningController };
