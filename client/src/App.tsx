import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useAppDispatch } from './store/hooks';
import { setCredentials, setLoading } from './store/slices/authSlice';
import { api } from './lib/api';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check session on app load
    api.get('/auth/me')
      .then((user) => {
        dispatch(setCredentials({ user }));
      })
      .catch(() => {
        dispatch(setLoading(false));
      });
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
