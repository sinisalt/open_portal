/**
 * FileUploadWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Uploaded file information
 */
export interface UploadedFile {
  /** Unique file identifier */
  id: string;

  /** File object */
  file: File;

  /** File preview URL (for images) */
  preview?: string;

  /** Upload progress (0-100) */
  progress?: number;

  /** Upload error message */
  error?: string;
}

/**
 * FileUpload widget configuration
 *
 * Generic file upload component with drag-and-drop support.
 * Can upload any file type (images, documents, etc.) with validation.
 */
export interface FileUploadWidgetConfig extends BaseWidgetConfig {
  type: 'FileUpload';

  /** Label text for the upload area */
  label?: string;

  /** Accepted MIME types (e.g., "image/*", "application/pdf") */
  accept?: string;

  /** Allow multiple file uploads */
  multiple?: boolean;

  /** Maximum file size in bytes */
  maxSize?: number;

  /** Maximum number of files */
  maxFiles?: number;

  /** Upload URL endpoint */
  uploadUrl?: string;

  /** Show image preview for image files */
  preview?: boolean;

  /** Custom CSS class */
  className?: string;

  /** Help text displayed below upload area */
  helpText?: string;

  /** Whether the upload is disabled */
  disabled?: boolean;
}
