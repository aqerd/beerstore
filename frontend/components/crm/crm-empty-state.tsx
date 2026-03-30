import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type CrmEmptyStateProps = {
  icon: LucideIcon
  title?: string
  description?: string
  className?: string
}

export function CrmEmptyState({
  icon: Icon,
  title = 'Нет данных',
  description = 'Пока нет записей для отображения. Возможно, база данных пуста или сервер недоступен.',
  className,
}: CrmEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border px-6 py-12',
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground opacity-50" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="max-w-md text-center text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
