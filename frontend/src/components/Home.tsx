import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import FloatingChatbot from './FloatingChatbot';

const features = [
  {
    title: 'AI-Powered Recommendations',
    desc: 'Personalized shopping experiences and smart suggestions for every user.',
    icon: '🤖',
  },
  {
    title: 'Augmented Reality Previews',
    desc: 'Try products in your space with immersive AR technology.',
    icon: '🛋️',
  },
  {
    title: 'Eco-Friendly Marketplace',
    desc: 'Shop sustainable brands and make a positive impact.',
    icon: '🌱',
  },
  {
    title: 'Seamless Store Management',
    desc: 'Powerful tools for retailers to manage inventory, orders, and analytics.',
    icon: '🛒',
  },
  {
    title: 'Real-Time Chat Assistant',
    desc: 'Get instant help and recommendations from our AI assistant.',
    icon: '💬',
  },
];

const testimonials = [
  {
    name: 'Priya S.',
    text: 'The AR previews are mind-blowing! I could see how the chair looked in my room before buying.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Alex R.',
    text: 'AI recommendations helped me discover eco-friendly brands I love. Super smooth experience!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Store Owner',
    text: 'Managing my inventory and orders is a breeze. Analytics are top-notch.',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
  },
];

const logos = [
  'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
  'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
];

const statsLabels = [
  { key: 'productsSold', label: 'Products Sold' },
  { key: 'storesOnboarded', label: 'Stores Onboarded' },
  { key: 'ecoProducts', label: 'Eco Products' },
  { key: 'activeUsers', label: 'Active Users' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  // Animated stats
  const [stats, setStats] = useState({
    productsSold: 0,
    storesOnboarded: 0,
    ecoProducts: 0,
    activeUsers: 0,
  });
  const [displayStats, setDisplayStats] = useState([0, 0, 0, 0]);
  useEffect(() => {
    fetch('/api/products/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setDisplayStats([0, 0, 0, 0]);
        // Animate counters
        const target = [data.productsSold, data.storesOnboarded, data.ecoProducts, data.activeUsers];
        let current = [0, 0, 0, 0];
        const steps = 50;
        let step = 0;
        const interval = setInterval(() => {
          step++;
          current = current.map((val, i) => {
            const diff = target[i] - val;
            if (Math.abs(diff) < 1) return target[i];
            return val + Math.ceil(diff / (steps - step + 1));
          });
          setDisplayStats([...current]);
          if (step >= steps) {
            setDisplayStats(target);
            clearInterval(interval);
          }
        }, 30);
        return () => clearInterval(interval);
      });
  }, []);

  // Testimonials carousel
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTestimonialIdx(idx => (idx + 1) % testimonials.length), 4000);
    return () => clearInterval(interval);
  }, []);

  // Parallax effect
  const parallaxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const y = window.scrollY;
        parallaxRef.current.style.backgroundPosition = `center ${y * 0.3}px`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Custom glowing cursor
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.id = 'glow-cursor';
    cursor.style.position = 'fixed';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999';
    cursor.style.width = '36px';
    cursor.style.height = '36px';
    cursor.style.borderRadius = '50%';
    cursor.style.background = 'radial-gradient(circle, #60a5fa 0%, #22d3ee 80%, transparent 100%)';
    cursor.style.mixBlendMode = 'screen';
    cursor.style.transition = 'transform 0.1s';
    document.body.appendChild(cursor);
    const move = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX - 18}px, ${e.clientY - 18}px)`;
    };
    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      document.body.removeChild(cursor);
    };
  }, []);

  // Interactive AI/AR demo (now connected to backend)
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleAIDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setAiError('');
    setAiResult('');
    try {
      const res = await fetch('/api/assistant/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ query: aiInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI assistant error');
      setAiResult(data.response);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Add product list for users (example, place after features or as a new section)
  // This is a minimal example, adapt as needed for your UI
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

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

  return (
    <div className="home-root">
      {/* Parallax & Video Hero */}
      <div ref={parallaxRef} className="home-hero-bg">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="home-hero-video"
          poster="https://images.unsplash.com/photo-1515168833906-d2a3b82b302b?auto=format&fit=crop&w=1200&q=80"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-shopping-center-with-people-walking-4415-large.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Hero Section */}
      <header className="home-hero-section">
        <div className="home-hero-gradient" />
        <div className="home-hero-content">
          <div className="home-hero-text">
            <h1 className="home-title">
              Adaptive Retail
            </h1>
            <h2 className="home-subtitle">
              AI-Powered Full-Stack E-commerce Platform
            </h2>
            <p className="home-description">
              Experience the future of shopping with personalized AI, immersive AR, and seamless management for users, stores, and admins.
            </p>
            <div className="home-hero-actions">
              <Link to="/register" className="home-btn home-btn-primary">
                Get Started
              </Link>
              <Link to="/dashboard" className="home-btn home-btn-secondary">
                Go to Dashboard
              </Link>
            </div>
            {/* Animated Stats */}
            <div className="home-stats">
              {statsLabels.map((stat, i) => (
                <div key={stat.key} className="home-stat-item">
                  <span className="home-stat-value">
                    {displayStats[i].toLocaleString()}
                  </span>
                  <span className="home-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="home-features">
        {features.map((feature, idx) => (
          <div key={feature.title} className="home-feature-item">
            <span className="home-feature-icon">{feature.icon}</span>
            <h3 className="home-feature-title">{feature.title}</h3>
            <p className="home-feature-desc">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Testimonials & Logos Carousel */}
      <section className="home-testimonials">
        <div className="home-testimonial-card">
          <img src={testimonials[testimonialIdx].avatar} alt={testimonials[testimonialIdx].name} className="home-testimonial-avatar" />
          <blockquote className="home-testimonial-text">“{testimonials[testimonialIdx].text}”</blockquote>
          <span className="home-testimonial-name">{testimonials[testimonialIdx].name}</span>
        </div>
      </section>

      {/* Brand Logos Section */}
      <section className="home-logos">
        {logos.map((logo, idx) => (
          <img key={logo} src={logo} alt="Brand logo" className="home-logo-img" />
        ))}
      </section>

      {/* Call to Action */}
      <section className="home-cta-section animate-fade-in">
        <h4>Ready to experience the future of retail?</h4>
        <Link to="/register" className="cta-btn">
          Join Adaptive Retail Now
        </Link>
      </section>

      {/* Product List for Users */}
      {user && user.role === 'user' && (
        <section className="home-products-section">
          <h2 className="home-products-title">Shop Products</h2>
          <div className="home-products-list">
            {products.map(product => (
              <div key={product._id} className="home-product-card">
                <img src={product.images?.[0]} alt={product.name} className="home-product-img" />
                <div className="home-product-info">
                  <div className="home-product-name">{product.name}</div>
                  <div className="home-product-brand">{product.brand}</div>
                  <div className="home-product-price">${product.price}</div>
                </div>
                <button className="home-product-order-btn" onClick={() => handleAddToCart(product)}>Order</button>
                <button className="home-product-cart-btn" onClick={() => navigate('/cart')}>See Cart</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm bg-white/70 border-t mt-8 animate-fade-in">
        &copy; {new Date().getFullYear()} Adaptive Retail. All rights reserved.
      </footer>

      {/* Floating Chatbot (now global, not just on Home) */}
      <FloatingChatbot />
    </div>
  );
};

export default Home; 