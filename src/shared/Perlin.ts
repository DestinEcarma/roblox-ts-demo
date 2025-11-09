interface Density {
	density(position: Vector3): number;
}

class Perlin3DGenerator implements Density {
	constructor(
		private frequency = 0.05,
		private octaves = 3,
		private lacunarity = 2,
		private persistence = 0.5,
		private threshold = -0.5,
		private seed = 69,
	) {}

	density(point: Vector3): number {
		let amp = 1;
		let freq = this.frequency;
		let val = 0;

		for (let i = 0; i < this.octaves; i++) {
			val += math.noise(point.X * freq, point.Y * freq, point.Z * freq + this.seed) * amp;
			amp *= this.persistence;
			freq *= this.lacunarity;
		}

		return val - this.threshold;
	}
}
export { Density as CaveGenerator, Perlin3DGenerator };
