import { createFoundryConfigWithDir } from '@rayners/foundry-dev-tools/rollup';

export default createFoundryConfigWithDir({
  cssFileName: 'styles/realms-and-reaches.css',
  additionalCopyTargets: [
    { src: 'templates/partials/*.hbs', dest: 'dist/templates/partials/' },
    { src: 'assets/**/*', dest: 'dist/' }
  ],
  scssOptions: {
    includePaths: ['styles']
  },
  devServerPort: 29999
});
