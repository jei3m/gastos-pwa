import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';

import { cn } from '@/lib/utils';

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'bg-gray-300 shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:h-full data-vertical:w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
