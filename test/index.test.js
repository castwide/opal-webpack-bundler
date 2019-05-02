import compiler from './fixtures/compiler.js';
import path from 'path';

test('Compiles a simple Ruby script', async () => {
  const stats = await compiler('simple.rb');
  const output = stats.toJson().modules[0].source;
  expect(output).toContain('Hello, world!');
});

test('Compiles with a custom load path', async () => {
  const stats = await compiler('load.rb', {
    paths: [path.resolve(__dirname, 'fixtures')]
  });
  const output = stats.toJson().modules[0].source;
  expect(output).toContain('Required script');
});

test('Compiles with Opal', async () => {
  jest.setTimeout(10000);
  const stats = await compiler('opal.rb');
  const output = stats.toJson().modules[0].source;
  expect(output).toContain('Hello, Opal!');
});

test('Catches syntax errors', async () => {
  jest.setTimeout(10000);
  const stats = await compiler('error.rb');
  expect(stats.hasErrors()).toEqual(true);
});
