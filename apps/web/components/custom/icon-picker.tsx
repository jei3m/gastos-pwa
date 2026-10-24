import { createElement, useState } from 'react';
import { SquareDashed } from 'lucide-react';
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
import { Card } from '@/components/ui/card';
import {
  getIconById,
  getIconsByType,
  type IconData,
} from '@/lib/icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value: string;
  onChange: (iconId: string) => void;
  type: string;
  triggerClassName?: string;
  iconSize?: number;
  previewSize?: number;
}

export default function IconPicker({
  value,
  onChange,
  type,
  iconSize = 32,
  previewSize = 60,
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const renderIcon = (iconId: string | undefined) => {
    if (!iconId) {
      return (
        <SquareDashed
          size={previewSize}
          className="text-gray-400"
        />
      );
    }

    const iconData = getIconById(iconId);
    if (!iconData) {
      return (
        <SquareDashed
          size={previewSize}
          className="text-gray-400"
        />
      );
    }

    return createElement(iconData.icon, {
      size: previewSize,
    });
  };

  const renderContent = () => (
    <div className="w-full overflow-y-auto p-2">
      <div className="grid grid-cols-4 gap-2">
        {getIconsByType(type).map((iconData: IconData) => (
          <div
            key={iconData.id}
            className="flex items-center justify-center"
            onClick={() => {
              onChange(iconData.id);
              setIsOpen(false);
            }}
          >
            <Card
              className={cn(
                'flex w-full cursor-pointer items-center justify-center border-2 border-black bg-white text-black'
              )}
            >
              {createElement(iconData.icon, {
                size: iconSize,
              })}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrigger = () => (
    <div className="flex h-28 w-28 cursor-pointer items-center justify-center rounded-xl border-2 border-black bg-white md:h-34 md:w-34">
      {renderIcon(value)}
    </div>
  );

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger
            nativeButton={false}
            render={renderTrigger()}
          />
          <DrawerContent
            className={cn(
              'max-h-[80vh] p-2',
              type.toLowerCase() === 'expense'
                ? 'bg-red-500'
                : 'bg-primary'
            )}
          >
            <DrawerHeader className="-mb-2">
              <DrawerTitle className="text-xl">
                Select an Icon
              </DrawerTitle>
            </DrawerHeader>
            {renderContent()}
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  // Desktop: Use Dialog
  return (
    <div className="flex flex-col items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger
          nativeButton={false}
          render={renderTrigger()}
        />
        <DialogContent
          className={cn(
            'max-h-[80vh] min-w-[700px] p-4',
            type.toLowerCase() === 'expense'
              ? 'bg-red-500'
              : 'bg-primary'
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Select an Icon
            </DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
