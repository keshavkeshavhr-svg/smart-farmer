import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Leaf, UploadCloud, X, Loader2, User, Phone, MapPin, Info } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../lib/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToast } from '../../store/slices/uiSlice';
import { indianStates, getDistrictsByState } from '../../data/indianStatesDistricts';

const cropSchema = z.object({
  name: z.string().min(2, "Name is required"),
  variety: z.string().optional(),
  description: z.string().optional(),
  pricePerKg: z.coerce.number().min(1, "Price must be at least ₹1"),
  quantityKg: z.coerce.number().min(1, "Quantity must be at least 1kg"),
  minOrderKg: z.coerce.number().min(1, "Minimum order must be at least 1kg"),
  grade: z.string().optional(),
  locationState: z.string().min(2, "State is required"),
  locationDistrict: z.string().min(2, "District is required"),
  availableFrom: z.string().min(1, "Available from date is required"),
  availableTo: z.string().min(1, "Available until date is required"),
});

type CropFormValues = z.infer<typeof cropSchema>;

export default function AddCrop() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Default dates: available from today, until 30 days from now
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CropFormValues>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      locationState: 'Karnataka',
      locationDistrict: '',
      minOrderKg: 10,
      availableFrom: today,
      availableTo: thirtyDaysLater,
    }
  });

  const watchedState = watch('locationState');
  const availableDistricts = useMemo(() => getDistrictsByState(watchedState || ''), [watchedState]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (images.length + filesArray.length > 5) {
        dispatch(addToast({ type: 'warning', title: 'Too many images', message: 'Maximum 5 images allowed' }));
        return;
      }
      setImages(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of images) {
      const formData = new FormData();
      formData.append('file', file);
      // In a real app, we'd use the presigned URL flow or local fallback. We'll use local fallback for MVP
      const res = await api.post('/uploads/local', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }) as unknown as { url: string };
      uploadedUrls.push(import.meta.env.VITE_API_URL?.replace('/api', '') + res.url);
    }
    return uploadedUrls;
  };

  const mutation = useMutation({
    mutationFn: async (data: CropFormValues & { images: string[] }) => {
      return await api.post('/crops', data);
    },
    onSuccess: () => {
      dispatch(addToast({ type: 'success', title: 'Crop Listed', message: 'Your harvest is now live on the marketplace!' }));
      navigate('/dashboard');
    },
    onError: (err: any) => {
      dispatch(addToast({ type: 'error', title: 'Listing Failed', message: err.message || 'Something went wrong' }));
    }
  });

  const onSubmit = async (data: CropFormValues) => {
    if (images.length === 0) {
      dispatch(addToast({ type: 'warning', title: 'Images Required', message: 'Please upload at least one photo of your crop' }));
      return;
    }

    try {
      setIsUploading(true);
      const imageUrls = await uploadImages();
      setIsUploading(false);

      mutation.mutate({ ...data, images: imageUrls });
    } catch (err) {
      setIsUploading(false);
      dispatch(addToast({ type: 'error', title: 'Upload Failed', message: 'Could not upload images' }));
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-primary-600" /> List a New Crop
        </h1>
        <p className="text-sm text-gray-500 mt-1">Add details about your harvest to start selling to buyers directly.</p>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-gray-100">
          
          {/* Images Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Photos</h2>
            <div className="flex flex-wrap gap-4">
              {previewUrls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-600 hover:bg-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                  <UploadCloud className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1 font-medium">Add Photo</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">Upload up to 5 images. High quality photos attract more buyers.</p>
          </div>

          {/* Details Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input {...field} placeholder="e.g. Tomato, Onion, Wheat" className="mt-1 input-field py-2 px-3 border" />
                  )}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Variety</label>
                <Controller
                  name="variety"
                  control={control}
                  render={({ field }) => (
                    <input {...field} placeholder="e.g. Hybrid, Local" className="mt-1 input-field py-2 px-3 border" />
                  )}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Grade / Quality</label>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => (
                    <input {...field} placeholder="e.g. A, B, Premium" className="mt-1 input-field py-2 px-3 border" />
                  )}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea {...field} rows={3} placeholder="Describe the quality, harvest practices, etc." className="mt-1 input-field py-2 px-3 border" />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing & Availability</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Price per kg (₹)</label>
                <Controller
                  name="pricePerKg"
                  control={control}
                  render={({ field }) => (
                    <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                      <input type="number" {...field} className="input-field pl-8 py-2 border" />
                    </div>
                  )}
                />
                {errors.pricePerKg && <p className="mt-1 text-xs text-red-600">{errors.pricePerKg.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total Available (kg)</label>
                <Controller
                  name="quantityKg"
                  control={control}
                  render={({ field }) => (
                    <input type="number" {...field} className="mt-1 input-field py-2 px-3 border" />
                  )}
                />
                {errors.quantityKg && <p className="mt-1 text-xs text-red-600">{errors.quantityKg.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Min. Order (kg)</label>
                <Controller
                  name="minOrderKg"
                  control={control}
                  render={({ field }) => (
                    <input type="number" {...field} className="mt-1 input-field py-2 px-3 border" />
                  )}
                />
                {errors.minOrderKg && <p className="mt-1 text-xs text-red-600">{errors.minOrderKg.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Available From</label>
                <Controller
                  name="availableFrom"
                  control={control}
                  render={({ field }) => (
                    <input type="date" {...field} className="mt-1 input-field py-2 px-3 border" />
                  )}
                />
                {errors.availableFrom && <p className="mt-1 text-xs text-red-600">{errors.availableFrom.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Available Until</label>
                <Controller
                  name="availableTo"
                  control={control}
                  render={({ field }) => (
                    <input type="date" {...field} className="mt-1 input-field py-2 px-3 border" />
                  )}
                />
                {errors.availableTo && <p className="mt-1 text-xs text-red-600">{errors.availableTo.message}</p>}
              </div>

            </div>
          </div>

          {/* Location */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <Controller
                  name="locationState"
                  control={control}
                  render={({ field }) => (
                    <select {...field} onChange={(e) => { field.onChange(e); setValue('locationDistrict', ''); }} className="mt-1 input-field py-2 px-3 border bg-white">
                      {indianStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">District</label>
                <Controller
                  name="locationDistrict"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className="mt-1 input-field py-2 px-3 border bg-white">
                      <option value="">Select District</option>
                      {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  )}
                />
                {errors.locationDistrict && <p className="mt-1 text-xs text-red-600">{errors.locationDistrict.message}</p>}
              </div>

            </div>
          </div>

          {/* Farmer Details */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" /> Farmer Details
            </h2>
            <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
              <Info className="w-3 h-3" /> This info is from your profile.
              <a href="/dashboard/settings" className="text-primary-600 hover:underline ml-1">Update in Account Settings</a>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Full Name</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{user?.name || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{user?.phone || '—'}</p>
                </div>
              </div>
              {(user?.address || user?.pincode) && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Address</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {[user?.address, user?.pincode].filter(Boolean).join(' — ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn border border-gray-300 bg-white">Cancel</button>
            <button 
              type="submit" 
              disabled={mutation.isPending || isUploading}
              className="btn btn-primary min-w-[150px]"
            >
              {(mutation.isPending || isUploading) ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
              ) : 'Publish Listing'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
