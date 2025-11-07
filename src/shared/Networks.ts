import { RawPickaxe } from "./Pickaxe";
import { Networking } from "@flamework/networking";

interface ServerMiningEvent {
	Mine: (position: Vector3) => void;
}

interface ClientMiningEvent {
	Mined: (position: Vector3, damage: number) => void;
}

interface ServerInventoryEvent {
	ChangePickaxe: (rawPickaxe: RawPickaxe) => void;
}

interface ClientInventoryEvent {
	SetPickaxe: (rawPickaxe: RawPickaxe) => void;
}

const GlobalMiningEvent = Networking.createEvent<ServerMiningEvent, ClientMiningEvent>();
const GlobalInventoryEvent = Networking.createEvent<ServerInventoryEvent, ClientInventoryEvent>();

export { GlobalMiningEvent, GlobalInventoryEvent };
