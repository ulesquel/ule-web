import { twMerge } from 'tailwind-merge'

interface MessageSpanProps {
  message: string
  type: 'error' | 'warning' | 'success'
}

export default function MessageSpan({
  message,
  type = 'error',
}: MessageSpanProps) {
  const CLASS_NAME_BY_TYPE = {
    error:
      'bg-red-200 text-red-900 shadow-[3px_3px_0_var(--color-red-500),-3px_-3px_0_var(--color-red-300)]',
    warning:
      'bg-amber-200 text-amber-900 shadow-[3px_3px_0_var(--color-amber-500),-3px_-3px_0_var(--color-amber-300)]',
    success:
      'bg-emerald-200 text-emerald-900 shadow-[3px_3px_0_var(--color-emerald-500),-3px_-3px_0_var(--color-emerald-300)]',
  }

  return (
    <span
      className={twMerge(
        'mb-3 w-full px-4 py-2 text-sm font-normal tracking-wider',
        CLASS_NAME_BY_TYPE[type],
      )}
    >
      {message}
    </span>
  )
}
