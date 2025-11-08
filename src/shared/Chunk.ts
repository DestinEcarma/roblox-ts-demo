import { Block } from "./Block";
import { Workspace } from "@rbxts/services";

class Chunk {
	private static readonly CHUNK_SIZE = new Vector3(9, 9, 9);
	private static readonly CHUNK_WORLD_SIZE = Chunk.CHUNK_SIZE.mul(Block.BLOCK_SIZE);
	private static readonly HALF_CHUNK_WORLD_SIZE = Chunk.CHUNK_WORLD_SIZE.div(2);
	private static readonly ORIGIN = new Vector3(
		-Chunk.HALF_CHUNK_WORLD_SIZE.X,
		-Chunk.CHUNK_WORLD_SIZE.Y,
		-Chunk.HALF_CHUNK_WORLD_SIZE.Z,
	);
	private static readonly DIRECTIONS = [
		new Vector3(1, 0, 0).mul(Block.BLOCK_SIZE),
		new Vector3(-1, 0, 0).mul(Block.BLOCK_SIZE),
		new Vector3(0, 1, 0).mul(Block.BLOCK_SIZE),
		new Vector3(0, -1, 0).mul(Block.BLOCK_SIZE),
		new Vector3(0, 0, 1).mul(Block.BLOCK_SIZE),
		new Vector3(0, 0, -1).mul(Block.BLOCK_SIZE),
	];

	private chunk: Vector3;
	private folder: Folder;

	private neighbors = new Map<string, Chunk>();

	private pendingMine = new Map<string, number>();
	private pendingGenerate = new Map<string, Vector3[]>();

	private blocks = new Map<string, Block>();
	private generatedBlocks = new Map<string, boolean>();

	constructor(chunk: Vector3) {
		this.chunk = chunk;
		this.folder = new Instance("Folder");
	}

	GenerateSurface() {
		for (let x = 0; x < Chunk.CHUNK_SIZE.X; x++) {
			for (let z = 0; z < Chunk.CHUNK_SIZE.Z; z++) {
				const chunkPosition = this.chunk.mul(Chunk.CHUNK_WORLD_SIZE);
				const blockPosition = new Vector3(x, Chunk.CHUNK_SIZE.Y - 1, z)
					.mul(Block.BLOCK_SIZE)
					.add(Block.HALF_BLOCK_SIZE);
				const position = Chunk.ORIGIN.add(chunkPosition.add(blockPosition));

				this.createBlock(position);
			}
		}
	}

	GenerateBlock(position: Vector3) {
		const chunkPosition = Chunk.InChunkPosition(position);

		if (this.chunk !== chunkPosition) {
			const key = Chunk.key(chunkPosition);
			const neighbor = this.neighbors.get(key);

			if (neighbor) {
				neighbor.GenerateBlockLocal(position);
			} else {
				let list = this.pendingGenerate.get(key);

				if (!list) {
					list = [];
					this.pendingGenerate.set(key, list);
				}

				list.push(position);
			}

			return;
		}

		this.GenerateBlockLocal(position);
	}

	GenerateBlockLocal(position: Vector3) {
		const blockPosition = Block.InBlockPosition(position);

		if (blockPosition.Y > 0) return;
		if (this.generatedBlocks.has(Chunk.key(blockPosition))) return;

		this.createBlock(position);
	}

	AddNeighbor(chunk: Chunk) {
		const key = Chunk.key(chunk.chunk);
		this.neighbors.set(key, chunk);

		const list = this.pendingGenerate.get(key);
		if (!(list && list.size() > 0)) return;

		list.forEach((position) => chunk.GenerateBlockLocal(position));
		this.pendingGenerate.delete(key);
	}

	MineBlock(position: Vector3, damage: number) {
		const key = Chunk.key(Block.InBlockPosition(position));
		const block = this.blocks.get(key);

		if (!block) {
			this.pendingMine.set(key, (this.pendingMine.get(key) ?? 0) + damage);

			return;
		}

		if (!block.Mine(damage)) return;

		this.blocks.delete(key);
		this.genereateNeighborBlocks(position);
	}

	// TODO: Remove this
	setColor(color: Color3) {
		const parent = this.folder.Parent;

		this.unload();
		this.blocks.forEach((block) => block.setColor(color));
		if (parent) this.load(parent);
	}

	isLoaded() {
		return this.folder.Parent?.IsDescendantOf(Workspace);
	}

	load(parent: Instance) {
		this.folder.Parent = parent;
	}

	unload() {
		this.folder.Parent = undefined;
	}

	static InChunkPosition(position: Vector3) {
		return position.sub(Chunk.ORIGIN).div(Chunk.CHUNK_WORLD_SIZE).Floor();
	}

	private genereateNeighborBlocks(position: Vector3) {
		for (const dir of Chunk.DIRECTIONS) {
			const neighborPosition = position.add(dir);
			this.GenerateBlock(neighborPosition);
		}
	}

	private createBlock(position: Vector3) {
		const block = new Block(position, 100);
		const key = Chunk.key(Block.InBlockPosition(position));

		this.generatedBlocks.set(key, true);

		const pendingDamage = this.pendingMine.get(key);

		if (pendingDamage !== undefined) {
			if (block.Mine(pendingDamage)) this.genereateNeighborBlocks(position);
			this.pendingMine.delete(key);
		}

		if (block.Health > 0) {
			block.setParent(this.folder);
			this.blocks.set(key, block);
		}
	}

	private static key(position: Vector3) {
		return tostring(position);
	}
}

export { Chunk };
