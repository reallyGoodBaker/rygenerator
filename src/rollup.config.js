import path from 'path';
import ts from '@rollup/plugin-typescript'

export default {
    input: path.resolve(__dirname, './index.ts'),
    output: {
        file: path.resolve(__dirname, '../dist/index.js'),
        format: 'cjs'
    },
    external: [
        'fs', 'child_process', 'path', 'styled-message'
    ],
    plugins: [
        ts({
            target: 'es2018',

            lib: [
                "es5",
                "es2015",
                "es2016",
                "es2017",
                "es2018"
            ],

            compilerOptions: {
                sourceMap: false,
            },


        }),
    ]
}
