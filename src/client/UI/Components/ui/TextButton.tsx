import React from "@rbxts/react";

interface TextButtonProps extends React.InstanceProps<TextButton> {
	uiStrokeOuter: React.InstanceProps<UIStroke>;
	uiStrokeOuterDisabled: boolean;

	uiStrokeInner: React.InstanceProps<UIStroke>;
	uiStrokeInnerDisabled: boolean;

	uiCornerSize: UDim;
	uiCornerDisabled: boolean;

	onClick: () => void;
}

function TextButton(props: Partial<TextButtonProps>) {
	const onClick = props.onClick;
	const uiCornerSize = props.uiCornerSize;
	const uiStrokeOuter = props.uiStrokeOuter ?? ({} as React.InstanceProps<UIStroke>);
	const uiStrokeInner = props.uiStrokeInner ?? ({} as React.InstanceProps<UIStroke>);

	const uiCornerDisabled = props.uiCornerDisabled ?? false;
	const uiStrokeOuterDisabled = props.uiStrokeOuterDisabled ?? false;
	const uiStrokeInnerDisabled = props.uiStrokeInnerDisabled ?? false;

	props.onClick = undefined;
	props.uiCornerSize = undefined;
	props.uiStrokeOuter = undefined;
	props.uiStrokeInner = undefined;

	props.uiCornerDisabled = undefined;
	props.uiStrokeOuterDisabled = undefined;
	props.uiStrokeInnerDisabled = undefined;

	return (
		<textbutton
			AnchorPoint={new Vector2(0.5, 0.5)}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={UDim2.fromOffset(200, 50)}
			Font="FredokaOne"
			FontSize="Size24"
			RichText={true}
			TextColor3={new Color3(1, 1, 1)}
			BackgroundColor3={new Color3(0.2, 0.2, 0.2)}
			Event={{ MouseButton1Click: onClick }}
			{...props}
		>
			{!uiStrokeOuterDisabled && (
				<uistroke
					Color={new Color3(1, 1, 1)}
					Thickness={2}
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					{...uiStrokeOuter}
				/>
			)}
			{!uiStrokeInnerDisabled && (
				<uistroke
					Color={new Color3()}
					Thickness={2}
					Transparency={0.75}
					ApplyStrokeMode={Enum.ApplyStrokeMode.Contextual}
					{...uiStrokeInner}
				/>
			)}
			{!uiCornerDisabled && <uicorner CornerRadius={uiCornerSize ?? new UDim(0, 10)} />}
		</textbutton>
	);
}

export { TextButton };
