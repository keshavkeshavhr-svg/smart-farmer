import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();
  
  let title = 'Oops! Something went wrong.';
  let message = 'An unexpected error has occurred.';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = '404 - Page Not Found';
      message = 'The page you are looking for does not exist.';
    } else if (error.status === 401) {
      title = '401 - Unauthorized';
      message = 'Please log in to access this page.';
    } else if (error.status === 403) {
      title = '403 - Forbidden';
      message = 'You do not have permission to access this page.';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-lg text-gray-600 mb-8">{message}</p>
      <Link 
        to="/" 
        className="btn btn-primary"
      >
        Return to Home
      </Link>
    </div>
  );
}
