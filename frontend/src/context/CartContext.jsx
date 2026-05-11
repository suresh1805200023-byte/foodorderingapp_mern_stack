import { createContext, useContext, useReducer, useEffect } from "react";

const CART_KEY = "kfc_cart";

const loadCart = () => {
  try {
    const s = localStorage.getItem(CART_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD": {
      const { product, quantity = 1 } = action.payload;
      const existing = state.find((i) => i.productId === product._id);
      let next;
      if (existing) {
        next = state.map((i) =>
          i.productId === product._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        const price = Number(product.price) || 0;
        const discount = Number(product.discount) || 0;
        const unitPrice = discount ? price * (1 - discount / 100) : price;
        next = [
          ...state,
          {
            productId: product._id,
            quantity,
            name: product.name,
            image: product.image,
            price: product.price,
            discount: product.discount,
            unitPrice,
          },
        ];
      }
      saveCart(next);
      return next;
    }
    case "UPDATE_QUANTITY": {
      const { productId, delta } = action.payload;
      const next = state
        .map((i) => {
          if (i.productId !== productId) return i;
          const q = i.quantity + delta;
          if (q < 1) return null;
          return { ...i, quantity: q };
        })
        .filter(Boolean);
      saveCart(next);
      return next;
    }
    case "REMOVE":
      const next = state.filter((i) => i.productId !== action.payload);
      saveCart(next);
      return next;
    case "CLEAR":
      saveCart([]);
      return [];
    default:
      return state;
  }
};

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], () => loadCart());

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: "ADD", payload: { product, quantity } });
  };

  const updateQuantity = (productId, delta) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, delta } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: "REMOVE", payload: productId });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR" });
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
