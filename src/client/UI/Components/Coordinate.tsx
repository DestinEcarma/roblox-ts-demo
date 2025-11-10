import { TextLabel } from "./ui/TextLabel";
import { character } from "@/client/Components/Character";
import { Block } from "@/shared/Block";
import React from "@rbxts/react";
import { useEffect, useState } from "@rbxts/react";

function Coordinate() {
	const [position, setPosition] = useState(Vector3.zero);

	useEffect(() => {
		const conection = character.Moved.Connect((position) => setPosition(Block.InBlockPosition(position)));

		return () => conection.Disconnect();
	}, []);

	return (
		<TextLabel
			AnchorPoint={new Vector2(1, 1)}
			Position={UDim2.fromScale(1, 1)}
			BackgroundTransparency={1}
			Text={`<b>X: ${position.X}, Y: ${position.Y}, Z: ${position.Z}</b>`}
			uiStrokeInner={{ Transparency: 0.5 }}
			uiCornerDisabled={true}
			uiStrokeOuterDisabled={true}
		/>
	);
}

export { Coordinate };
