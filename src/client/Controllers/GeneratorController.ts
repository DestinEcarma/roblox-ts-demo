import { character } from "../Components/Character";
import { Chunk } from "@/shared/Chunk";
import { Controller, OnStart } from "@flamework/core";
import { RunService, Workspace } from "@rbxts/services";

@Controller()
class GeneratorController implements OnStart {
	private static readonly RANGE = 1;
	private static readonly MAX_LOADS_PER_STEP = 6;

	private static folder = new Instance("Folder", Workspace);

	private static desired = new Set<string>();
	private static lastChunkPos?: Vector3;
	private static queueToLoad = new Array<{ key: string; pos: Vector3 }>();
	private static queueToUnload = new Array<string>();
	private static moveDebounce = false;

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

	private static recomputeDesired = (center: Vector3) => {
		const nextDesired = new Set<string>();

		for (let x = center.X - GeneratorController.RANGE; x <= center.X + GeneratorController.RANGE; x++) {
			for (let y = center.Y - GeneratorController.RANGE; y <= 0; y++) {
				for (let z = center.Z - GeneratorController.RANGE; z <= center.Z + GeneratorController.RANGE; z++) {
					const key = GeneratorController.key(x, y, z);
					nextDesired.add(key);

					if (!GeneratorController.chunks.has(key)) {
						GeneratorController.queueToLoad.push({ key, pos: new Vector3(x, y, z) });
					}
				}
			}
		}

		for (const [key] of GeneratorController.chunks) {
			if (!nextDesired.has(key)) GeneratorController.queueToUnload.push(key);
		}

		GeneratorController.desired = nextDesired;
		GeneratorController.sortLoadQueueByDistance(center);
	};

	private static processQueues = () => {
		let unloadBudget = math.floor(GeneratorController.MAX_LOADS_PER_STEP / 2);

		while (unloadBudget-- > 0 && GeneratorController.queueToUnload.size() > 0) {
			const key = GeneratorController.queueToUnload.remove(0);

			if (key !== undefined) {
				const chunk = GeneratorController.chunks.get(key);

				if (chunk) {
					chunk.unload?.();
					GeneratorController.chunks.delete(key);
				}
			}
		}

		let loadBudget = GeneratorController.MAX_LOADS_PER_STEP;

		while (loadBudget-- > 0 && GeneratorController.queueToLoad.size() > 0) {
			const removed = GeneratorController.queueToLoad.remove(0);

			if (removed) {
				if (!GeneratorController.desired.has(removed.key) || GeneratorController.chunks.has(removed.key))
					continue;

				const newChunk = new Chunk(removed.pos);
				newChunk.load(GeneratorController.folder);
				GeneratorController.chunks.set(removed.key, newChunk);
			}
		}
	};

	private static sortLoadQueueByDistance = (center: Vector3) => {
		GeneratorController.queueToLoad.sort((a, b) => a.pos.sub(center).Magnitude < b.pos.sub(center).Magnitude);
	};

	private static key = (x: number, y: number, z: number) => {
		return `${x},${y},${z}`;
	};
}

export { GeneratorController };
