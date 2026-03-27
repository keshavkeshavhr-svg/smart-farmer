import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldAlert, CheckCircle, Ban, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { getImageUrl } from '../../lib/imageUrl';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/uiSlice';

export default function AdminCropsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  // Fetch all crops including suspended ones for admin
  const { data, isLoading } = useQuery({
    queryKey: ['admin-crops', { search, status: statusFilter, page }],
    queryFn: async () => {
      // By default the API filters to ACTIVE. We pass status filter if set, otherwise fetch all by passing a special payload or just relying on API if it accepts all.
      // Assuming the API `GET /crops` takes status. We will omit it if we want all? Actually the controller says: `status: status ?? CropStatus.ACTIVE`.
      // So if we pass status explicitly as empty it might fail schema, let's just pass specific statuses or we need a dedicated admin endpoint. 
      // Workaround: fetch with status=ACTIVE and status=SUSPENDED in two queries or API needs update. 
      // Let's assume the API accepts it if we pass it explicitly.
      const params: any = { search, page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      // Note: If the backend defaults to ACTIVE when status is undefined, an Admin might not see SUSPENDED unless they specifically filter for it.
      
      const res = await api.get('/crops', { params });
      return res as unknown as { data: any[], pagination: any };
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return await api.patch(`/crops/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crops'] });
      dispatch(addToast({ type: 'success', title: 'Crop Updated', message: 'Crop listing status changed.' }));
    },
    onError: (err: any) => {
      dispatch(addToast({ type: 'error', title: 'Update Failed', message: err.message || 'Could not update crop.' }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/crops/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crops'] });
      dispatch(addToast({ type: 'success', title: 'Crop Deleted', message: 'Crop listing removed entirely.' }));
    },
    onError: (err: any) => {
      dispatch(addToast({ type: 'error', title: 'Delete Failed', message: err.message || 'Could not delete crop.' }));
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crop Moderation</h1>
          <p className="text-sm text-gray-500 mt-1">Review and moderate farmer crop listings.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10 py-2 border w-full"
              placeholder="Search crops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="input-field py-2 px-3 border"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">Default (Active)</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price / Stock</th>
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
                        Loading crops...
                     </div>
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No crops found matching your filters.
                  </td>
                </tr>
              ) : (
                data?.data.map((crop) => (
                  <tr key={crop.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover border border-gray-200" src={getImageUrl(crop.images[0], 'https://placehold.co/40')} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{crop.name}</div>
                          <div className="text-sm text-gray-500">{crop.variety || 'Standard'} • {crop.locationDistrict}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{crop.farmer?.name}</div>
                      <div className="text-xs text-gray-500">ID: {crop.farmer?.id.substring(0,8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-bold">₹{crop.pricePerKg} / kg</div>
                      <div className="text-sm text-gray-500">{crop.quantityAvailable} kg avail.</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                        crop.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {crop.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {crop.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateStatusMutation.mutate({ 
                            id: crop.id, 
                            status: crop.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' 
                          })}
                          disabled={updateStatusMutation.isPending}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-semibold ${
                            crop.status === 'ACTIVE' ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-green-200 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {crop.status === 'ACTIVE' ? <><Ban className="w-3.5 h-3.5" /> Suspend</> : <><CheckCircle className="w-3.5 h-3.5" /> Approve</>}
                        </button>
                        <button
                          onClick={() => {
                            if(confirm('Are you sure you want to delete this crop listing?')) {
                              deleteMutation.mutate(crop.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
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
