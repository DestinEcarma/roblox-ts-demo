interface DeserializedPickaxe {
	name: string;
	damage: number;
}

class Pickaxe {
	readonly name: string;
	readonly damage: number;

	constructor(name: string, damage: number) {
		this.name = name;
		this.damage = damage;
	}

	static Deserialize({ name, damage }: Pickaxe) {
		return { name, damage };
	}

	static Serialize({ name, damage }: DeserializedPickaxe) {
		new Pickaxe(name, damage);
	}
}

export { Pickaxe, DeserializedPickaxe as RawPickaxe };
