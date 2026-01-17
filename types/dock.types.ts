type IconComponentType = React.ElementType<{
  className?: string;
}>;

export interface DockItem {
  label: string;
  icon: IconComponentType;
  route: string;
  onClick?: () => void;
}

export interface DockProps {
  items?: DockItem[];
  className?: string;
  variant?: 'default' | 'compact' | 'large';
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  animated?: boolean;
}
