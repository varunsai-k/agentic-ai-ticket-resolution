import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// ==========================================
// BUTTON Component (Min touch size 48px on Mobile)
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={loading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-98",
          // Touch target helper - minimum 48px height on mobile touch screens for regular button sizes, 40px/48px for layout
          {
            'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground': variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground bg-transparent': variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md shadow-destructive/20': variant === 'destructive',
          },
          {
            'h-9 px-3 text-xs md:h-10 md:px-4': size === 'sm',
            'h-12 px-5 text-sm md:h-11 md:px-6': size === 'md', // 48px height default on mobile, 44px on desktop
            'h-14 px-8 text-base md:h-12 md:px-8': size === 'lg', // Larger touch target
            'h-12 w-12 rounded-full md:h-10 md:w-10': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ==========================================
// CARD Component (Clean border, micro-shadows)
// ==========================================
export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden", className)} {...props} />
);

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center p-6 pt-0 border-t border-border/40 mt-4", className)} {...props} />
);

// ==========================================
// BADGE Component
// ==========================================
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      {
        'bg-primary text-primary-foreground': variant === 'default',
        'bg-secondary text-secondary-foreground': variant === 'secondary',
        'border border-border text-foreground': variant === 'outline',
        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20': variant === 'success',
        'bg-amber-500/15 text-amber-400 border border-amber-500/20': variant === 'warning',
        'bg-destructive/15 text-destructive-foreground border border-destructive/20': variant === 'destructive',
      },
      className
    )}
    {...props}
  />
);

// ==========================================
// INPUT Component (Smooth focus, comfortable height)
// ==========================================
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

// ==========================================
// DIALOG / SHEET (Modal drawer helper)
// ==========================================
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog = ({ isOpen, onClose, title, children }: DialogProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative z-55 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl glass animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer h-10 w-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
