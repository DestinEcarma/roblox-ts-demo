import { character } from "../Components/Character";
import { Chunk } from "@/shared/Chunk";
import { Perlin3DGenerator } from "@/shared/Perlin";
import { Controller, OnStart, OnTick } from "@flamework/core";
import { Workspace } from "@rbxts/services";

interface PendingMine {
	position: Vector3;
	damage: number;
}

@Controller()
class GeneratorController implements OnStart, OnTick {
	private static readonly INNER_RANGE = 2;
	private static readonly OUTER_RANGE = 4;
	private static readonly MAX_OPS_PER_STEP = 2;

	private static readonly DIRECTIONS = [new Vector2(1, 0), new Vector2(-1, 0), new Vector2(0, 1), new Vector2(0, -1)];

	private static outerDesired = new Set<string>();
	private static lastChunkPos?: Vector2;

	private static queueToLoad = new Array<{ key: string; position: Vector2 }>();
	private static queueToUnload = new Array<string>();
	private static loadSeen = new Set<string>();
	private static unloadSeen = new Set<string>();

	private static pendingMine = new Map<string, PendingMine[]>();

	static folder = new Instance("Folder", Workspace);
	static chunks = new Map<string, Chunk>();

	private static caveGenerator = new Perlin3DGenerator();

	onStart() {
		let moveDebounce = false;

		character.Moved.Connect((position) => {
			if (moveDebounce) return;

			moveDebounce = true;
			task.defer(() => (moveDebounce = false));

			const currentChunk = Chunk.InChunkPosition(position);

			if (!GeneratorController.lastChunkPos || currentChunk !== GeneratorController.lastChunkPos) {
				GeneratorController.lastChunkPos = currentChunk;
				GeneratorController.recomputeDesired(currentChunk);
			}
		});
	}

	onTick() {
		GeneratorController.processQueues();
	}

	static Reset() {
		for (const [, chunk] of GeneratorController.chunks) {
			chunk.Destroy();
		}

		GeneratorController.outerDesired.clear();
		GeneratorController.queueToLoad.clear();
		GeneratorController.queueToUnload.clear();
		GeneratorController.loadSeen.clear();
		GeneratorController.unloadSeen.clear();
		GeneratorController.pendingMine.clear();
		GeneratorController.chunks.clear();

		GeneratorController.recomputeDesired(GeneratorController.lastChunkPos ?? Vector2.zero);
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

	private static recomputeDesired(center: Vector2) {
		const evictSet = new Set<string>();
		const loadSet = new Set<string>();

		for (let x = center.X - GeneratorController.OUTER_RANGE; x <= center.X + GeneratorController.OUTER_RANGE; x++) {
			for (
				let y = center.Y - GeneratorController.OUTER_RANGE;
				y <= center.Y + GeneratorController.OUTER_RANGE;
				y++
			) {
				evictSet.add(tostring(new Vector2(x, y)));
			}
		}

		for (let x = center.X - GeneratorController.INNER_RANGE; x <= center.X + GeneratorController.INNER_RANGE; x++) {
			for (
				let y = center.Y - GeneratorController.INNER_RANGE;
				y <= center.Y + GeneratorController.INNER_RANGE;
				y++
			) {
				const pos = new Vector2(x, y);
				const key = tostring(pos);
				loadSet.add(key);

				const chunk = GeneratorController.chunks.get(key);
				if (!chunk || !chunk.isLoaded()) {
					if (!GeneratorController.loadSeen.has(key)) {
						GeneratorController.queueToLoad.push({ key, position: pos });
						GeneratorController.loadSeen.add(key);
					}
				}
			}
		}

		for (const [key] of GeneratorController.chunks) {
			if (!evictSet.has(key) && !GeneratorController.unloadSeen.has(key)) {
				GeneratorController.queueToUnload.push(key);
				GeneratorController.unloadSeen.add(key);
			}
		}

		GeneratorController.outerDesired = evictSet;
		GeneratorController.sortLoadQueueByDistance(center);
	}

	private static processQueues() {
		const ops = GeneratorController.MAX_OPS_PER_STEP;
		let unloadBudget = math.floor(ops / 2);
		let loadBudget = ops - unloadBudget;

		while (unloadBudget-- > 0 && GeneratorController.queueToUnload.size() > 0) {
			const key = GeneratorController.queueToUnload.remove(0);
			if (key === undefined) continue;

			if (GeneratorController.outerDesired.has(key)) {
				GeneratorController.unloadSeen.delete(key);
				continue;
			}

			const chunk = GeneratorController.chunks.get(key);
			if (!chunk) {
				GeneratorController.unloadSeen.delete(key);
				continue;
			}

			chunk.unload();
			GeneratorController.unloadSeen.delete(key);
		}

		while (loadBudget-- > 0 && GeneratorController.queueToLoad.size() > 0) {
			const removed = GeneratorController.queueToLoad.remove(0);
			if (!removed) continue;

			if (!GeneratorController.outerDesired.has(removed.key)) {
				GeneratorController.loadSeen.delete(removed.key);
				continue;
			}

			const chunk = GeneratorController.chunks.get(removed.key);

			if (!chunk) {
				const newChunk = new Chunk(removed.position, GeneratorController.caveGenerator);

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

			if (chunk && !chunk.isLoaded()) {
				chunk.load(GeneratorController.folder);
			}

			GeneratorController.loadSeen.delete(removed.key);
		}
	}

	private static sortLoadQueueByDistance(center: Vector2) {
		GeneratorController.queueToLoad.sort((a, b) => {
			const aInner =
				math.abs(a.position.X - center.X) <= GeneratorController.INNER_RANGE &&
				math.abs(a.position.Y - center.Y) <= GeneratorController.INNER_RANGE;
			const bInner =
				math.abs(b.position.X - center.X) <= GeneratorController.INNER_RANGE &&
				math.abs(b.position.Y - center.Y) <= GeneratorController.INNER_RANGE;

			if (aInner !== bInner) return aInner;

			const da = a.position.sub(center).Magnitude;
			const db = b.position.sub(center).Magnitude;

			return da < db;
		});
	}
}

export { GeneratorController };
