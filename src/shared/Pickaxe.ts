interface DeserializedPickaxe {
	name: string;
	damage: number;
}

class Pickaxe {
	constructor(
		readonly name: string,
		readonly damage: number,
	) {}

	static Deserialize({ name, damage }: Pickaxe) {
		return { name, damage };
	}

	static Serialize({ name, damage }: DeserializedPickaxe) {
		new Pickaxe(name, damage);
	}
}

export { Pickaxe, DeserializedPickaxe as RawPickaxe };
