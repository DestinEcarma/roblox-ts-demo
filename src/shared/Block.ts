class Block {
	static readonly BLOCK_SIZE = new Vector3(8, 8, 8);
	static readonly HALF_BLOCK_SIZE = Block.BLOCK_SIZE.div(2);
	static readonly HALF_XZ_BLOCK_SIZE = new Vector3(
		Block.HALF_BLOCK_SIZE.X,
		Block.BLOCK_SIZE.Y,
		Block.HALF_BLOCK_SIZE.Z,
	);

	private static template: Part;

	static {
		const template = new Instance("Part");
		template.Size = Block.BLOCK_SIZE;
		template.Material = Enum.Material.Slate;
		template.Anchored = true;

		Block.template = template;
	}

	private block = Block.template.Clone();

	constructor(
		position: Vector3,
		public Health: number,
	) {
		this.block.Position = position;
	}

	Mine(damage: number) {
		if (this.Health > 0) {
			this.Health = math.clamp(this.Health - damage, 0, this.Health);

			if (this.Health === 0) {
				this.block.Destroy();
				return true;
			}
		}

		return false;
	}

	setParent(parent: Instance) {
		this.block.Parent = parent;
	}

	setColor(color: Color3) {
		this.block.Color = color;
	}

	Destroy() {
		this.block.Destroy();
	}

	static InBlockPosition(position: Vector3) {
		return position.add(Block.HALF_XZ_BLOCK_SIZE).div(Block.BLOCK_SIZE).Floor();
	}
}

export { Block };
