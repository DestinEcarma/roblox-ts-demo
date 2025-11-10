import { TextButton } from "./ui/TextButton";
import { character } from "@/client/Components/Character";
import React from "@rbxts/react";

function TeleportSurface() {
	return (
		<TextButton
			AnchorPoint={new Vector2(0, 1)}
			Position={new UDim2(0, 10, 1, -10)}
			Text={"Teleport Surface"}
			onClick={() => {
				character.Model?.PivotTo(new CFrame(0, 10, 0));
			}}
		/>
	);
}

export { TeleportSurface };
