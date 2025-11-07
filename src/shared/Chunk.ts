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

	private folder: Folder;
	private blocks: Array<Block> = new Array(Chunk.CHUNK_SIZE.X * Chunk.CHUNK_SIZE.Y * Chunk.CHUNK_SIZE.Z);

	constructor(chunk: Vector3) {
		this.folder = new Instance("Folder");

		for (let x = 0; x < Chunk.CHUNK_SIZE.X; x++) {
			for (let y = 0; y < Chunk.CHUNK_SIZE.Y; y++) {
				for (let z = 0; z < Chunk.CHUNK_SIZE.Z; z++) {
					const chunkPosition = chunk.mul(Chunk.CHUNK_WORLD_SIZE);
					const blockPosition = new Vector3(x, y, z).mul(Block.BLOCK_SIZE).add(Block.HALF_BLOCK_SIZE);

					const block = new Block(Chunk.ORIGIN.add(chunkPosition.add(blockPosition)), 100);
					block.setParent(this.folder);

					this.blocks.push(block);
				}
			}
		}
	}

	readonly setColor = (color: Color3) => {
		const parent = this.folder.Parent;

		this.unload();
		this.blocks.forEach((block) => block.setColor(color));
		if (parent) this.load(parent);
	};

	readonly isLoaded = () => {
		return this.folder.Parent?.IsDescendantOf(Workspace);
	};

	readonly load = (parent: Instance) => {
		this.folder.Parent = parent;
	};

	readonly unload = () => {
		this.folder.Parent = undefined;
	};

	static InChunkPosition = (position: Vector3) => {
		return position.sub(Chunk.ORIGIN).div(Chunk.CHUNK_WORLD_SIZE).Floor();
	}

	private createBlock(inChunkPosition: Vector3) {
		const chunkPosition = this.chunk.mul(Chunk.CHUNK_WORLD_SIZE);
		const blockPosition = new Vector3(x, Chunk.CHUNK_SIZE.Y - 1, z)
			.mul(Block.BLOCK_SIZE)
			.add(Block.HALF_BLOCK_SIZE);
		const position = Chunk.ORIGIN.add(chunkPosition.add(blockPosition));

		const block = new Block(position, 100);

		const key = Chunk.key(Block.InBlockPosition(position));
		this.blocks.set(key, block);
	}

	private static key(position: Vector3) {
		return `${position.X},${position.Y},${position.Z}`;
	}
}

export { Chunk };
