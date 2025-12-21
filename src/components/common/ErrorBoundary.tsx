import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Log for debugging; keeps the rest of the UI usable.
    console.error("ErrorBoundary caught:", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-destructive/10 p-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{this.props.title ?? "Section failed to load"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {this.props.description ??
                "This part of the page crashed. You can retry, and the rest of the dashboard will keep working."}
            </p>
            <div className="mt-4">
              <Button size="sm" variant="secondary" onClick={this.handleRetry}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
