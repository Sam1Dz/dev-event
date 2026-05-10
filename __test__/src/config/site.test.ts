import { describe, expect, it } from 'vitest';

import { metadata } from '~/config/site';

interface TitleTemplate {
  default: string;
  template: string;
}

function getTitleTemplate() {
  expect(metadata.title).toEqual(
    expect.objectContaining({
      default: expect.any(String),
      template: expect.any(String),
    })
  );

  return metadata.title as TitleTemplate;
}

function getDescription() {
  expect(metadata.description).toEqual(expect.any(String));

  return metadata.description as string;
}

describe('Site Metadata Configuration', () => {
  it('should export metadata', () => {
    expect(metadata).toBeDefined();
  });

  it('should have title configuration', () => {
    expect(metadata.title).toBeDefined();
  });

  it('should have title with template and default', () => {
    expect(metadata.title).toHaveProperty('template');
    expect(metadata.title).toHaveProperty('default');
  });

  it('should have correct default title', () => {
    expect(getTitleTemplate().default).toBe('DevEvent');
  });

  it('should have title template with app name', () => {
    const title = getTitleTemplate();

    expect(title.template).toContain('%s');
    expect(title.template).toContain('DevEvent');
  });

  it('should have proper title template format', () => {
    expect(getTitleTemplate().template).toBe('%s — DevEvent');
  });

  it('should have description', () => {
    expect(metadata.description).toBeDefined();
    expect(typeof metadata.description).toBe('string');
  });

  it('should have descriptive description', () => {
    const description = getDescription();

    expect(description).toContain('Hackathons');
    expect(description).toContain('Meetups');
    expect(description).toContain('Conferences');
  });

  it('should have non-empty description', () => {
    expect(getDescription().length).toBeGreaterThan(0);
  });

  it('should export metadata as named export', async () => {
    const siteModule = await import('~/config/site');

    expect(siteModule).toHaveProperty('metadata');
  });

  it('should not export default', async () => {
    const siteModule = await import('~/config/site');

    expect(siteModule).not.toHaveProperty('default');
  });

  it('should have title template that includes separator', () => {
    expect(getTitleTemplate().template).toContain('—');
  });

  it('should have description that mentions dev events', () => {
    const description = getDescription().toLowerCase();

    expect(description).toContain('dev');
    expect(description).toContain('event');
  });

  it('should have metadata structure matching Next.js Metadata type', () => {
    expect(metadata).toMatchObject({
      title: expect.any(Object),
      description: expect.any(String),
    });
  });

  it('should have consistent branding in title', () => {
    const { default: defaultTitle, template } = getTitleTemplate();

    // Both should contain the app name
    expect(template).toContain('DevEvent');
    expect(defaultTitle).toContain('DevEvent');
  });

  it('should have description with appropriate length for SEO', () => {
    // SEO best practice: descriptions should be between 120-158 characters
    const descriptionLength = getDescription().length;

    expect(descriptionLength).toBeGreaterThanOrEqual(50);
    expect(descriptionLength).toBeLessThanOrEqual(200);
  });
});
