import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '~/components/providers/theme';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({
    children,
    attribute,
    defaultTheme,
    enableSystem,
  }: {
    children: React.ReactNode;
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
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

describe('ThemeProvider', () => {
  it('should render children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should forward props to underlying ThemeProvider', () => {
    render(
      <ThemeProvider enableSystem attribute="class" defaultTheme="system">
        <div>Child</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('theme-provider');

    expect(provider).toHaveAttribute('data-attribute', 'class');
    expect(provider).toHaveAttribute('data-default-theme', 'system');
    expect(provider).toHaveAttribute('data-enable-system', 'true');
  });

  it('should render without props gracefully', () => {
    render(
      <ThemeProvider>
        <div data-testid="content">Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should handle multiple children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
        <div data-testid="child3">Child 3</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
    expect(screen.getByTestId('child3')).toBeInTheDocument();
  });

  it('should handle nested components', () => {
    render(
      <ThemeProvider>
        <div data-testid="parent">
          <div data-testid="nested">Nested Content</div>
        </div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('parent')).toBeInTheDocument();
    expect(screen.getByTestId('nested')).toBeInTheDocument();
  });
});
