import { Component } from 'react'

// Catches render/lifecycle errors anywhere below it and shows a recovery screen
// instead of a blank white page. (React requires a class component for this.)
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Surface it for debugging; in a personal app this is enough.
    console.error('App crashed:', error, info)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-black">
          <div className="card w-full max-w-md p-7 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Something went wrong</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              The page hit an unexpected error. Your data is safe in this browser — try again or reload.
            </p>
            {this.state.error?.message && (
              <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-slate-100 p-2 text-left text-xs text-rose-600 dark:bg-neutral-800 dark:text-rose-300">
                {String(this.state.error.message)}
              </pre>
            )}
            <div className="mt-5 flex justify-center gap-2">
              <button className="btn-ghost" onClick={this.handleReset}>
                Try again
              </button>
              <button className="btn-primary" onClick={() => window.location.reload()}>
                Reload app
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
