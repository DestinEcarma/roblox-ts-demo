import { character } from "../Components/Character";
import { Chunk } from "@/shared/Chunk";
import { Controller, OnStart } from "@flamework/core";
import { RunService, Workspace } from "@rbxts/services";

interface PendingMine {
	position: Vector3;
	damage: number;
}

@Controller()
class GeneratorController implements OnStart {
	private static readonly RANGE = 4;
	private static readonly MAX_LOADS_PER_STEP = 16;

	private static readonly DIRECTIONS = [
		new Vector3(1, 0, 0),
		new Vector3(-1, 0, 0),
		new Vector3(0, 1, 0),
		new Vector3(0, -1, 0),
		new Vector3(0, 0, 1),
		new Vector3(0, 0, -1),
	];

	private static desired = new Set<string>();
	private static lastChunkPos?: Vector3;
	private static queueToLoad = new Array<{ key: string; position: Vector3 }>();
	private static queueToUnload = new Array<string>();
	private static moveDebounce = false;

	private static pendingMine = new Map<string, PendingMine[]>();

	static folder = new Instance("Folder", Workspace);
	static chunks = new Map<string, Chunk>();

	onStart() {
		RunService.Heartbeat.Connect(() => GeneratorController.processQueues());

		character.Moved.Connect((worldPos) => {
			if (GeneratorController.moveDebounce) return;

			GeneratorController.moveDebounce = true;
			task.defer(() => (GeneratorController.moveDebounce = false));

			const currentChunk = Chunk.InChunkPosition(worldPos);

			if (!GeneratorController.lastChunkPos || currentChunk !== GeneratorController.lastChunkPos) {
				GeneratorController.lastChunkPos = currentChunk;
				GeneratorController.recomputeDesired(currentChunk);
			}
		});

		const startPos = Vector3.zero;
		const startChunk = Chunk.InChunkPosition(startPos);

		GeneratorController.lastChunkPos = startChunk;
		GeneratorController.recomputeDesired(startChunk);
	}

	static MineBlock(position: Vector3, damage: number) {
		const key = tostring(Chunk.InChunkPosition(position));
		const chunk = GeneratorController.chunks.get(key);

		if (chunk) {
			chunk.MineBlock(position, damage);
		} else {
			let list = GeneratorController.pendingMine.get(key);

			if (!list) {
				list = [];
				GeneratorController.pendingMine.set(key, list);
			}

			list.push({ position, damage });
		}
	}

	// TODO: Change rendering method to use Quadtree, not Octree since we need all Y-axis chunk to be loaded
	// ERROR: Issue with current method causes the chunk to unload where the player is standing
	private static recomputeDesired(center: Vector3) {
		const nextDesired = new Set<string>();

		for (let x = center.X - GeneratorController.RANGE; x <= center.X + GeneratorController.RANGE; x++) {
			for (let y = center.Y - GeneratorController.RANGE; y <= 0; y++) {
				for (let z = center.Z - GeneratorController.RANGE; z <= center.Z + GeneratorController.RANGE; z++) {
					const position = new Vector3(x, y, z);
					const key = tostring(position);

					nextDesired.add(key);

					const chunk = GeneratorController.chunks.get(key);

					if (!chunk || !chunk.isLoaded()) {
						GeneratorController.queueToLoad.push({ key, position });
					}
				}
			}
		}

		for (const [key] of GeneratorController.chunks) {
			if (!nextDesired.has(key)) GeneratorController.queueToUnload.push(key);
		}

		GeneratorController.desired = nextDesired;
		GeneratorController.sortLoadQueueByDistance(center);
	}

	private static processQueues() {
		let unloadBudget = math.floor(GeneratorController.MAX_LOADS_PER_STEP / 2);

		while (unloadBudget-- > 0 && GeneratorController.queueToUnload.size() > 0) {
			const key = GeneratorController.queueToUnload.remove(0);

			if (key !== undefined) {
				const chunk = GeneratorController.chunks.get(key);
				if (!chunk) continue;

				chunk.unload();
			}
		}

		let loadBudget = GeneratorController.MAX_LOADS_PER_STEP;

		while (loadBudget-- > 0 && GeneratorController.queueToLoad.size() > 0) {
			const removed = GeneratorController.queueToLoad.remove(0);
			if (!removed) continue;
			if (!GeneratorController.desired.has(removed.key)) continue;

			const cached = GeneratorController.chunks.get(removed.key);
			if (cached) {
				if (!cached.isLoaded()) {
					cached.load(GeneratorController.folder);
				}

				continue;
			}

			const newChunk = new Chunk(removed.position);

			if (removed.position.Y === 0) {
				newChunk.GenerateSurface();
			}

			for (const dir of GeneratorController.DIRECTIONS) {
				const neighbor = removed.position.add(dir);
				const neighborChunk = GeneratorController.chunks.get(tostring(neighbor));
				if (!neighborChunk) continue;

				newChunk.AddNeighbor(neighborChunk);
				neighborChunk.AddNeighbor(newChunk);
			}

			const list = GeneratorController.pendingMine.get(removed.key);

			if (list && list.size() > 0) {
				list.forEach(({ position, damage }) => newChunk.MineBlock(position, damage));
				GeneratorController.pendingMine.delete(removed.key);
			}

			newChunk.load(GeneratorController.folder);
			GeneratorController.chunks.set(removed.key, newChunk);
		}
	}

	private static sortLoadQueueByDistance(center: Vector3) {
		GeneratorController.queueToLoad.sort(
			(a, b) => a.position.sub(center).Magnitude < b.position.sub(center).Magnitude,
		);
	}
}

export { GeneratorController };
