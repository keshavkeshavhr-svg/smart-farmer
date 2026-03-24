import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Star, ShieldCheck, ShoppingCart } from 'lucide-react';
import { api } from '../lib/api';
import { useAppDispatch } from '../store/hooks';
import { addItem } from '../store/slices/cartSlice';

export default function CropDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState<number | string>(1);
  const [activeImage, setActiveImage] = useState(0);

  const { data: crop, isLoading } = useQuery({
    queryKey: ['crop', id],
    queryFn: async () => {
      return await api.get(`/crops/${id}`);
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>
        <div className="h-8 bg-gray-200 w-1/3 mb-4 rounded"></div>
        <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
      </div>
    );
  }

  if (!crop) return <div className="text-center py-20 text-xl font-medium">Crop not found</div>;

  const handleAddToCart = () => {
    dispatch(addItem({
      id: crop.id,
      type: 'CROP',
      name: `${crop.name} (${crop.variety})`,
      price: crop.pricePerKg,
      quantity: Number(quantity) || 1,
      image: crop.images[0],
      maxAvailable: crop.quantityAvailable,
      farmerId: crop.farmer.id
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex text-sm text-gray-500 mb-6 font-medium">
        <Link to="/crops" className="hover:text-primary-600 transition-colors">Crops</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-900">{crop.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            <img 
              src={crop.images[activeImage] || 'https://via.placeholder.com/800x600?text=No+Image'} 
              alt={crop.name} 
              className="w-full h-full object-cover object-center"
            />
          </div>
          {crop.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {crop.images.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary-500 ring-2 ring-primary-500/20 ring-offset-1' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover object-center" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{crop.name}</h1>
            {crop.grade && (
              <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                Grade {crop.grade}
              </span>
            )}
          </div>
          <p className="text-lg text-gray-500 mt-2">{crop.variety}</p>

          <div className="mt-6 flex items-end gap-2">
            <p className="text-4xl font-bold tracking-tight text-gray-900">₹{crop.pricePerKg}</p>
            <p className="text-base text-gray-500 pb-1">/ kg</p>
          </div>

          <div className="mt-8 border-t border-b border-gray-100 py-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wider">Description</h3>
            <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{crop.description || 'No detailed description provided by the farmer.'}</p>
            
            <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 text-sm text-gray-600">
              <div className="flex gap-2">
                <dt className="font-semibold text-gray-900 min-w-24">Location:</dt>
                <dd className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {crop.locationDistrict}, {crop.locationState}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-gray-900 min-w-24">Available:</dt>
                <dd className="font-medium text-gray-700">{Number(crop.quantityAvailable) || 0} kg</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-gray-900 min-w-24">Min Order:</dt>
                <dd className="font-medium text-gray-700">{Number(crop.minOrderKg) || 0} kg</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-gray-900 min-w-24">Harvested:</dt>
                <dd>{crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}</dd>
              </div>
            </dl>
          </div>

          {/* Add to Cart Actions */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Quantity (kg)</label>
                <div className="flex items-center rounded-md border border-gray-300 bg-white w-fit shadow-sm">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(Number(crop.minOrderKg) || 1, (Number(quantity) || 0) - 10))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={crop.minOrderKg || 1}
                    max={crop.quantityAvailable || 9999}
                    value={quantity}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setQuantity('');
                      } else {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setQuantity(val);
                      }
                    }}
                    onBlur={() => {
                      if (quantity === '' || Number(quantity) < (crop.minOrderKg || 1)) {
                        setQuantity(crop.minOrderKg || 1);
                      }
                    }}
                    className="w-20 text-center font-medium py-2 border-x border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.min(Number(crop.quantityAvailable) || 9999, (Number(quantity) || 0) + 10))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                  >
                    +
                  </button>

                </div>
              </div>
              <div className="pt-6">
                <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                <p className="text-xl font-bold text-gray-900">₹{((Number(crop.pricePerKg) || 0) * (Number(quantity) || 0)).toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={Number(crop.quantityAvailable) < Number(crop.minOrderKg)}
              className="btn btn-primary w-full py-3.5 text-lg font-semibold flex justify-center gap-2 items-center shadow-lg hover:shadow-primary-500/30 transition-shadow disabled:opacity-50 disabled:shadow-none"
            >
              <ShoppingCart className="w-5 h-5" />
              {Number(crop.quantityAvailable) < Number(crop.minOrderKg) ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-green-600" /> Secure payment via Razorpay. Direct to Farmer.
            </p>
          </div>

          {/* Farmer Info */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-gray-100">
                <span className="text-xl font-bold text-primary-700">{crop.farmer?.name?.charAt(0) || '?'}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 group-hover:text-gray-900">Sold by</p>
                <p className="font-semibold text-gray-900 text-lg">{crop.farmer?.name || 'Unknown'}</p>
                <div className="flex items-center text-sm font-medium mt-0.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-gray-900">{crop.farmer?.farmerProfile?.rating?.toFixed(1) || '0.0'}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-gray-500">{crop.farmer?.farmerProfile?.farmName || 'Verified Farmer'}</span>
                </div>
              </div>
            </div>
            {crop.farmer?.id && (
              <Link to={`/farmers/${crop.farmer.id}`} className="text-sm font-semibold text-primary-600 hover:text-primary-500 hover:underline">
                View Profile
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
