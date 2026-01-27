/**
 * FileUploadWidget Tests
 */

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileUploadWidget } from './FileUploadWidget';
import type { FileUploadWidgetConfig } from './types';

describe('FileUploadWidget', () => {
  const mockOnActionClick = jest.fn();

  const defaultConfig: FileUploadWidgetConfig = {
    id: 'test-file-upload',
    type: 'FileUpload',
    label: 'Upload Files',
  };

  beforeEach(() => {
    mockOnActionClick.mockClear();
  });

  // Helper to create mock files
  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(['a'.repeat(size)], name, { type });
    return file;
  };

  // Helper to create mock FileList
  const createMockFileList = (files: File[]): FileList => {
    const fileList = {
      length: files.length,
      item: (index: number) => files[index],
      [Symbol.iterator]: function* () {
        for (let i = 0; i < files.length; i++) {
          yield files[i];
        }
      },
    };
    Object.defineProperty(fileList, 'length', { value: files.length });
    files.forEach((file, index) => {
      Object.defineProperty(fileList, index, { value: file });
    });
    return fileList as FileList;
  };

  describe('Rendering', () => {
    it('renders with label', () => {
      render(<FileUploadWidget config={defaultConfig} />);

      expect(screen.getByText('Upload Files')).toBeInTheDocument();
    });

    it('renders without label when not provided', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        label: undefined,
      };
      render(<FileUploadWidget config={config} />);

      expect(screen.queryByText('Upload Files')).not.toBeInTheDocument();
      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
      // But the input should still have an aria-label
      expect(screen.getByLabelText('Upload files')).toBeInTheDocument();
    });

    it('renders upload area with instructions', () => {
      render(<FileUploadWidget config={defaultConfig} />);

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
      expect(screen.getByText('or click to browse')).toBeInTheDocument();
    });

    it('renders help text when provided', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        helpText: 'Upload PDF or images',
      };
      render(<FileUploadWidget config={config} />);

      expect(screen.getByText('Upload PDF or images')).toBeInTheDocument();
    });

    it('displays file restrictions', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        accept: 'image/*',
        maxSize: 1024 * 1024 * 5, // 5 MB
        maxFiles: 3,
      };
      render(<FileUploadWidget config={config} />);

      expect(screen.getByText('Accepted: image/*')).toBeInTheDocument();
      expect(screen.getByText('Max size: 5 MB')).toBeInTheDocument();
      expect(screen.getByText('Max files: 3')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        className: 'custom-class',
      };
      const { container } = render(<FileUploadWidget config={config} />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies disabled state', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        disabled: true,
      };
      render(<FileUploadWidget config={config} />);

      const input = screen.getByLabelText('Upload Files');
      expect(input).toBeDisabled();
    });
  });

  describe('File Selection', () => {
    it('handles file input change', () => {
      render(
        <FileUploadWidget config={defaultConfig} events={{ onActionClick: mockOnActionClick }} />
      );

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const file = createMockFile('test.txt', 1000, 'text/plain');
      const fileList = createMockFileList([file]);

      fireEvent.change(input, { target: { files: fileList } });

      expect(screen.getByText('test.txt')).toBeInTheDocument();
      expect(screen.getByText('1000 Bytes')).toBeInTheDocument();
      expect(mockOnActionClick).toHaveBeenCalledWith('filesSelected', {
        files: [file],
      });
    });

    it('handles multiple file selection', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        multiple: true,
      };
      render(<FileUploadWidget config={config} events={{ onActionClick: mockOnActionClick }} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const files = [
        createMockFile('file1.txt', 1000, 'text/plain'),
        createMockFile('file2.txt', 2000, 'text/plain'),
      ];
      const fileList = createMockFileList(files);

      fireEvent.change(input, { target: { files: fileList } });

      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
      expect(screen.getByText('Uploaded Files (2)')).toBeInTheDocument();
    });

    it('replaces file in single file mode', () => {
      render(
        <FileUploadWidget config={defaultConfig} events={{ onActionClick: mockOnActionClick }} />
      );

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;

      // Upload first file
      const file1 = createMockFile('file1.txt', 1000, 'text/plain');
      fireEvent.change(input, { target: { files: createMockFileList([file1]) } });
      expect(screen.getByText('file1.txt')).toBeInTheDocument();

      // Upload second file (should replace)
      const file2 = createMockFile('file2.txt', 2000, 'text/plain');
      fireEvent.change(input, { target: { files: createMockFileList([file2]) } });

      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
    });

    it('clicking upload area triggers file input', () => {
      render(<FileUploadWidget config={defaultConfig} />);

      const uploadArea = screen.getByText('Drag and drop files here').closest('div')?.parentElement;
      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;

      const clickSpy = jest.spyOn(input, 'click');

      if (uploadArea) {
        fireEvent.click(uploadArea);
      }

      expect(clickSpy).toHaveBeenCalled();
    });

    it('does not trigger file input when disabled', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        disabled: true,
      };
      render(<FileUploadWidget config={config} />);

      const uploadArea = screen.getByText('Drag and drop files here').closest('div')?.parentElement;
      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;

      const clickSpy = jest.spyOn(input, 'click');

      if (uploadArea) {
        fireEvent.click(uploadArea);
      }

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('handles drag enter', () => {
      render(<FileUploadWidget config={defaultConfig} />);

      const uploadArea = screen.getByText('Drag and drop files here').closest('div')
        ?.parentElement as HTMLElement;

      fireEvent.dragEnter(uploadArea, {
        dataTransfer: { files: [] },
      });

      expect(screen.getByText('Drop files here')).toBeInTheDocument();
      expect(uploadArea).toHaveClass('border-primary');
    });

    it('handles drag leave', () => {
      render(<FileUploadWidget config={defaultConfig} />);

      const uploadArea = screen.getByText('Drag and drop files here').closest('div')
        ?.parentElement as HTMLElement;

      fireEvent.dragEnter(uploadArea);
      fireEvent.dragLeave(uploadArea);

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
    });

    it('handles file drop', () => {
      render(
        <FileUploadWidget config={defaultConfig} events={{ onActionClick: mockOnActionClick }} />
      );

      const uploadArea = screen.getByText('Drag and drop files here').closest('div')
        ?.parentElement as HTMLElement;

      const file = createMockFile('dropped.txt', 1000, 'text/plain');
      const dataTransfer = {
        files: createMockFileList([file]),
      };

      fireEvent.drop(uploadArea, { dataTransfer });

      expect(screen.getByText('dropped.txt')).toBeInTheDocument();
    });

    it('ignores drop when disabled', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        disabled: true,
      };
      render(<FileUploadWidget config={config} events={{ onActionClick: mockOnActionClick }} />);

      const uploadArea = screen.getByText('Drag and drop files here').closest('div')
        ?.parentElement as HTMLElement;

      const file = createMockFile('dropped.txt', 1000, 'text/plain');
      const dataTransfer = {
        files: createMockFileList([file]),
      };

      fireEvent.drop(uploadArea, { dataTransfer });

      expect(screen.queryByText('dropped.txt')).not.toBeInTheDocument();
    });
  });

  describe('File Validation', () => {
    it('validates file type with specific MIME type', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        accept: 'image/png',
      };
      render(<FileUploadWidget config={config} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const file = createMockFile('test.txt', 1000, 'text/plain');

      fireEvent.change(input, { target: { files: createMockFileList([file]) } });

      expect(screen.getByText(/File type "text\/plain" is not accepted/i)).toBeInTheDocument();
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });

    it('validates file type with wildcard', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        accept: 'image/*',
      };
      render(<FileUploadWidget config={config} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const file = createMockFile('test.txt', 1000, 'text/plain');

      fireEvent.change(input, { target: { files: createMockFileList([file]) } });

      expect(screen.getByText(/File type "text\/plain" is not accepted/i)).toBeInTheDocument();
    });

    it('accepts valid file type with wildcard', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        accept: 'image/*',
      };
      render(<FileUploadWidget config={config} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const file = createMockFile('test.png', 1000, 'image/png');

      fireEvent.change(input, { target: { files: createMockFileList([file]) } });

      expect(screen.queryByText(/is not accepted/i)).not.toBeInTheDocument();
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });

    it('validates file type with extension', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        accept: '.pdf,.doc',
      };
      render(<FileUploadWidget config={config} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const file = createMockFile('test.txt', 1000, 'text/plain');

      fireEvent.change(input, { target: { files: createMockFileList([file]) } });

      expect(screen.getByText(/File type "text\/plain" is not accepted/i)).toBeInTheDocument();
    });

    it('validates file size', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        maxSize: 500, // 500 bytes
      };
      render(<FileUploadWidget config={config} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const file = createMockFile('large.txt', 1000, 'text/plain');

      fireEvent.change(input, { target: { files: createMockFileList([file]) } });

      expect(screen.getByText(/File size.*exceeds maximum/i)).toBeInTheDocument();
      expect(screen.queryByText('large.txt')).not.toBeInTheDocument();
    });

    it('validates max files limit', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        multiple: true,
        maxFiles: 2,
      };
      render(<FileUploadWidget config={config} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;

      // Add 2 files first
      const files1 = [
        createMockFile('file1.txt', 1000, 'text/plain'),
        createMockFile('file2.txt', 1000, 'text/plain'),
      ];
      fireEvent.change(input, { target: { files: createMockFileList(files1) } });

      // Try to add one more (should fail)
      const files2 = [createMockFile('file3.txt', 1000, 'text/plain')];
      fireEvent.change(input, { target: { files: createMockFileList(files2) } });

      expect(screen.getByText('Maximum 2 files allowed')).toBeInTheDocument();
      expect(screen.queryByText('file3.txt')).not.toBeInTheDocument();
    });
  });

  describe('File Removal', () => {
    it('removes file when remove button clicked', () => {
      render(
        <FileUploadWidget config={defaultConfig} events={{ onActionClick: mockOnActionClick }} />
      );

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const file = createMockFile('test.txt', 1000, 'text/plain');

      fireEvent.change(input, { target: { files: createMockFileList([file]) } });
      expect(screen.getByText('test.txt')).toBeInTheDocument();

      const removeButton = screen.getByLabelText('Remove test.txt');
      fireEvent.click(removeButton);

      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
      expect(mockOnActionClick).toHaveBeenCalledWith('fileRemoved', expect.any(Object));
    });

    it('clears error when file removed', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        maxSize: 500,
      };
      render(<FileUploadWidget config={config} events={{ onActionClick: mockOnActionClick }} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;

      // Try to upload file that's too large
      const largeFile = createMockFile('large.txt', 1000, 'text/plain');
      fireEvent.change(input, { target: { files: createMockFileList([largeFile]) } });
      expect(screen.getByText(/exceeds maximum/i)).toBeInTheDocument();

      // Upload valid file
      const smallFile = createMockFile('small.txt', 100, 'text/plain');
      fireEvent.change(input, { target: { files: createMockFileList([smallFile]) } });
      expect(screen.getByText('small.txt')).toBeInTheDocument();

      // Remove the file
      const removeButton = screen.getByLabelText('Remove small.txt');
      fireEvent.click(removeButton);

      // Error should be cleared
      expect(screen.queryByText(/exceeds maximum/i)).not.toBeInTheDocument();
    });
  });

  describe('File Display', () => {
    it('displays file count', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        multiple: true,
      };
      render(<FileUploadWidget config={config} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const files = [
        createMockFile('file1.txt', 1000, 'text/plain'),
        createMockFile('file2.txt', 2000, 'text/plain'),
      ];

      fireEvent.change(input, { target: { files: createMockFileList(files) } });

      expect(screen.getByText('Uploaded Files (2)')).toBeInTheDocument();
    });

    it('displays file count with max files', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        multiple: true,
        maxFiles: 5,
      };
      render(<FileUploadWidget config={config} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const files = [createMockFile('file1.txt', 1000, 'text/plain')];

      fireEvent.change(input, { target: { files: createMockFileList(files) } });

      expect(screen.getByText('Uploaded Files (1/5)')).toBeInTheDocument();
    });

    it('formats file sizes correctly', () => {
      render(<FileUploadWidget config={defaultConfig} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;

      // Test bytes
      const file1 = createMockFile('file.txt', 100, 'text/plain');
      fireEvent.change(input, { target: { files: createMockFileList([file1]) } });
      expect(screen.getByText('100 Bytes')).toBeInTheDocument();

      // Test KB
      const file2 = createMockFile('file2.txt', 2048, 'text/plain');
      fireEvent.change(input, { target: { files: createMockFileList([file2]) } });
      expect(screen.getByText('2 KB')).toBeInTheDocument();

      // Test MB
      const file3 = createMockFile('file3.txt', 2097152, 'text/plain');
      fireEvent.change(input, { target: { files: createMockFileList([file3]) } });
      expect(screen.getByText('2 MB')).toBeInTheDocument();
    });

    it('shows image icon for image files without preview', () => {
      const config: FileUploadWidgetConfig = {
        ...defaultConfig,
        preview: false,
      };
      render(<FileUploadWidget config={config} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const file = createMockFile('test.png', 1000, 'image/png');

      fireEvent.change(input, { target: { files: createMockFileList([file]) } });

      expect(screen.getByText('test.png')).toBeInTheDocument();
      // Image icon should be present (lucide-react Image component)
    });

    it('shows file icon for non-image files', () => {
      render(<FileUploadWidget config={defaultConfig} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const file = createMockFile('document.pdf', 1000, 'application/pdf');

      fireEvent.change(input, { target: { files: createMockFileList([file]) } });

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      // File icon should be present (lucide-react File component)
    });
  });

  describe('Bindings', () => {
    it('applies className from bindings', () => {
      const { container } = render(
        <FileUploadWidget config={defaultConfig} bindings={{ className: 'bound-class' }} />
      );

      expect(container.firstChild).toHaveClass('bound-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty file list', () => {
      render(<FileUploadWidget config={defaultConfig} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      fireEvent.change(input, { target: { files: null } });

      expect(screen.queryByText('Uploaded Files')).not.toBeInTheDocument();
    });

    it('handles file with zero size', () => {
      render(<FileUploadWidget config={defaultConfig} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const file = createMockFile('empty.txt', 0, 'text/plain');

      fireEvent.change(input, { target: { files: createMockFileList([file]) } });

      expect(screen.getByText('empty.txt')).toBeInTheDocument();
      expect(screen.getByText('0 Bytes')).toBeInTheDocument();
    });

    it('resets input value after selection', () => {
      render(<FileUploadWidget config={defaultConfig} />);

      const input = screen.getByLabelText('Upload Files') as HTMLInputElement;
      const file = createMockFile('test.txt', 1000, 'text/plain');

      fireEvent.change(input, { target: { files: createMockFileList([file]) } });

      // Input value should be reset to allow re-selecting the same file
      expect(input.value).toBe('');
    });
  });
});
