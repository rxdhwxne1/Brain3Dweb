import {defineConfig} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
    clearScreen: false,
    build: {
        rollupOptions: {
            input: './index.html',
            output: {
                assetFileNames: "src/assets/[name].[ext]",
                dataFileNames: "src/data/[name].[ext]",
                utilFileNames: "src/utils/[name].js",
                entryFileNames: "src/[name].js",
            },
        },
        write: true,
        sourcemap: true
    },
    server: {
        open: true
    },
    plugins: [
        viteStaticCopy({
            targets: [
                {src: 'node_modules/three/examples/jsm/libs/ammo.wasm.js', dest: 'jsm/libs/'},
                {src: 'node_modules/three/examples/jsm/libs/ammo.wasm.wasm', dest: 'jsm/libs/'},
                {
                    src: 'node_modules/three/examples/jsm/libs/draco/gltf/draco_decoder.js',
                    dest: 'jsm/libs/draco/gltf'
                },
                {
                    src: 'node_modules/three/examples/jsm/libs/draco/gltf/draco_decoder.wasm',
                    dest: 'jsm/libs/draco/gltf/'
                },
                {
                    src: 'node_modules/three/examples/jsm/libs/draco/gltf/draco_encoder.js',
                    dest: 'jsm/libs/draco/gltf/'
                },
                {
                    src: 'node_modules/three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js',
                    dest: 'jsm/libs/draco/gltf/'
                }
            ]
        }),
        glsl()
    ]
});