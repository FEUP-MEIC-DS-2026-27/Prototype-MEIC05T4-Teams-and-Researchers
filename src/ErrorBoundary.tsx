import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/** Keeps a rendering crash inside the microfrontend from blanking the Shell's slot. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("People & Teams crashed while rendering:", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="pt-root">
        <div className="pt-load-error">
          <p className="pt-error" role="alert">Something went wrong while showing the teams.</p>
          <button onClick={() => this.setState({ failed: false })}>Try again</button>
        </div>
      </div>
    );
  }
}
