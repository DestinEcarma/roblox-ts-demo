import { character } from "../Modules/Character";
import { Controller, OnStart } from "@flamework/core";
import { UserInputService } from "@rbxts/services";

@Controller({})
class SprintController implements OnStart {
	private humanoid?: Humanoid;

	onStart() {
		UserInputService.InputBegan.Connect(this.onInputBegan);
		UserInputService.InputEnded.Connect(this.onInputEnded);
		character.HumanoidAdded.Connect(this.onHumanoidAdded);
	}

	private onHumanoidAdded = (humanoid: Humanoid) => {
		this.humanoid = humanoid;

		const conneciton = humanoid.Died.Connect(() => {
			conneciton.Disconnect();
			this.humanoid = undefined;
		});
	};

	private onInputBegan = (input: InputObject) => {
		if (input.KeyCode !== Enum.KeyCode.LeftShift) return;
		if (this.humanoid) this.humanoid.WalkSpeed = 32;
	};

	private onInputEnded = (input: InputObject) => {
		if (input.KeyCode !== Enum.KeyCode.LeftShift) return;
		if (this.humanoid) this.humanoid.WalkSpeed = 16;
	};
}

export { SprintController };
