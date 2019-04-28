import compiler from './compiler.js';

test('Compiles a simple Ruby script', async () => {
  jest.setTimeout(10000);
  const stats = await compiler('simple.rb');
  const output = stats.toJson().modules[0].source;
  expect(output).toContain('Hello, world!')
});
