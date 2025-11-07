import { GlobalInventoryEvent, GlobalMiningEvent } from "@/shared/Networks";

const MiningEvent = GlobalMiningEvent.createServer({});
const InventoryEvent = GlobalInventoryEvent.createServer({});

export { MiningEvent, InventoryEvent };
