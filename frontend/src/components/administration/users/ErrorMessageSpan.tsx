interface ErrorMessageSpanProps {
  errorMessage: string
}

export default function ErrorMessageSpan({
  errorMessage,
}: ErrorMessageSpanProps) {
  return (
    <span className="mb-3 w-full bg-red-200 px-4 py-2 text-sm font-normal tracking-wider text-red-900 shadow-[3px_3px_0_var(--color-red-500),-3px_-3px_0_var(--color-red-300)]">
      {errorMessage}
    </span>
  )
}
