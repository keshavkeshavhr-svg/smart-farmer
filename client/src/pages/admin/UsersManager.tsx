import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldAlert, CheckCircle, Ban } from 'lucide-react';
import { api } from '../../lib/api';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/uiSlice';

export default function UsersManager() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { role: roleFilter, page }],
    queryFn: async () => {
      const res = await api.get('/admin/users', { params: { role: roleFilter, page, limit: 10 } });
      return res as unknown as { data: any[], pagination: any };
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return await api.patch(`/admin/users/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      dispatch(addToast({ type: 'success', title: 'User Updated', message: 'Status changed successfully.' }));
    },
    onError: (err: any) => {
      dispatch(addToast({ type: 'error', title: 'Update Failed', message: err.message || 'Could not change status.' }));
    }
  });

  const filteredUsers = data?.data.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage farmers and buyers on the platform.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10 py-2 border w-full"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="input-field py-2 px-3 border"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Roles</option>
            <option value="FARMER">Farmers</option>
            <option value="BUYER">Buyers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                     <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                        Loading users...
                     </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold uppercase">
                            {user.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">Registered: {new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 ring-purple-700/10' :
                        user.role === 'FARMER' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                        'bg-blue-50 text-blue-700 ring-blue-700/10'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => toggleStatusMutation.mutate({ 
                            id: user.id, 
                            status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' 
                          })}
                          disabled={toggleStatusMutation.isPending}
                          className={`flex items-center gap-1 ml-auto text-xs font-semibold px-2.5 py-1.5 rounded-md border ${
                            user.status === 'ACTIVE' ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? <><Ban className="w-3.5 h-3.5" /> Suspend</> : <><CheckCircle className="w-3.5 h-3.5" /> Activate</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder if needed */}
        {data && data.pagination?.totalPages > 1 && (
           <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-700">Page {data.pagination.page} of {data.pagination.totalPages}</span>
              <div className="flex gap-2">
                 <button 
                  onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="btn bg-white border border-gray-300 py-1 px-3 text-sm"
                 >Previous</button>
                 <button 
                  onClick={() => setPage(p => p + 1)} disabled={page >= data.pagination.totalPages}
                  className="btn bg-white border border-gray-300 py-1 px-3 text-sm"
                 >Next</button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
