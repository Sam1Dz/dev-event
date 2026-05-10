import { describe, expect, it, vi } from 'vitest';
import { Martian_Mono, Schibsted_Grotesk } from 'next/font/google';

// Mock next/font/google
vi.mock('next/font/google', () => ({
  Schibsted_Grotesk: vi.fn(options => ({
    variable: options.variable,
    subsets: options.subsets,
    style: {
      fontFamily: 'Schibsted Grotesk, sans-serif',
    },
  })),
  Martian_Mono: vi.fn(options => ({
    variable: options.variable,
    subsets: options.subsets,
    style: {
      fontFamily: 'Martian Mono, monospace',
    },
  })),
}));

describe('Font Configuration', () => {
  const martianMonoLoader = vi.mocked(Martian_Mono);
  const schibstedGroteskLoader = vi.mocked(Schibsted_Grotesk);

  it('should export font configurations', async () => {
    const { martianMono, schibstedGrotesk } = await import('~/config/font');

    expect(martianMono).toBeDefined();
    expect(schibstedGrotesk).toBeDefined();
  });

  it('should configure Schibsted Grotesk with correct variable name', async () => {
    const { schibstedGrotesk } = await import('~/config/font');

    expect(schibstedGrotesk.variable).toBe('--font-schibsted-grotesk');
  });

  it('should configure Schibsted Grotesk with latin subsets', async () => {
    await import('~/config/font');

    expect(schibstedGroteskLoader).toHaveBeenCalledWith(
      expect.objectContaining({ subsets: ['latin'] })
    );
  });

  it('should configure Martian Mono with correct variable name', async () => {
    const { martianMono } = await import('~/config/font');

    expect(martianMono.variable).toBe('--font-martian-mono');
  });

  it('should configure Martian Mono with latin subsets', async () => {
    await import('~/config/font');

    expect(martianMonoLoader).toHaveBeenCalledWith(expect.objectContaining({ subsets: ['latin'] }));
  });

  it('should export both fonts as named exports', async () => {
    const fontModule = await import('~/config/font');

    expect(fontModule).toHaveProperty('martianMono');
    expect(fontModule).toHaveProperty('schibstedGrotesk');
  });

  it('should not export default exports', async () => {
    const fontModule = await import('~/config/font');

    expect(fontModule).not.toHaveProperty('default');
  });

  it('should have consistent font variable naming convention', async () => {
    const { martianMono, schibstedGrotesk } = await import('~/config/font');

    // Both variables should start with --font-
    expect(martianMono.variable).toMatch(/^--font-/);
    expect(schibstedGrotesk.variable).toMatch(/^--font-/);
  });

  it('should have unique variable names for each font', async () => {
    const { martianMono, schibstedGrotesk } = await import('~/config/font');

    expect(martianMono.variable).not.toBe(schibstedGrotesk.variable);
  });

  it('should configure both fonts with the same subset', async () => {
    await import('~/config/font');

    expect(martianMonoLoader).toHaveBeenCalledWith(expect.objectContaining({ subsets: ['latin'] }));
    expect(schibstedGroteskLoader).toHaveBeenCalledWith(
      expect.objectContaining({ subsets: ['latin'] })
    );
  });
});
