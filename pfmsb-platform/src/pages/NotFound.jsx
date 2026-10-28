import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="page notfound">
      <span className="display notfound-code">404</span>
      <h1 className="display">This branch hasn’t <em>grown</em> yet.</h1>
      <p className="muted">The page you’re looking for doesn’t exist.</p>
      <Button as="a" href="#/app" icon={ArrowLeft}>
        Back to overview
      </Button>
    </div>
  );
}
