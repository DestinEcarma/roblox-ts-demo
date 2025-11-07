import { character } from "./Character";
import { Debris, UserInputService, Workspace } from "@rbxts/services";

const Camera = Workspace.CurrentCamera;

interface RaycastDebug {
	Size: Vector3;
	Material: Enum.Material;
	Color: Color3;
	Shape: Enum.PartType;
	Transparency: number;
}

class Mouse {
	private static raycastParams = new RaycastParams();

	static {
		this.raycastParams = new RaycastParams();
		this.raycastParams.FilterDescendantsInstances = [Workspace.Debug, character.Model as Instance];
		this.raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
	}

	static GetMouseRay() {
		if (!Camera) return;

		const mouseLocation = UserInputService.GetMouseLocation();

		return Camera.ViewportPointToRay(mouseLocation.X, mouseLocation.Y, 1);
	}

	static GetWorldSpacePosition(distance: number, raycastParams = this.raycastParams) {
		const ray = Mouse.GetMouseRay();
		if (!ray)
			return {
				position: Vector3.zero,
				ray: new Ray(),
			};

		const result = Workspace.Raycast(ray.Origin, ray.Direction.mul(distance), raycastParams);

		return {
			ray,
			position: result ? result.Position : ray.Origin.add(ray.Direction.mul(distance)),
		};
	}

	static GetWorldInstance(distance: number, raycastParams = this.raycastParams) {
		const ray = Mouse.GetMouseRay();
		if (!ray) return;

		const result = Workspace.Raycast(ray.Origin, ray.Direction.mul(distance), raycastParams);
		if (!result) return;

		return result.Instance;
	}

	static RaycastDebugPoint(position: Vector3, debugConfig?: RaycastDebug) {
		const pointPart = new Instance("Part");

		pointPart.Position = position;
		pointPart.Size = debugConfig?.Size ?? new Vector3(0.25, 0.25, 0.25);
		pointPart.Material = debugConfig?.Material ?? Enum.Material.Neon;
		pointPart.Color = debugConfig?.Color ?? new Color3(0, 1, 0);
		pointPart.Shape = debugConfig?.Shape ?? Enum.PartType.Ball;
		pointPart.Transparency = debugConfig?.Transparency ?? 0;
		pointPart.CanCollide = false;
		pointPart.CanTouch = false;
		pointPart.CanQuery = false;
		pointPart.Anchored = true;
		pointPart.Parent = Workspace.Debug;

		Debris.AddItem(pointPart, 1);
	}
}

export { Mouse };
