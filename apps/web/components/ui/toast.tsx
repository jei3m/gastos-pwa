'use client';

import * as React from 'react';
import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  LoaderCircle,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

type ToastPosition = 'top-center' | 'bottom-right';

const toast = ToastPrimitive.createToastManager();

const TONE_CLASSES: Record<string, string | undefined> = {
  success:
    'border-black bg-[oklch(79.76%_0.2044_153.08)] text-white',
  error:
    'border-black bg-[oklch(62.82%_0.204_26.71)] text-white',
  warning: 'border-black bg-orange-400 text-white',
  info: 'border-black bg-[oklch(62.82%_0.132_231.6)] text-white',
};

function ToastProvider({
  ...props
}: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({
  ...props
}: ToastPrimitive.Portal.Props) {
  return (
    <ToastPrimitive.Portal
      data-slot="toast-portal"
      {...props}
    />
  );
}

function ToastViewport({
  className,
  ...props
}: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        'pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full',
        className
      )}
      {...props}
    />
  );
}

function Toast({
  className,
  position = 'bottom-right',
  ...props
}: ToastPrimitive.Root.Props & {
  position?: ToastPosition;
}) {
  const isTop = position === 'top-center';

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        'group/toast pointer-events-auto absolute right-0 z-[calc(1000-var(--toast-index))] w-full rounded-xl border-2 bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        isTop
          ? 'top-0 origin-top'
          : 'bottom-0 origin-bottom',
        '[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]',
        'h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]',
        isTop
          ? "after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']"
          : "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        'data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
        isTop
          ? 'data-limited:opacity-0 data-starting-style:[transform:translateY(-150%)]'
          : 'data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]',
        isTop
          ? '[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]'
          : '[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]',
        'data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
        'data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
        className
      )}
      {...props}
    />
  );
}

function ToastContent({
  className,
  ...props
}: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        'flex h-full items-center gap-2 overflow-hidden p-2 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100',
        className
      )}
      {...props}
    />
  );
}

function ToastTitle({
  className,
  ...props
}: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn(
        'text-sm text-muted-foreground group-data-[tone=colored]/toast:text-white/80',
        className
      )}
      {...props}
    />
  );
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn('shrink-0', className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "relative shrink-0 text-muted-foreground group-data-[tone=colored]/toast:text-white/80 after:absolute after:-inset-2 after:content-[''] hover:text-foreground group-data-[tone=colored]/toast:hover:text-white",
        className
      )}
      {...props}
    >
      {children ?? <X aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

function ToastIcon({
  type,
  colored = false,
}: {
  type: string | undefined;
  colored?: boolean;
}) {
  const tint = colored ? 'text-white' : undefined;
  let icon: React.ReactNode = null;

  if (type === 'success') {
    icon = (
      <CircleCheck
        className={
          tint ?? 'text-[oklch(79.76%_0.2044_153.08)]'
        }
        aria-hidden="true"
      />
    );
  }

  if (type === 'info') {
    icon = (
      <Info
        className={
          tint ?? 'text-[oklch(62.82%_0.132_231.6)]'
        }
        aria-hidden="true"
      />
    );
  }

  if (type === 'warning') {
    icon = (
      <CircleAlert
        className={tint ?? 'text-orange-400'}
        aria-hidden="true"
      />
    );
  }

  if (type === 'error') {
    icon = (
      <CircleX
        className={
          tint ?? 'text-[oklch(62.82%_0.204_26.71)]'
        }
        aria-hidden="true"
      />
    );
  }

  if (type === 'loading') {
    icon = (
      <LoaderCircle
        className="animate-spin"
        aria-hidden="true"
      />
    );
  }

  if (!icon) {
    return null;
  }

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5"
    >
      {icon}
    </span>
  );
}

function ToastList({
  position = 'bottom-right',
}: {
  position?: ToastPosition;
}) {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => {
    const tone = TONE_CLASSES[toastItem.type ?? ''];

    return (
      <Toast
        key={toastItem.id}
        toast={toastItem}
        position={position}
        data-tone={tone ? 'colored' : 'plain'}
        className={tone}
      >
        <ToastContent>
          <ToastIcon
            type={toastItem.type}
            colored={Boolean(tone)}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <ToastTitle />
            <ToastDescription />
          </div>
          <ToastAction />
          <ToastClose />
        </ToastContent>
      </Toast>
    );
  });
}

type ToasterProps = ToastPrimitive.Provider.Props & {
  position?: ToastPosition;
};

function Toaster({
  children,
  toastManager = toast,
  position,
  ...props
}: ToasterProps) {
  const isMobile = useIsMobile();
  const resolvedPosition: ToastPosition =
    position ?? (isMobile ? 'top-center' : 'bottom-right');

  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport
          className={
            resolvedPosition === 'top-center'
              ? 'top-4 bottom-auto sm:right-auto'
              : undefined
          }
        >
          <ToastList position={resolvedPosition} />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager =
  ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
};
