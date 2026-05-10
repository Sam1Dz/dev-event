import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RootProvider } from '~/components/providers/root';

// Mock the ThemeProvider imported by RootProvider.
vi.mock('~/components/providers/theme', () => ({
  ThemeProvider: ({
    children,
    enableSystem,
    attribute,
    defaultTheme,
  }: {
    children: React.ReactNode;
    enableSystem?: boolean;
    attribute?: string;
    defaultTheme?: string;
  }) => (
    <div
      data-attribute={attribute}
      data-default-theme={defaultTheme}
      data-enable-system={enableSystem}
      data-testid="theme-provider"
    >
      {children}
    </div>
  ),
}));

describe('RootProvider', () => {
  it('should render children correctly', () => {
    render(
      <RootProvider>
        <div data-testid="child">Test Content</div>
      </RootProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render ThemeProvider with correct configuration', () => {
    render(
      <RootProvider>
        <div data-testid="content">Content</div>
      </RootProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');

    expect(themeProvider).toBeInTheDocument();
    expect(themeProvider).toHaveAttribute('data-enable-system', 'true');
    expect(themeProvider).toHaveAttribute('data-attribute', 'class');
    expect(themeProvider).toHaveAttribute('data-default-theme', 'system');
  });

  it('should nest ThemeProvider around children', () => {
    render(
      <RootProvider>
        <div data-testid="nested-child">Nested Child</div>
      </RootProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    const child = screen.getByTestId('nested-child');

    expect(themeProvider).toContainElement(child);
  });

  it('should handle multiple children', () => {
    render(
      <RootProvider>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
        <div data-testid="child3">Child 3</div>
      </RootProvider>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
    expect(screen.getByTestId('child3')).toBeInTheDocument();
  });

  it('should handle deeply nested component structures', () => {
    render(
      <RootProvider>
        <div data-testid="level-1">
          <div data-testid="level-2">
            <div data-testid="level-3">Deep Content</div>
          </div>
        </div>
      </RootProvider>
    );

    expect(screen.getByTestId('level-1')).toBeInTheDocument();
    expect(screen.getByTestId('level-2')).toBeInTheDocument();
    expect(screen.getByTestId('level-3')).toBeInTheDocument();
    expect(screen.getByText('Deep Content')).toBeInTheDocument();
  });

  it('should render without children gracefully', () => {
    const { container } = render(<RootProvider />);

    expect(container).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    render(
      <RootProvider>
        <></>
      </RootProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');

    expect(themeProvider).toBeInTheDocument();
  });

  it('should preserve children structure and order', () => {
    render(
      <RootProvider>
        <div data-testid="first">First</div>
        <div data-testid="second">Second</div>
        <div data-testid="third">Third</div>
      </RootProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    const first = screen.getByTestId('first');
    const second = screen.getByTestId('second');
    const third = screen.getByTestId('third');

    expect(themeProvider).toContainElement(first);
    expect(themeProvider).toContainElement(second);
    expect(themeProvider).toContainElement(third);
  });
});

describe('composeProviders functionality', () => {
  it('should compose providers in correct order', () => {
    // The RootProvider should wrap children with ThemeProvider
    render(
      <RootProvider>
        <div data-testid="inner-content">Content</div>
      </RootProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    const content = screen.getByTestId('inner-content');

    // ThemeProvider should be present and contain the content
    expect(themeProvider).toBeInTheDocument();
    expect(themeProvider).toContainElement(content);
  });

  it('should handle provider composition with single provider', () => {
    // Currently RootProvider only has one provider, but the composition
    // pattern should work for future additions
    render(
      <RootProvider>
        <div data-testid="single">Single Provider Test</div>
      </RootProvider>
    );

    expect(screen.getByTestId('single')).toBeInTheDocument();
    expect(screen.getByText('Single Provider Test')).toBeInTheDocument();
  });
});
