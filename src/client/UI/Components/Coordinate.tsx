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
		<textlabel
			AnchorPoint={new Vector2(1, 1)}
			Position={UDim2.fromScale(1, 1)}
			Size={UDim2.fromOffset(200, 50)}
			BackgroundTransparency={1}
			Text={`<b>X: ${position.X}, Y: ${position.Y}, Z: ${position.Z}</b>`}
			Font="FredokaOne"
			FontSize="Size24"
			RichText={true}
			TextStrokeTransparency={0.75}
			TextColor3={new Color3(1, 1, 1)}
		/>
	);
}

export { Coordinate };
