import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';



interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  qty: number;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const navigate          = useNavigate();

  // ────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────────
  const syncCart = (next: CartItem[]) => {
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const changeQty = (productId: string, qty: number) => {
    if (qty < 1 || qty > 20) return;
    syncCart(
      cart.map(i => i.productId === productId ? { ...i, qty } : i)
    );
  };

  const removeItem = (productId: string) => {
    syncCart(cart.filter(i => i.productId !== productId));
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Side‑effects
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    setCart(stored ? JSON.parse(stored) : []);
  }, []);

  const grandTotal = cart.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h2 className="cart-title">Your Cart</h2>
        <p className="cart-empty">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>
      <div className="cart-list">
        <div className="cart-header">
          <div className="cart-cell cart-header-cell">Product</div>
          <div className="cart-cell cart-header-cell">Price</div>
          <div className="cart-cell cart-header-cell">Quantity</div>
          <div className="cart-cell cart-header-cell">Subtotal</div>
          <div className="cart-cell cart-header-cell">Remove</div>
        </div>
        {cart.map(item => (
          <div className="cart-row" key={item.productId}>
            <div className="cart-cell cart-product-cell">
              <div className="cart-product-info">
                {item.image && <img src={item.image} alt={item.name} className="cart-image" />}
                <span className="product-name">{item.name}</span>
              </div>
            </div>
            <div className="cart-cell">${item.price.toFixed(2)}</div>
            <div className="cart-cell">
              <input
                type="number"
                min={1}
                max={20}
                value={item.qty}
                onChange={e => {
                  const val = Number(e.target.value);
                  if (isNaN(val) || val < 1 || val > 20) return;
                  changeQty(item.productId, val);
                }}
              />
            </div>
            <div className="cart-cell">${(item.price * item.qty).toFixed(2)}</div>
            <div className="cart-cell">
              <button onClick={() => removeItem(item.productId)} className="cart-remove-btn">Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <strong>Total: ${grandTotal.toFixed(2)}</strong>
      </div>
      <button
        className="cart-checkout-btn"
        onClick={() => navigate('/checkout')}
      >
        Proceed&nbsp;to&nbsp;Checkout
      </button>
    </div>
  );
};

export default Cart;
