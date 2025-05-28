import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Custom plugin to inject release URLs into module.json
function injectReleaseUrls() {
  return {
    name: 'inject-release-urls',
    generateBundle() {
      // Get environment variables from GitHub Actions
      const moduleVersion = process.env.MODULE_VERSION;
      const ghProject = process.env.GH_PROJECT;
      const ghTag = process.env.GH_TAG;

      // Only inject URLs if we have the required environment variables (i.e., during release build)
      if (moduleVersion && ghProject && ghTag) {
        const moduleJsonPath = join('dist', 'module.json');

        try {
          // Read the existing module.json
          const moduleJson = JSON.parse(readFileSync(moduleJsonPath, 'utf8'));

          // Update URLs to point to the specific release
          moduleJson.manifest = `https://github.com/${ghProject}/releases/download/${ghTag}/module.json`;
          moduleJson.download = `https://github.com/${ghProject}/releases/download/${ghTag}/module.zip`;

          // Write the updated module.json
          writeFileSync(moduleJsonPath, JSON.stringify(moduleJson, null, 2));

          console.log(`✅ Injected release URLs for ${ghTag}`);
        } catch (error) {
          console.warn('⚠️ Could not inject release URLs:', error.message);
        }
      } else {
        console.log('ℹ️ Skipping URL injection (not a release build)');
      }
    }
  };
}

export default [
  {
    input: 'src/module.ts',
    output: {
      dir: 'dist',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      resolve(),
      typescript(),
      scss({
        fileName: 'styles/realms-and-reaches.css',
        sourceMap: true,
        watch: 'styles',
        // outputStyle: 'compressed',
        includePaths: ['styles'],
        failOnError: true // This will make the build fail if there's an SCSS error
      }),
      copy({
        targets: [
          { src: 'module.json', dest: 'dist/' },
          { src: 'templates/*.hbs', dest: 'dist/templates/' },
          { src: 'templates/partials/*.hbs', dest: 'dist/templates/partials/' },
          { src: 'assets/**/*', dest: 'dist/' },
          { src: 'languages/*.json', dest: 'dist/languages/' }
        ]
      }),
      injectReleaseUrls(),
      process.env.SERVE === 'true' &&
        serve({
          contentBase: 'dist',
          port: 29999
        }),
      process.env.SERVE === 'true' && livereload('dist')
    ]
  }
];