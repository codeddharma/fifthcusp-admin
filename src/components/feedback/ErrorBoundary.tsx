import { Component, ErrorInfo, ReactNode } from 'react'

interface State {
  err: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { err: null }

  static getDerivedStateFromError(err: Error): State {
    return { err }
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', err, info)
  }

  render() {
    if (this.state.err) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-lg font-semibold text-shell-heading">Something went wrong</h1>
          <p className="max-w-md text-sm text-shell-muted">{this.state.err.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-brand-deep px-4 py-2 text-sm font-medium text-white hover:bg-brand-violet"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
