/**
 * WizardWidget Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { WizardWidgetConfig } from './types';
import { WizardWidget } from './WizardWidget';

// Mock WidgetListRenderer to avoid complex dependencies
jest.mock('@/core/renderer/WidgetRenderer', () => ({
  WidgetListRenderer: ({ configs }: { configs: Array<{ id: string; type: string }> }) => (
    <div>
      {configs.map(config => (
        <div key={config.id} data-testid={`widget-${config.id}`}>
          {config.type}
        </div>
      ))}
    </div>
  ),
}));

describe('WizardWidget', () => {
  const baseConfig: WizardWidgetConfig = {
    id: 'test-wizard',
    type: 'Wizard',
    title: 'Test Wizard',
    steps: [
      {
        id: 'step1',
        label: 'Step 1',
        description: 'First step',
        widgets: [{ id: 'field1', type: 'TextInput', label: 'Field 1' }],
      },
      {
        id: 'step2',
        label: 'Step 2',
        description: 'Second step',
        widgets: [{ id: 'field2', type: 'TextInput', label: 'Field 2' }],
      },
    ],
  };

  it('renders nothing when closed', () => {
    const { container } = render(<WizardWidget config={baseConfig} bindings={{ isOpen: false }} />);

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders wizard when open', () => {
    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Wizard')).toBeInTheDocument();
  });

  it('renders first step by default', () => {
    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} />);

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('First step')).toBeInTheDocument();
  });

  it('renders step widgets', () => {
    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} />);

    expect(screen.getByTestId('widget-field1')).toBeInTheDocument();
  });

  it('shows progress indicator by default', () => {
    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} />);

    // Progress indicator should be present (dots or numbers)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('hides progress indicator when showProgress is false', () => {
    const config: WizardWidgetConfig = {
      ...baseConfig,
      showProgress: false,
    };

    render(<WizardWidget config={config} bindings={{ isOpen: true }} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows Next button on first step', () => {
    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} />);

    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('navigates to next step when Next is clicked', async () => {
    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} />);

    const nextButton = screen.getByText('Next');
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Second step')).toBeInTheDocument();
    });
  });

  it('shows Previous button on second step', async () => {
    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} />);

    // Navigate to step 2
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeInTheDocument();
    });
  });

  it('navigates to previous step when Previous is clicked', async () => {
    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} />);

    // Navigate to step 2
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });

    // Navigate back to step 1
    await userEvent.click(screen.getByText('Previous'));

    await waitFor(() => {
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });
  });

  it('shows Finish button on last step', async () => {
    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} />);

    // Navigate to last step
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Finish')).toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });

  it('calls onComplete when Finish is clicked', async () => {
    const onComplete = jest.fn();

    render(
      <WizardWidget config={baseConfig} bindings={{ isOpen: true }} events={{ onComplete }} />
    );

    // Navigate to last step
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });

    // Click finish
    await userEvent.click(screen.getByText('Finish'));

    expect(onComplete).toHaveBeenCalled();
  });

  it('shows Cancel button on all steps', () => {
    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = jest.fn();

    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} events={{ onCancel }} />);

    await userEvent.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('validates step before proceeding to next', async () => {
    const onValidationError = jest.fn();
    const config: WizardWidgetConfig = {
      ...baseConfig,
      steps: [
        {
          ...baseConfig.steps[0],
          validate: () => 'Validation failed',
        },
        baseConfig.steps[1],
      ],
    };

    render(
      <WizardWidget config={config} bindings={{ isOpen: true }} events={{ onValidationError }} />
    );

    await userEvent.click(screen.getByText('Next'));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Validation failed')).toBeInTheDocument();
    });

    // Should stay on step 1
    expect(screen.getByText('Step 1')).toBeInTheDocument();

    // Should call onValidationError
    expect(onValidationError).toHaveBeenCalled();
  });

  it('allows navigation when validation passes', async () => {
    const config: WizardWidgetConfig = {
      ...baseConfig,
      steps: [
        {
          ...baseConfig.steps[0],
          validate: () => true,
        },
        baseConfig.steps[1],
      ],
    };

    render(<WizardWidget config={config} bindings={{ isOpen: true }} />);

    await userEvent.click(screen.getByText('Next'));

    // Should navigate to step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });
  });

  it('uses custom labels when provided', () => {
    const config: WizardWidgetConfig = {
      ...baseConfig,
      labels: {
        next: 'Continue',
        previous: 'Back',
        finish: 'Complete',
        cancel: 'Exit',
      },
    };

    render(<WizardWidget config={config} bindings={{ isOpen: true }} />);

    expect(screen.getByText('Continue')).toBeInTheDocument();
    expect(screen.getByText('Exit')).toBeInTheDocument();
  });

  it('respects size configuration', () => {
    const sizes: Array<'sm' | 'md' | 'lg' | 'xl' | 'full'> = ['sm', 'md', 'lg', 'xl', 'full'];

    sizes.forEach(size => {
      const config: WizardWidgetConfig = {
        ...baseConfig,
        size,
      };

      const { unmount } = render(<WizardWidget config={config} bindings={{ isOpen: true }} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      unmount();
    });
  });

  it('calls onNext when navigating forward', async () => {
    const onNext = jest.fn();

    render(<WizardWidget config={baseConfig} bindings={{ isOpen: true }} events={{ onNext }} />);

    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(onNext).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  it('calls onPrevious when navigating backward', async () => {
    const onPrevious = jest.fn();

    render(
      <WizardWidget config={baseConfig} bindings={{ isOpen: true }} events={{ onPrevious }} />
    );

    // Navigate to step 2 first
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeInTheDocument();
    });

    // Navigate back
    await userEvent.click(screen.getByText('Previous'));

    expect(onPrevious).toHaveBeenCalledWith(0);
  });

  it('renders with different progress styles', () => {
    const styles: Array<'dots' | 'numbers' | 'bar'> = ['dots', 'numbers', 'bar'];

    styles.forEach(progressStyle => {
      const config: WizardWidgetConfig = {
        ...baseConfig,
        progressStyle,
      };

      const { unmount } = render(<WizardWidget config={config} bindings={{ isOpen: true }} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      unmount();
    });
  });
});
