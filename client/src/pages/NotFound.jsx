import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Page Not Found | ConnectSphere';
  }, []);

  return (
    <div className="w-full py-16 flex items-center justify-center">
      <EmptyState
        icon={Home}
        title="404 — Page Not Found"
        description="The link you followed may be broken, or the content has been moved to another sphere."
        actionLabel="Return to Feed"
        onAction={() => navigate('/')}
      />
    </div>
  );
};

export default NotFound;
