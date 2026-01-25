/**
 * MenuIcon Component
 *
 * Renders lucide-react icons dynamically based on icon name string.
 * Used in side menu and other menu components.
 */

import * as LucideIcons from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface MenuIconProps {
  /** Icon name from lucide-react */
  icon: string;

  /** Additional CSS classes */
  className?: string;

  /** Icon size (defaults to 20) */
  size?: number;
}

/**
 * Map of icon name strings to lucide-react icon components
 */
const iconMap: Record<string, React.ComponentType<LucideIcons.LucideProps>> = {
  // Common menu icons
  home: LucideIcons.Home,
  dashboard: LucideIcons.BarChart3,
  users: LucideIcons.Users,
  user: LucideIcons.User,
  settings: LucideIcons.Settings,
  cog: LucideIcons.Settings,

  // Document icons
  file: LucideIcons.FileText,
  files: LucideIcons.Files,
  folder: LucideIcons.Folder,
  document: LucideIcons.FileText,

  // Data icons
  chart: LucideIcons.BarChart3,
  analytics: LucideIcons.TrendingUp,
  reports: LucideIcons.FileBarChart,
  table: LucideIcons.Table,

  // Action icons
  plus: LucideIcons.Plus,
  edit: LucideIcons.Edit,
  trash: LucideIcons.Trash2,
  search: LucideIcons.Search,
  filter: LucideIcons.Filter,
  download: LucideIcons.Download,
  upload: LucideIcons.Upload,

  // Navigation icons
  menu: LucideIcons.Menu,
  'chevron-down': LucideIcons.ChevronDown,
  'chevron-right': LucideIcons.ChevronRight,
  'chevron-left': LucideIcons.ChevronLeft,
  'chevron-up': LucideIcons.ChevronUp,
  'arrow-left': LucideIcons.ArrowLeft,
  'arrow-right': LucideIcons.ArrowRight,

  // Status icons
  check: LucideIcons.Check,
  'check-circle': LucideIcons.CheckCircle,
  'x-circle': LucideIcons.XCircle,
  'alert-circle': LucideIcons.AlertCircle,
  info: LucideIcons.Info,

  // Other icons
  bell: LucideIcons.Bell,
  mail: LucideIcons.Mail,
  calendar: LucideIcons.Calendar,
  clock: LucideIcons.Clock,
  lock: LucideIcons.Lock,
  unlock: LucideIcons.Unlock,
  eye: LucideIcons.Eye,
  'eye-off': LucideIcons.EyeOff,
  heart: LucideIcons.Heart,
  star: LucideIcons.Star,
  bookmark: LucideIcons.Bookmark,
  share: LucideIcons.Share2,
  link: LucideIcons.Link,
  'external-link': LucideIcons.ExternalLink,
  copy: LucideIcons.Copy,
  clipboard: LucideIcons.Clipboard,
  save: LucideIcons.Save,
  'more-vertical': LucideIcons.MoreVertical,
  'more-horizontal': LucideIcons.MoreHorizontal,
};

export function MenuIcon({ icon, className, size = 20 }: MenuIconProps) {
  // Convert icon name to lowercase and find matching component
  const iconName = icon.toLowerCase();
  const IconComponent = iconMap[iconName];

  // Fallback to a default icon if not found
  if (!IconComponent) {
    const FallbackIcon = LucideIcons.Circle;
    return <FallbackIcon className={cn('text-muted-foreground', className)} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}
