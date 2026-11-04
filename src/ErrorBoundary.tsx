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
      <div className="alert alert-danger" role="alert">
        <p>Something went wrong while showing the teams.</p>
        <button className="btn btn-outline-danger" onClick={() => this.setState({ failed: false })}>
          Try again
        </button>
      </div>
    );
  }
}
