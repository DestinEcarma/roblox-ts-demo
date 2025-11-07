import { Coordinate } from "../UI/Components/Coordinate";
import { Controller, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";

@Controller()
class GuiController implements OnStart {
	private playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");

	onStart() {
		const root = createRoot(new Instance("Folder"));

		root.render(
			createPortal(
				<screengui ResetOnSpawn={false}>
					<Coordinate />
				</screengui>,
				this.playerGui,
			),
		);
	}
}

export { GuiController };
