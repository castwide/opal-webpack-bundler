import compiler from './compiler.js';

test('Inserts name and outputs JavaScript', async () => {
  jest.setTimeout(10000);
  const stats = await compiler('simple.rb');
  const output = stats.toJson().modules[0].source;
  expect(output).toContain('Hello, world!')
});
