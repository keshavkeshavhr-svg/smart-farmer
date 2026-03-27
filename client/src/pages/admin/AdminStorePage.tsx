import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit, Trash2, Package } from 'lucide-react';
import { api } from '../../lib/api';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/uiSlice';

export default function AdminStorePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-store', { search, category, page }],
    queryFn: async () => {
      const params: any = { search, page, limit: 12 };
      if (category) params.category = category;
      const res = await api.get('/store/products', { params });
      return res as unknown as { data: any[], pagination: any };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/store/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-store'] });
      dispatch(addToast({ type: 'success', title: 'Product Deleted', message: 'Item removed from Farming Store.' }));
    },
    onError: (err: any) => {
      dispatch(addToast({ type: 'error', title: 'Delete Failed', message: err.message }));
    }
  });

  const categories = ['Fertilizers', 'Seeds', 'Pesticides', 'Tools', 'Equipment', 'Other'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage inventory for the official Farming Store.</p>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
           <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10 py-2 border w-full"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        <select 
          className="input-field py-2 px-3 border"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading products...</td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-500 flex flex-col items-center">
                     <Package className="w-8 h-8 text-gray-300 mb-2" />
                     No products found.
                   </td>
                </tr>
              ) : (
                data?.data.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                           <div className="h-10 w-10 flex-shrink-0">
                             <img className="h-10 w-10 rounded-md object-contain border border-gray-200" src={product.images[0] || 'https://placehold.co/40'} alt="" />
                           </div>
                           <div className="ml-4">
                             <div className="text-sm font-bold text-gray-900">{product.name}</div>
                             <div className="text-xs text-gray-500 truncate max-w-[200px]" title={product.description}>{product.description}</div>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                         {product.category}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                       ₹{product.price.toFixed(2)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${
                          product.stock > 10 ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                          product.stock > 0 ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' : 
                          'bg-red-50 text-red-700 ring-red-600/10'
                        }`}>
                          {product.stock} units
                        </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                           <button className="text-primary-600 hover:text-primary-900 disabled:opacity-50" disabled>
                             <Edit className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => {
                               if(confirm('Are you sure you want to delete this product?')) deleteMutation.mutate(product.id);
                             }}
                             className="text-red-500 hover:text-red-700 disabled:opacity-50"
                             disabled={deleteMutation.isPending}
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
             <h2 className="text-xl font-bold mb-4">Add Store Product</h2>
             <p className="text-sm text-gray-500 mb-6 font-medium bg-yellow-50 p-3 rounded-lg border border-yellow-100">
               Note: The complete Add/Edit form for store items would be implemented here in a production build, utilizing standard React Hook Form patterns similar to AddCrop.
             </p>
             <div className="flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="btn px-4 py-2 border border-gray-300">Close</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
