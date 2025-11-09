interface DeserializedPickaxe {
	name: string;
	damage: number;
	speed: number;
}

class Pickaxe {
	constructor(
		readonly name: string,
		readonly damage: number,
		readonly speed: number,
	) {}

	static Deserialize({ name, damage, speed }: Pickaxe): DeserializedPickaxe {
		return { name, damage, speed };
	}

	static Serialize({ name, damage, speed }: DeserializedPickaxe) {
		return new Pickaxe(name, damage, speed);
	}
}

export { Pickaxe, DeserializedPickaxe as RawPickaxe };
