import { isTheme, resolveTheme } from '../src/lib/theme.ts';

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed: expected ${String(expected)}, got ${String(actual)}${message ? ` (${message})` : ''}`,
    );
  }
}

assertEqual(resolveTheme('light', true), 'light');
assertEqual(resolveTheme('light', false), 'light');
assertEqual(resolveTheme('dark', true), 'dark');
assertEqual(resolveTheme('dark', false), 'dark');
assertEqual(resolveTheme('system', true), 'dark');
assertEqual(resolveTheme('system', false), 'light');

assertEqual(isTheme('light'), true);
assertEqual(isTheme('dark'), true);
assertEqual(isTheme('system'), true);
assertEqual(isTheme('sepia'), false);
assertEqual(isTheme(null), false);
assertEqual(isTheme(undefined), false);

console.log('theme verify: ok');
