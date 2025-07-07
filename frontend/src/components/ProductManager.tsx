import React, { useEffect, useState } from 'react';
import './ProductManager.css';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api/products';

const ProductManager: React.FC<{ user: any }> = ({ user }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [filterEco, setFilterEco] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [imagePreviewIdx, setImagePreviewIdx] = useState<{[id:string]:number}>({});
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...form,
        images: form.images ? form.images.split(',').map((s: string) => s.trim()) : [],
        tags: form.tags ? form.tags.split(',').map((s: string) => s.trim()) : [],
        price: Number(form.price),
        inventory: form.inventory ? Number(form.inventory) : 0,
        isEcoFriendly: !!form.isEcoFriendly,
        ...(user.role === 'store' ? { storeId: user.id } : {}),
      };
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add product');
      }
      setForm({});
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product._id);
    setForm({
      ...product,
      images: product.images ? product.images.join(', ') : '',
      tags: product.tags ? product.tags.join(', ') : '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...form,
        images: form.images ? form.images.split(',').map((s: string) => s.trim()) : [],
        tags: form.tags ? form.tags.split(',').map((s: string) => s.trim()) : [],
        price: Number(form.price),
        inventory: form.inventory ? Number(form.inventory) : 0,
        isEcoFriendly: !!form.isEcoFriendly,
        ...(user.role === 'store' ? { storeId: user.id } : {}),
      };
      const res = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update product');
      }
      setEditingId(null);
      setForm({});
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete product');
      }
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddToCart = (product: any) => {
    const stored = localStorage.getItem('cart');
    let cart = stored ? JSON.parse(stored) : [];
    const idx = cart.findIndex((item: any) => item.productId === product._id);
    if (idx > -1) {
      cart[idx].qty += 1;
    } else {
      cart.push({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0], qty: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/checkout');
  };

  // Filtering
  const filteredProducts = products.filter(product => {
    const matchesText = [product.name, product.brand, product.category].some(field =>
      field && field.toLowerCase().includes(filter.toLowerCase())
    );
    const matchesEco = filterEco === '' || (filterEco === 'yes' && product.isEcoFriendly) || (filterEco === 'no' && !product.isEcoFriendly);
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesBrand = !filterBrand || product.brand === filterBrand;
    const matchesPriceMin = !filterPriceMin || product.price >= Number(filterPriceMin);
    const matchesPriceMax = !filterPriceMax || product.price <= Number(filterPriceMax);
    return matchesText && matchesEco && matchesCategory && matchesBrand && matchesPriceMin && matchesPriceMax;
  });

  // Unique categories and brands for filter dropdowns
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // AR Model Embedder
  const renderARModel = (url: string) => {
    if (url && (url.endsWith('.glb') || url.endsWith('.gltf'))) {
      // Use dangerouslySetInnerHTML to inject <model-viewer> for AR preview
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: `<model-viewer src="${url}" alt="AR Model" style="width:100px;height:100px;" camera-controls auto-rotate ar ar-modes="webxr scene-viewer quick-look"></model-viewer>`
          }}
        />
      );
    }
    return url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View AR</a> : null;
  };

  // Multi-image preview controls
  const handlePrevImage = (id: string) => {
    setImagePreviewIdx(idx => ({
      ...idx,
      [id]: (idx[id] || 0) === 0 ? (products.find(p => p._id === id)?.images?.length || 1) - 1 : (idx[id] || 0) - 1
    }));
  };
  const handleNextImage = (id: string) => {
    setImagePreviewIdx(idx => ({
      ...idx,
      [id]: ((idx[id] || 0) + 1) % ((products.find(p => p._id === id)?.images?.length || 1))
    }));
  };

  useEffect(() => {
    // Load model-viewer script for AR embedding if not present
    if (!document.querySelector('script[src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="productmanager-container">
      <h2 className="productmanager-title mb-4">Product Management</h2>
      {error && <div className="productmanager-error mb-2">{error}</div>}
      {/* Filters */}
      <div className="productmanager-filters mb-4">
        <input
          type="text"
          placeholder="Filter by name, brand, or category"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="productmanager-input"
        />
        <select value={filterEco} onChange={e => setFilterEco(e.target.value)} className="productmanager-input">
          <option value="">Eco Friendly?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="productmanager-input">
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="productmanager-input">
          <option value="">All Brands</option>
          {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={filterPriceMin}
          onChange={e => setFilterPriceMin(e.target.value)}
          className="productmanager-input"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={filterPriceMax}
          onChange={e => setFilterPriceMax(e.target.value)}
          className="productmanager-input"
        />
      </div>
      {/* Form */}
      {(user.role === 'admin' || user.role === 'store') && (
        <form onSubmit={editingId ? handleUpdate : handleAdd} className="productmanager-form mb-6">
          <div className="productmanager-form-group">
            <label className="productmanager-label" htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name || ''} onChange={handleChange} placeholder="Product name" className="productmanager-input" required />
          </div>
          <div className="productmanager-form-group">
            <label className="productmanager-label" htmlFor="brand">Brand</label>
            <input id="brand" name="brand" value={form.brand || ''} onChange={handleChange} placeholder="Brand" className="productmanager-input" required />
          </div>
          <div className="productmanager-form-group">
            <label className="productmanager-label" htmlFor="category">Category</label>
            <input id="category" name="category" value={form.category || ''} onChange={handleChange} placeholder="Category" className="productmanager-input" required />
          </div>
          <div className="productmanager-form-group">
            <label className="productmanager-label" htmlFor="price">Price</label>
            <input id="price" name="price" value={form.price || ''} onChange={handleChange} placeholder="Price" type="number" className="productmanager-input" required />
          </div>
          <div className="productmanager-form-group">
            <label className="productmanager-label" htmlFor="inventory">Inventory</label>
            <input id="inventory" name="inventory" value={form.inventory || ''} onChange={handleChange} placeholder="Inventory" type="number" className="productmanager-input" />
          </div>
          <div className="productmanager-form-group">
            <label className="productmanager-label" htmlFor="images">Images</label>
            <input id="images" name="images" value={form.images || ''} onChange={handleChange} placeholder="Image URLs (comma separated)" className="productmanager-input" />
          </div>
          <div className="productmanager-form-group">
            <label className="productmanager-label" htmlFor="tags">Tags</label>
            <input id="tags" name="tags" value={form.tags || ''} onChange={handleChange} placeholder="Tags (comma separated)" className="productmanager-input" />
          </div>
          <div className="productmanager-form-group">
            <label className="productmanager-label" htmlFor="isEcoFriendly">Eco Friendly?</label>
            <select id="isEcoFriendly" name="isEcoFriendly" value={form.isEcoFriendly ? 'yes' : ''} onChange={e => setForm({ ...form, isEcoFriendly: e.target.value === 'yes' })} className="productmanager-input">
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="productmanager-form-group">
            <label className="productmanager-label" htmlFor="arModelUrl">AR Model URL</label>
            <input id="arModelUrl" name="arModelUrl" value={form.arModelUrl || ''} onChange={handleChange} placeholder="AR Model URL" className="productmanager-input" />
          </div>
          <button type="submit" className="productmanager-button">{editingId ? 'Update' : 'Add'} Product</button>
          {editingId && <button type="button" className="productmanager-cancel" onClick={() => { setEditingId(null); setForm({}); }}>Cancel</button>}
        </form>
      )}
      {/* Product List as Cards */}
      <div className="productmanager-list-grid">
        {filteredProducts.map(product => (
          <div key={product._id} className="productmanager-card">
            <div className="productmanager-card-imgs">
              {product.images && product.images.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="relative w-20 h-20 mb-2">
                    <img
                      src={product.images[imagePreviewIdx[product._id] || 0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded border"
                    />
                    {product.images.length > 1 && (
                      <div className="absolute top-1/2 left-0 right-0 flex justify-between w-full px-1 -translate-y-1/2">
                        <button type="button" onClick={() => handlePrevImage(product._id)} className="bg-gray-200 rounded-full px-1">&#8592;</button>
                        <button type="button" onClick={() => handleNextImage(product._id)} className="bg-gray-200 rounded-full px-1">&#8594;</button>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-1 mt-1">
                    {product.images.map((img: string, idx: number) => (
                      <button
                        key={img}
                        type="button"
                        className={`w-4 h-4 rounded-full border ${imagePreviewIdx[product._id] === idx ? 'bg-blue-500' : 'bg-gray-300'}`}
                        onClick={() => setImagePreviewIdx(prev => ({ ...prev, [product._id]: idx }))}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="productmanager-card-content">
              <div className="productmanager-card-row"><span className="productmanager-card-label">Name:</span> {product.name}</div>
              <div className="productmanager-card-row"><span className="productmanager-card-label">Brand:</span> {product.brand}</div>
              <div className="productmanager-card-row"><span className="productmanager-card-label">Category:</span> {product.category}</div>
              <div className="productmanager-card-row"><span className="productmanager-card-label">Price:</span> ${product.price}</div>
              <div className="productmanager-card-row"><span className="productmanager-card-label">Inventory:</span> {product.inventory}</div>
              <div className="productmanager-card-row"><span className="productmanager-card-label">Eco:</span> {product.isEcoFriendly ? 'Yes' : 'No'}</div>
              <div className="productmanager-card-row"><span className="productmanager-card-label">AR Model:</span> {product.arModelUrl && renderARModel(product.arModelUrl)}</div>
            </div>
            {(user.role === 'admin' || (user.role === 'store' && product.storeId === user.id)) && (
              <div className="productmanager-card-actions">
                <button onClick={() => handleEdit(product)} className="productmanager-action-btn edit">Edit</button>
                <button onClick={() => handleDelete(product._id)} className="productmanager-action-btn delete">Delete</button>
              </div>
            )}
            {user.role === 'user' && (
              <div className="productmanager-card-actions">
                <button className="productmanager-action-btn order" onClick={() => handleAddToCart(product)}>Order</button>
                <button className="productmanager-action-btn cart" onClick={() => navigate('/cart')}>See Cart</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManager; 