import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string; // cropId or productId
  type: 'CROP' | 'STORE';
  name: string;
  price: number;
  quantity: number; // kg for crops, units for store
  image: string;
  maxAvailable: number;
  farmerId?: string; // only for crops
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        if (existing.quantity + action.payload.quantity <= action.payload.maxAvailable) {
          existing.quantity += action.payload.quantity;
        } else {
          existing.quantity = action.payload.maxAvailable;
        }
      } else {
        state.items.push(action.payload);
      }
      state.isOpen = true; // Auto-open cart on add
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        if (action.payload.quantity > 0 && action.payload.quantity <= item.maxAvailable) {
          item.quantity = action.payload.quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    }
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, toggleCart, setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;
