import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function TypographyH1({
  children,
  className,
  ...props   
}: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
  return (
    <h1 {...props}
      className={cn(
        'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
        className
      )}        
    >
      {children}
    </h1>
  )
};

export function TypographyH2({
  children,
  className,
  ...props    
}: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
  return (
    <h2 {...props}
      className={cn(
        'scroll-m-20 text-center text-3xl font-extrabold tracking-tight text-balance',
        className
      )}        
    >
      {children}
    </h2>
  )
};

export function TypographyH3({
    children,
    className,
    ...props    
}: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
  return (
    <h3 {...props}
      className={cn(
        'scroll-m-20 text-2xl font-extrabold tracking-tight',
        className
      )}
    >
      {children}
    </h3>
  )
};

export function TypographyH4({
  children,
  className,
  ...props    
}: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
  return (
    <h4 {...props}
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight',
        className
      )}
    >
      {children}
    </h4>
  )
};

export function TypographyH5({
  children,
  className,
  ...props    
}: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
  return (
    <h5 {...props}
      className={cn(
        'scroll-m-20 text-lg font-regular tracking-tight',
        className
      )}
    >
      {children}
    </h5>
  )
};

export function TypographyP({
  children,
  className,
  ...props  
}: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
  return (
    <p {...props}
      className={cn(
        'leading-7 [&:not(:first-child)]:mt-6',
        className
      )}
    >
      {children}
    </p>
  )
};