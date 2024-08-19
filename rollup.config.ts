import json from '@rollup/plugin-json'
import { defineConfig } from 'rollup'
import type { Plugin, ModuleFormat, OutputOptions, RollupOptions } from 'rollup'
import esbuildPlugin from 'rollup-plugin-esbuild'
import { dts } from 'rollup-plugin-dts'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = fileURLToPath(new URL('./', import.meta.url))
const distPath = path.resolve(__dirname, 'dist')
const inputPath = path.resolve(__dirname, './src/touchScale.ts')
const require = createRequire(import.meta.url)
const pkg = require('./package.json') as typeof import('./package.json')

const resolveOutput = (format: ModuleFormat | 'dts', isDts?: boolean) => {
  let fileEndStr = ''
  if (isDts) {
    fileEndStr = 'd.ts'
  } else if (format === 'esm') {
    fileEndStr = 'esm.mjs'
  } else {
    fileEndStr = `${format}.js`
  }
  return path.resolve(distPath, `${pkg.name}.${fileEndStr}`)
}
const buildConfig = (format: ModuleFormat | 'dts'): RollupOptions => {
  const isDts = format === 'dts'
  const output: OutputOptions = {
    file: resolveOutput(format, isDts),
    format: isDts ? 'es' : format,
    name: 'touch-scale',
    exports: 'named',
    indent: false,
    sourcemap: isDts ? false : true,
  }

  const plugins: Plugin[] = [json()]
  if (isDts) {
    plugins.push(
      dts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      })
    )
  } else {
    plugins.push(
      esbuildPlugin({
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        sourceMap: output.sourcemap as boolean,
        target: 'es2015',
        minify: true,
      })
    )
  }

  return {
    input: inputPath,
    output,
    plugins,
  }
}

export default defineConfig([buildConfig('umd'), buildConfig('esm'), buildConfig('dts')])
