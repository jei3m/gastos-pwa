import { createElement, useMemo, useState } from 'react';
import { Search, SquareDashed, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  getGroupedIconsByType,
  getIconById,
  searchIconsByType,
} from '@/lib/icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface IconPickerProps {
  value: string;
  onChange: (iconId: string) => void;
  type: string;
  triggerClassName?: string;
  previewSize?: number;
}

export default function IconPicker({
  value,
  onChange,
  type,
  triggerClassName,
  previewSize = 60,
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const isMobile = useIsMobile();

  const grouped = useMemo(
    () => getGroupedIconsByType(type),
    [type]
  );
  const results = useMemo(
    () => searchIconsByType(type, query),
    [type, query]
  );
  const isSearching = query.trim().length > 0;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setQuery('');
  };

  const handleSelect = (iconId: string) => {
    onChange(iconId);
    handleOpenChange(false);
  };

  const renderIcon = (iconId: string | undefined) => {
    const iconData = iconId
      ? getIconById(iconId, type)
      : undefined;
    if (!iconData) {
      return (
        <SquareDashed
          size={previewSize}
          className="text-muted-foreground"
        />
      );
    }
    return createElement(iconData.icon, {
      size: previewSize,
    });
  };

  const renderButton = (iconId: string) => {
    const iconData = getIconById(iconId, type);
    if (!iconData) return null;
    const selected = value === iconData.id;
    return (
      <Button
        key={`${iconData.type}-${iconData.id}`}
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => handleSelect(iconData.id)}
        className={cn(
          'flex items-center justify-center border-0 bg-transparent text-muted-foreground transition-colors',
          isMobile
            ? 'size-10 [&_svg]:size-6'
            : 'size-12 [&_svg]:size-8',
          'hover:bg-muted hover:text-foreground',
          selected && 'bg-gray-200 text-foreground'
        )}
      >
        {createElement(iconData.icon, {
          className: isMobile ? 'size-6' : 'size-8',
        })}
      </Button>
    );
  };

  const renderContent = () => (
    <div className="flex min-h-0 flex-1 flex-col gap-4 md:gap-6">
      <div className="relative shrink-0">
        <Search
          size={18}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons..."
          className="pr-9 pl-9 border-0 bg-gray-200"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQuery('')}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-600"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        {isSearching ? (
          <div>
            <p className="px-1 pb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {results.length}{' '}
              {results.length === 1 ? 'Result' : 'Results'}
            </p>
            {results.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {results.map((icon) =>
                  renderButton(icon.id)
                )}
              </div>
            ) : (
              <p className="px-1 py-8 text-center text-sm text-muted-foreground">
                No icons found for “{query.trim()}”.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6 md:gap-8">
            {grouped.map((group) => (
              <div key={group.category}>
                <p className="px-1 pb-2 text-sm md:text-md font-semibold text-muted-foreground">
                  {group.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.icons.map((icon) =>
                    renderButton(icon.id)
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTrigger = () => (
    <div
      className={cn(
        'flex h-28 w-28 cursor-pointer items-center justify-center rounded-xl border-2 border-black bg-white md:h-34 md:w-34',
        triggerClassName
      )}
    >
      {renderIcon(value)}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger
          nativeButton={false}
          render={renderTrigger()}
        />
        <DrawerContent className="border-2 border-black flex max-h-[85vh] flex-col p-4">
          <DrawerHeader className="px-1 pt-1 pb-2">
            <DrawerTitle className="text-left text-xl">
              Select an Icon
            </DrawerTitle>
          </DrawerHeader>
          {renderContent()}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        nativeButton={false}
        render={renderTrigger()}
      />
      <DialogContent className="border-2 flex max-h-[85vh] flex-col p-4 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Select an Icon
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
