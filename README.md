# Roblox TS Demo

This is a demo project built using [`roblox-ts`](https://roblox-ts.com/) to explore the capabilities of TypeScript in Roblox development and to experiment with inter-module communication. The project uses the [`Flamework`](https://flamework.fireboltofdeath.dev/) framework for structured workflow.

The goal of this project is to create a **mining simulator** where **blocks are generated in chunks**, rather than spawning only where the player mines.
This approach aims to simulate a seamless world-loading experience similar to voxel-based games.

## Objectives

Chunk generation and management are fully handled **on the client side**.

When a player mines a block:

1. The **server** sends that update to the **client**.
2. If another client hasn’t yet loaded the affected chunk, the event is **queued** until the chunk is loaded or the server issues a **reset**.
3. To maintain consistent world generation, the **server provides a random seed** to all clients (including late joiners).

This setup ensures consistency across all players while reducing unnecessary server-side computation. But, could lead to a lot of vulnerabilities to client abuse.

## Run The Project

- Terminal A: run `rbxtsc:watch` to compile TypeScript on file changes.

    ```sh
    pnpm rbxtsc:watch
    ```

- Terminal B: run `rojo:serve`, then in Roblox Studio open the Rojo plugin and press Connect.

    ```sh
    pnpm rojo:serve
    ```

- Prefer a one-time build? Run `rbxtsc:build`, then `rojo:serve`.

    ```sh
    pnpm rbxtsc:build
    pnpm rojo:serve
    ```
