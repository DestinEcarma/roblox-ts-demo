import { GlobalInventoryEvent, GlobalMiningEvent } from "@/shared/Networks";

const MiningEvent = GlobalMiningEvent.createClient({});
const InventoryEvent = GlobalInventoryEvent.createClient({});

export { MiningEvent, InventoryEvent };
