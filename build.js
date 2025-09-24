// Custom build script to handle CI environment
process.env.CI = 'false';
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.GENERATE_SOURCEMAP = 'false';

const { spawn } = require('child_process');

console.log('Starting build with CI=false and ESLint disabled...');

const build = spawn('npx', ['react-scripts', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    CI: 'false',
    DISABLE_ESLINT_PLUGIN: 'true',
    GENERATE_SOURCEMAP: 'false'
  }
});

build.on('close', (code) => {
  if (code === 0) {
    console.log('Build completed successfully!');
  } else {
    console.error(`Build failed with code ${code}`);
    process.exit(code);
  }
});
