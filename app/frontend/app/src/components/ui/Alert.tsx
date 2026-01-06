import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/app/src/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'border-destructive text-destructive bg-card [&>svg]:text-destructive [&_*[data-slot=alert-description]]:!text-destructive',
        promotion:
          'bg-gradient-to-r from-jolananas-pink-medium/10 via-jolananas-peach-pink/10 to-jolananas-pink-deep/10 border-jolananas-pink-medium/20 text-jolananas-black-ink dark:from-jolananas-pink-medium/20 dark:via-jolananas-peach-pink/20 dark:to-jolananas-pink-deep/20 dark:border-jolananas-pink-medium/30 dark:text-jolananas-white-soft [&>svg]:text-jolananas-pink-medium dark:[&>svg]:text-jolananas-pink-soft',
        info: 'bg-blue-50/90 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-800/60 text-blue-900 dark:text-blue-100 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
        warning:
          'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/60 text-amber-900 dark:text-amber-100 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400',
        success:
          'bg-green-50/90 dark:bg-green-950/30 border-green-200/60 dark:border-green-800/60 text-green-900 dark:text-green-100 [&>svg]:text-green-600 dark:[&>svg]:text-green-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        // Si le parent a variant="destructive", le texte sera rouge via le sélecteur parent
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
