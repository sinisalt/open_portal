/**
 * TagInputWidget Tests
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TagInputWidget } from './TagInputWidget';
import type { TagInputWidgetConfig } from './types';

describe('TagInputWidget', () => {
  const mockOnChange = jest.fn();

  const defaultConfig: TagInputWidgetConfig = {
    id: 'test-tag-input',
    type: 'TagInput',
    label: 'Tags',
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders with label', () => {
      render(<TagInputWidget config={defaultConfig} />);

      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type and press Enter...')).toBeInTheDocument();
    });

    it('renders without label when not provided', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        label: undefined,
      };
      render(<TagInputWidget config={config} />);

      expect(screen.queryByText('Tags')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type and press Enter...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        placeholder: 'Add keywords...',
      };
      render(<TagInputWidget config={config} />);

      expect(screen.getByPlaceholderText('Add keywords...')).toBeInTheDocument();
    });

    it('renders with existing tags', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['React', 'TypeScript', 'Testing'],
      };
      render(<TagInputWidget config={config} />);

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
    });

    it('renders with help text', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        helpText: 'Press Enter or comma to add tags',
      };
      render(<TagInputWidget config={config} />);

      expect(screen.getByText('Press Enter or comma to add tags')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        error: 'At least one tag is required',
      };
      render(<TagInputWidget config={config} />);

      expect(screen.getByText('At least one tag is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('At least one tag is required');
    });

    it('renders in disabled state', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['React'],
        disabled: true,
      };
      render(<TagInputWidget config={config} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('applies custom className', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        className: 'custom-class',
      };
      const { container } = render(<TagInputWidget config={config} />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Adding Tags', () => {
    it('adds tag on Enter key', () => {
      render(<TagInputWidget config={defaultConfig} events={{ onChange: mockOnChange }} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'NewTag' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(screen.getByText('NewTag')).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledWith(['NewTag']);
    });

    it('adds tag on comma key when allowCustom is true', () => {
      render(
        <TagInputWidget
          config={{ ...defaultConfig, allowCustom: true }}
          events={{ onChange: mockOnChange }}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'NewTag' } });
      fireEvent.keyDown(input, { key: ',' });

      expect(screen.getByText('NewTag')).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledWith(['NewTag']);
    });

    it('does not add tag on comma key when allowCustom is false', () => {
      render(
        <TagInputWidget
          config={{ ...defaultConfig, allowCustom: false }}
          events={{ onChange: mockOnChange }}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'NewTag' } });
      fireEvent.keyDown(input, { key: ',' });

      expect(screen.queryByText('NewTag')).not.toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('trims whitespace from tags', () => {
      render(<TagInputWidget config={defaultConfig} events={{ onChange: mockOnChange }} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '  SpacedTag  ' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(screen.getByText('SpacedTag')).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledWith(['SpacedTag']);
    });

    it('clears input after adding tag', () => {
      render(<TagInputWidget config={defaultConfig} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'NewTag' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(input.value).toBe('');
    });

    it('adds multiple tags sequentially', () => {
      render(<TagInputWidget config={defaultConfig} events={{ onChange: mockOnChange }} />);

      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'Tag1' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      fireEvent.change(input, { target: { value: 'Tag2' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(screen.getByText('Tag1')).toBeInTheDocument();
      expect(screen.getByText('Tag2')).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Removing Tags', () => {
    it('removes tag on X button click', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['Tag1', 'Tag2', 'Tag3'],
      };
      render(<TagInputWidget config={config} events={{ onChange: mockOnChange }} />);

      const removeButtons = screen.getAllByLabelText(/Remove/);
      fireEvent.click(removeButtons[1]); // Remove Tag2

      expect(screen.queryByText('Tag2')).not.toBeInTheDocument();
      expect(screen.getByText('Tag1')).toBeInTheDocument();
      expect(screen.getByText('Tag3')).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledWith(['Tag1', 'Tag3']);
    });

    it('removes last tag on Backspace when input is empty', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['Tag1', 'Tag2'],
      };
      render(<TagInputWidget config={config} events={{ onChange: mockOnChange }} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Backspace' });

      expect(screen.queryByText('Tag2')).not.toBeInTheDocument();
      expect(screen.getByText('Tag1')).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledWith(['Tag1']);
    });

    it('does not remove tag on Backspace when input has text', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['Tag1'],
      };
      render(<TagInputWidget config={config} events={{ onChange: mockOnChange }} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'text' } });
      fireEvent.keyDown(input, { key: 'Backspace' });

      expect(screen.getByText('Tag1')).toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not show remove button when disabled', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['Tag1'],
        disabled: true,
      };
      render(<TagInputWidget config={config} />);

      expect(screen.queryByLabelText('Remove Tag1')).not.toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('prevents adding empty tags', () => {
      render(<TagInputWidget config={defaultConfig} events={{ onChange: mockOnChange }} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(screen.getByText('Tag cannot be empty')).toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('prevents adding duplicate tags (case-insensitive)', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['React'],
      };
      render(<TagInputWidget config={config} events={{ onChange: mockOnChange }} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'react' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(screen.getByText('Tag already exists')).toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('enforces maxTags limit', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['Tag1'],
        maxTags: 2,
      };
      render(<TagInputWidget config={config} events={{ onChange: mockOnChange }} />);

      const input = screen.getByRole('textbox');

      // Add second tag (should work)
      fireEvent.change(input, { target: { value: 'Tag2' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.getByText('Tag2')).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledWith(['Tag1', 'Tag2']);

      // Try to add third tag (should fail - input is now hidden)
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('hides input when maxTags reached', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['Tag1', 'Tag2'],
        maxTags: 2,
      };
      render(<TagInputWidget config={config} />);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('shows tags count when maxTags is set', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['Tag1'],
        maxTags: 5,
      };
      render(<TagInputWidget config={config} />);

      expect(screen.getByText('1 / 5 tags')).toBeInTheDocument();
    });

    it('clears validation error on input change', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['Tag1'],
      };
      render(<TagInputWidget config={config} />);

      const input = screen.getByRole('textbox');

      // Trigger validation error
      fireEvent.change(input, { target: { value: 'Tag1' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.getByText('Tag already exists')).toBeInTheDocument();

      // Clear error by changing input
      fireEvent.change(input, { target: { value: 'Tag2' } });
      expect(screen.queryByText('Tag already exists')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('clears input on Escape key', () => {
      render(<TagInputWidget config={defaultConfig} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'NewTag' } });
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(input.value).toBe('');
    });

    it('navigates suggestions with arrow keys', async () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        datasourceId: 'tags-ds',
      };
      const bindings = {
        suggestions: ['React', 'Redux', 'React Native'],
      };

      render(
        <TagInputWidget config={config} bindings={bindings} events={{ onChange: mockOnChange }} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Re' } });

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      // Arrow down
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      const firstOption = screen.getByText('React').closest('[role="option"]');
      expect(firstOption).toHaveClass('bg-accent');

      // Arrow down again
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      const secondOption = screen.getByText('Redux').closest('[role="option"]');
      expect(secondOption).toHaveClass('bg-accent');

      // Arrow up
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(firstOption).toHaveClass('bg-accent');
    });

    it('selects suggestion with Enter key', async () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        datasourceId: 'tags-ds',
      };
      const bindings = {
        suggestions: ['React', 'Redux'],
      };

      render(
        <TagInputWidget config={config} bindings={bindings} events={{ onChange: mockOnChange }} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Re' } });

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      // Select first suggestion
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(screen.getAllByText('React')[0]).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledWith(['React']);
    });
  });

  describe('Autocomplete', () => {
    it('shows suggestions when typing', async () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        datasourceId: 'tags-ds',
      };
      const bindings = {
        suggestions: ['React', 'Redux', 'TypeScript'],
      };

      render(<TagInputWidget config={config} bindings={bindings} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Re' } });

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Redux')).toBeInTheDocument();
        expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
      });
    });

    it('filters out already added tags from suggestions', async () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['React'],
        datasourceId: 'tags-ds',
      };
      const bindings = {
        suggestions: ['React', 'Redux'],
      };

      render(<TagInputWidget config={config} bindings={bindings} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Re' } });

      await waitFor(() => {
        expect(screen.getByText('Redux')).toBeInTheDocument();
      });

      // React should appear only once (in tags, not in suggestions)
      const reactElements = screen.getAllByText('React');
      expect(reactElements.length).toBe(1);
    });

    it('adds tag when clicking on suggestion', async () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        datasourceId: 'tags-ds',
      };
      const bindings = {
        suggestions: ['React', 'Redux'],
      };

      render(
        <TagInputWidget config={config} bindings={bindings} events={{ onChange: mockOnChange }} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Re' } });

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('React'));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(['React']);
      });
    });

    it('supports suggestion objects with label and value', async () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        datasourceId: 'tags-ds',
      };
      const bindings = {
        suggestions: [
          { value: 'react', label: 'React Framework' },
          { value: 'vue', label: 'Vue.js Framework' },
        ],
      };

      render(<TagInputWidget config={config} bindings={bindings} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'react' } });

      await waitFor(() => {
        expect(screen.getByText('React Framework')).toBeInTheDocument();
      });
    });

    it('hides suggestions on blur', async () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        datasourceId: 'tags-ds',
      };
      const bindings = {
        suggestions: ['React', 'Redux'],
      };

      render(<TagInputWidget config={config} bindings={bindings} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Re' } });

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText('React')).not.toBeInTheDocument();
      });
    });

    it('shows suggestions on focus if input has value', async () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        datasourceId: 'tags-ds',
      };
      const bindings = {
        suggestions: ['React', 'Redux'],
      };

      render(<TagInputWidget config={config} bindings={bindings} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Re' } });

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText('React')).not.toBeInTheDocument();
      });

      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
    });
  });

  describe('Bindings', () => {
    it('syncs with bindings.tags', () => {
      const { rerender } = render(
        <TagInputWidget config={defaultConfig} bindings={{ tags: ['Tag1'] }} />
      );

      expect(screen.getByText('Tag1')).toBeInTheDocument();

      rerender(<TagInputWidget config={defaultConfig} bindings={{ tags: ['Tag1', 'Tag2'] }} />);

      expect(screen.getByText('Tag1')).toBeInTheDocument();
      expect(screen.getByText('Tag2')).toBeInTheDocument();
    });

    it('uses config.tags when bindings.tags not provided', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        tags: ['ConfigTag'],
      };
      render(<TagInputWidget config={config} />);

      expect(screen.getByText('ConfigTag')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<TagInputWidget config={defaultConfig} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('marks input as invalid when error present', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        error: 'Error message',
      };
      render(<TagInputWidget config={config} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', `${config.id}-error`);
    });

    it('associates help text with input', () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        helpText: 'Help text',
      };
      render(<TagInputWidget config={config} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', `${config.id}-help`);
    });

    it('has proper role for suggestions', async () => {
      const config: TagInputWidgetConfig = {
        ...defaultConfig,
        datasourceId: 'tags-ds',
      };
      const bindings = {
        suggestions: ['React'],
      };

      render(<TagInputWidget config={config} bindings={bindings} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Re' } });

      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();
      });
    });
  });
});
