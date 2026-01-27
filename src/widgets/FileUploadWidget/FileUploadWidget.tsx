/**
 * FileUploadWidget Component
 *
 * Generic file upload component with drag-and-drop support.
 * Supports multiple files, file type restrictions, size limits, and image preview.
 */

import * as Icons from 'lucide-react';
import { useCallback, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { FileUploadWidgetConfig, UploadedFile } from './types';

export function FileUploadWidget({
  config,
  bindings,
  events,
}: WidgetProps<FileUploadWidgetConfig>) {
  const {
    label,
    accept,
    multiple = false,
    maxSize,
    maxFiles,
    preview = true,
    helpText,
    disabled = false,
    className,
  } = config;

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Icons
  const UploadIcon = Icons.Upload as React.ComponentType<{ className?: string }>;
  const XIcon = Icons.X as React.ComponentType<{ className?: string }>;
  const FileIcon = Icons.File as React.ComponentType<{ className?: string }>;
  const ImageIcon = Icons.Image as React.ComponentType<{ className?: string }>;
  const AlertCircleIcon = Icons.AlertCircle as React.ComponentType<{ className?: string }>;

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
  };

  // Validate file
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

        const isAccepted = acceptedTypes.some(acceptedType => {
          if (acceptedType.startsWith('.')) {
            return fileExtension === acceptedType.toLowerCase();
          }
          if (acceptedType.endsWith('/*')) {
            const baseType = acceptedType.split('/')[0];
            return fileType.startsWith(`${baseType}/`);
          }
          return fileType === acceptedType;
        });

        if (!isAccepted) {
          return `File type "${file.type}" is not accepted`;
        }
      }

      // Check file size
      if (maxSize && file.size > maxSize) {
        return `File size ${formatFileSize(file.size)} exceeds maximum ${formatFileSize(maxSize)}`;
      }

      return null;
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: formatFileSize is a stable function defined in component scope
    [accept, maxSize, formatFileSize]
  );

  // Handle file selection
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const newFiles: UploadedFile[] = [];
      let validationError: string | null = null;

      // Check max files limit
      if (maxFiles && files.length + fileList.length > maxFiles) {
        setError(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
        return;
      }

      // Process each file
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        // Validate file
        const error = validateFile(file);
        if (error) {
          validationError = error;
          break;
        }

        // Create file object
        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${i}-${file.name}`,
          file,
          progress: 0,
        };

        // Generate preview for images
        if (preview && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            uploadedFile.preview = reader.result as string;
            setFiles(prev =>
              prev.map(f =>
                f.id === uploadedFile.id ? { ...f, preview: uploadedFile.preview } : f
              )
            );
          };
          reader.readAsDataURL(file);
        }

        newFiles.push(uploadedFile);

        // Break if not multiple
        if (!multiple) break;
      }

      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);

      // Trigger event
      if (events?.onActionClick) {
        events.onActionClick('filesSelected', {
          files: updatedFiles.map(f => f.file),
        });
      }
    },
    [files, multiple, maxFiles, preview, events, validateFile]
  );

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input value to allow re-selecting the same file
    e.target.value = '';
  };

  // Handle file removal
  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);

    // Revoke preview URL to free memory
    const removedFile = files.find(f => f.id === fileId);
    if (removedFile?.preview) {
      URL.revokeObjectURL(removedFile.preview);
    }

    // Trigger event
    if (events?.onActionClick) {
      events.onActionClick('fileRemoved', {
        fileId,
        files: updatedFiles.map(f => f.file),
      });
    }

    setError(null);
  };

  // Determine if image file
  const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
  };

  return (
    <div className={cn('space-y-4', bindings?.className as string, className)}>
      {/* Label */}
      {label && <Label>{label}</Label>}

      {/* Upload area - using div with role="button" instead of <button> for better drag-and-drop UX */}
      {/* biome-ignore lint/a11y/useSemanticElements: Div with role=button provides better drag-and-drop UX than button element */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors',
          isDragging && !disabled
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={e => {
          if (!disabled) {
            const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
            input?.click();
          }
        }}
        onKeyDown={e => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
            input?.click();
          }
        }}
      >
        <input
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          aria-label={label || 'Upload files'}
        />

        <div className="flex flex-col items-center justify-center p-8 text-center">
          <UploadIcon className="h-12 w-12 mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-xs text-muted-foreground mb-4">or click to browse</p>

          {helpText && <p className="text-xs text-muted-foreground mt-2">{helpText}</p>}

          {(accept || maxSize || maxFiles) && (
            <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
              {accept && <p>Accepted: {accept}</p>}
              {maxSize && <p>Max size: {formatFileSize(maxSize)}</p>}
              {maxFiles && <p>Max files: {maxFiles}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Uploaded Files ({files.length}
            {maxFiles && `/${maxFiles}`})
          </Label>
          <div className="space-y-2">
            {files.map(uploadedFile => (
              <div
                key={uploadedFile.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
              >
                {/* File icon or preview */}
                <div className="flex-shrink-0">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : isImageFile(uploadedFile.file) ? (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  ) : (
                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFile(uploadedFile.id)}
                  disabled={disabled}
                  aria-label={`Remove ${uploadedFile.file.name}`}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

FileUploadWidget.displayName = 'FileUploadWidget';
