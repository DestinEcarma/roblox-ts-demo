# Roblox TS Demo

This is a demo project built using [`roblox-ts`](https://roblox-ts.com/) to explore the capabilities of TypeScript in Roblox development and to experiment with inter-module communication. The project uses the [`Flamework`](https://flamework.fireboltofdeath.dev/) framework for structured workflow.

The goal of this project is to create a **mining simulator** where **blocks are generated in chunks**, rather than spawning only where the player mines.
This approach aims to simulate a seamless world-loading experience similar to voxel-based games.

However, I do plan on exploring alternative methods, such as spawning blocks dynamically at the mining position, since chunk loading currently causes a small pause in gameplay; even though the FPS remains stable at 60. This suggests that parallelism or chunk management might need further optimization.

## Objectives

Chunk generation and management are fully handled **on the client side**.

When a player mines a block:

1. The **server** sends that update to the **client**.
2. If another client hasn’t yet loaded the affected chunk, the event is **queued** until the chunk is loaded or the server issues a **reset**.
3. To maintain consistent world generation, the **server provides a random seed** to all clients (including late joiners).

This setup ensures consistency across all players while reducing unnecessary server-side computation. But, could lead to a lot of vulnerabilities to client abuse.
