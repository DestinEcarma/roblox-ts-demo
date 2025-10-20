class Block {
	static readonly BLOCK_SIZE = new Vector3(8, 8, 8);
	static readonly HALF_BLOCK_SIZE = Block.BLOCK_SIZE.div(2);

	private static template: Part;

	static {
		const template = new Instance("Part");
		template.Size = Block.BLOCK_SIZE;
		template.Material = Enum.Material.Slate;
		template.Anchored = true;

		Block.template = template;
	}

	private block: Part;

	Health: number;

	constructor(position: Vector3, health: number) {
		this.block = Block.template.Clone();
		this.Health = health;

		this.block.CFrame = new CFrame(position);
	}

	readonly Mine = (damage: number) => {
		if (this.Health > 0) {
			this.Health = math.clamp(this.Health - damage, 0, this.Health);
		}
	};

	readonly setParent = (parent: Instance) => {
		this.block.Parent = parent;
	};

	readonly setColor = (color: Color3) => {
		this.block.Color = color;
	};

	static InBlockPosition = (position: Vector3) => {
		return position.add(Block.HALF_BLOCK_SIZE).div(Block.BLOCK_SIZE).Floor();
	};
}

export { Block };
