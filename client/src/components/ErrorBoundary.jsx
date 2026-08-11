import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex",
          alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 16, padding: 40,
          background: "var(--bg)", color: "var(--text)",
          fontFamily: "var(--font-body)",
        }}>
          <div style={{ fontSize: 48 }}>💔</div>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 28 }}>Something went wrong</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 400, textAlign: "center", lineHeight: 1.6 }}>
            {this.state.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            style={{
              background: "var(--red)", border: "none", borderRadius: 8,
              padding: "10px 24px", color: "#fff", fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
