import { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-shell-bg p-4">
      <div className="surface w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="text-brand-deep" size={20} />
          <span className="text-base font-semibold text-shell-heading">FifthCusp Admin</span>
        </div>
        {children}
      </div>
    </div>
  )
}
