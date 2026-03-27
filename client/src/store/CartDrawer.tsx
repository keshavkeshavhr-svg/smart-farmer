import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './hooks';
import { toggleCart, removeItem, updateQuantity, CartItem } from './slices/cartSlice';

export default function CartDrawer() {
  const { items, isOpen } = useAppSelector((state: any) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const totalAmount = items.reduce((acc: number, item: CartItem) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return acc + (price * qty);
  }, 0);

  const handleCheckout = () => {
    dispatch(toggleCart());
    navigate('/checkout');
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={() => dispatch(toggleCart())}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                        <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5" />
                          Shopping Cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => dispatch(toggleCart())}
                          >
                            <span className="sr-only">Close panel</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          {items.length === 0 ? (
                            <div className="text-center py-12">
                              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
                              <p className="mt-1 text-sm text-gray-500">Start adding crops or products to checkout.</p>
                              <button
                                type="button"
                                className="mt-6 text-sm font-medium text-primary-600 hover:text-primary-500"
                                onClick={() => dispatch(toggleCart())}
                              >
                                Continue Shopping
                              </button>
                            </div>
                          ) : (
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                              {items.map((item: CartItem) => (
                                <li key={item.id} className="flex py-6">
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img
                                      src={item.image || 'https://placehold.co/100'}
                                      alt={item.name}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>{item.name}</h3>
                                        <p className="ml-4">₹{((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)}</p>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-500">{item.type === 'CROP' ? 'Crop' : 'Store Product'}</p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <p className="text-gray-500">Qty:</p>
                                        <input 
                                          title="Quantity"
                                          type="number"
                                          min={1}
                                          max={item.maxAvailable}
                                          value={Number(item.quantity) || 0}
                                          onChange={(e) => {
                                            const v = parseInt(e.target.value);
                                            dispatch(updateQuantity({ id: item.id, quantity: isNaN(v) ? 1 : v }));
                                          }}
                                          className="w-16 rounded border-gray-300 py-1 px-2 text-sm"
                                        />
                                        <span className="text-gray-500">{item.type === 'CROP' ? 'kg' : 'units'}</span>
                                      </div>

                                      <div className="flex">
                                        <button
                                          type="button"
                                          className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                                          onClick={() => dispatch(removeItem(item.id))}
                                        >
                                          <Trash2 className="w-4 h-4" /> Remove
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                          <p>Subtotal</p>
                          <p>₹{(Number(totalAmount) || 0).toFixed(2)}</p>
                        </div>
                        <div className="mt-6">
                          <button
                            onClick={handleCheckout}
                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700"
                          >
                            Checkout
                          </button>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            or{' '}
                            <button
                              type="button"
                              className="font-medium text-primary-600 hover:text-primary-500"
                              onClick={() => dispatch(toggleCart())}
                            >
                              Continue Shopping
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
