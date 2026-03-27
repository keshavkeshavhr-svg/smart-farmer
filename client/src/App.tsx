import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from './store/hooks';
import { setCredentials, setLoading } from './store/slices/authSlice';
import { clearCart } from './store/slices/cartSlice';
import { api } from './lib/api';

function App() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check session on app load
    api.get('/auth/me')
      .then((user) => {
        dispatch(setCredentials({ user }));
      })
      .catch(() => {
        // No valid session — ensure no stale data from a previous user is visible
        queryClient.clear();
        dispatch(clearCart());
        dispatch(setLoading(false));
      });
  }, [dispatch, queryClient]);

  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}

export default App;
