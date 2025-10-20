import eslint from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-plugin-prettier/recommended";
import roblox from "eslint-plugin-roblox-ts";
import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type { import("eslint").Linter.Config[] } */
export default defineConfig([
	eslint.configs.recommended,
	tseslint.configs.recommended,
	roblox.configs.recommended,
	prettierConfig,
	{
		plugins: {
			"@typescript-eslint": tseslint.plugin,
			prettier,
		},

		languageOptions: {
			parser: tseslint.parser,
			ecmaVersion: 2018,
			sourceType: "module",

			parserOptions: {
				jsx: true,
				tsconfigRootDir: __dirname,
			},
		},

		rules: {
			"prettier/prettier": "warn",
		},

		ignores: ["out"],
	},
]);
