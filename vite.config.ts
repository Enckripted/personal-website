import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import { resolve } from "node:path"

export default defineConfig({
	plugins: [tailwindcss()],
	input: {
		main: resolve(import.meta.dirname, "index.html"),
		soccer: resolve(import.meta.dirname, "toys/endacopia-soccer/index.html"),
		vsrg: resolve(import.meta.dirname, "toys/basic-vsrg/index.html"),
	}
})
