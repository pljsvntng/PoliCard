import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-full flex items-center justify-center p-8 text-center">
      <div>
        <p className="font-display text-5xl text-ink mb-3">404</p>
        <p className="text-sm text-slate mb-6">This page doesn't exist.</p>
        <Button as={Link} to="/dashboard">Back to dashboard</Button>
      </div>
    </div>
  );
}
