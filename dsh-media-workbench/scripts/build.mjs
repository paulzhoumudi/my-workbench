// Builds the two published entries:
//   dsh/index.js   – server plugin (ESM, Node). @deepseek-ai/* stay external so the
//                    host's shared copies are used; `yaml` is bundled in.
//   lib/client.js  – single-file client module registered through
//                    window.__ModuleLoader__.load; React comes from the host `require`.
import { build } from 'esbuild'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))

await build({
  entryPoints: [path.join(root, 'src/server/index.js')],
  outfile: path.join(root, 'dsh/index.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  external: ['@deepseek-ai/*'],
  banner: { js: `// ${pkg.name} ${pkg.version} — built from src/server. Do not edit; run npm run build.` },
  logLevel: 'warning'
})

const client = await build({
  entryPoints: [path.join(root, 'src/client/index.jsx')],
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'cjs',
  target: 'chrome120',
  jsx: 'transform',
  jsxFactory: 'h',
  jsxFragment: 'Fragment',
  external: ['react', 'react-dom'],
  define: { __PKG_NAME__: JSON.stringify(pkg.name), __PKG_VERSION__: JSON.stringify(pkg.version) },
  logLevel: 'warning'
})

const body = client.outputFiles[0].text
const wrapped = `// ${pkg.name} ${pkg.version} client — built from src/client. Do not edit; run npm run build.
window.__ModuleLoader__.load({
  id: ${JSON.stringify(pkg.name)},
  factory: (require) => {
    const module = { exports: {} }
    ;(function (module, exports, require) {
${body}
    })(module, module.exports, require)
    return module.exports
  }
})
`
await mkdir(path.join(root, 'lib'), { recursive: true })
await writeFile(path.join(root, 'lib/client.js'), wrapped)
console.log('built dsh/index.js and lib/client.js')
