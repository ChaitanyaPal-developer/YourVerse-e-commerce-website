import React, { useEffect, useMemo, useState } from "react";

const PRODUCTS = [
  { id: 1, name: "Studio Headphones", category: "Audio", price: 189, oldPrice: 229, rating: 4.9, tag: "BESTSELLER", color: "sand", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85" },
  { id: 2, name: "Pulse Smartwatch", category: "Wearables", price: 249, oldPrice: 299, rating: 4.8, tag: "NEW", color: "mint", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85" },
  { id: 3, name: "Arc Wireless Speaker", category: "Audio", price: 129, oldPrice: null, rating: 4.7, tag: "", color: "lavender", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85" },
  { id: 4, name: "Orbit Camera", category: "Photography", price: 579, oldPrice: 649, rating: 4.9, tag: "LIMITED", color: "blue", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85" },
  { id: 5, name: "Keychron Mechanical Keys", category: "Workspace", price: 139, oldPrice: null, rating: 4.6, tag: "", color: "peach", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85" },
  { id: 6, name: "Aero Desk Lamp", category: "Workspace", price: 89, oldPrice: 109, rating: 4.5, tag: "", color: "cream", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85" },
  { id: 7, name: "Everyday Camera Bag", category: "Accessories", price: 74, oldPrice: null, rating: 4.7, tag: "POPULAR", color: "sand", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85" },
  { id: 8, name: "Minimal Phone Stand", category: "Accessories", price: 35, oldPrice: null, rating: 4.4, tag: "", color: "mint", image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=85" }
];

// Replace demo products and prices with your own before publishing.
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

function Icon({ name }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    check: <path d="m5 12 4 4L19 6" />
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function ProductCard({ product, isFavorite, onFavorite, onAdd }) {
  return (
    <article className="product-card">
      <div className={`product-image ${product.color}`}>
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <button className={`favorite-button ${isFavorite ? "is-favorite" : ""}`} onClick={() => onFavorite(product.id)} aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}>
          <Icon name="heart" />
        </button>
        <img src={product.image} alt={product.name} loading="lazy" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
        <button className="quick-add" onClick={() => onAdd(product)}><Icon name="plus" /> Add to bag</button>
      </div>
      <div className="product-info">
        <div className="product-meta"><span>{product.category}</span><span className="rating">★ {product.rating}</span></div>
        <h3>{product.name}</h3>
        <div className="price-row"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div>
      </div>
    </article>
  );
}

export default function App() {
  const [cart, setCart] = useState(() => readStorage("nova-cart", []));
  const [favorites, setFavorites] = useState(() => readStorage("nova-favorites", []));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => { localStorage.setItem("nova-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("nova-favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const categories = ["All", ...new Set(PRODUCTS.map((p) => p.category))];
  const visibleProducts = useMemo(() => {
    let list = PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (category === "All" || p.category === category) &&
      (!onlyFavorites || favorites.includes(p.id))
    );
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [query, category, sort, onlyFavorites, favorites]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 150 ? 0 : 8;
  const total = subtotal + shipping;

  function addToCart(product) {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      return found ? current.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item) : [...current, { ...product, qty: 1 }];
    });
    setToast(`${product.name} added to your bag`);
  }
  function changeQty(id, amount) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, qty: item.qty + amount } : item).filter((item) => item.qty > 0));
  }
  function toggleFavorite(id) {
    setFavorites((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }
  function placeDemoOrder(event) {
    event.preventDefault();
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    setOrderPlaced(true);
    setToast("Demo order placed successfully!");
  }

  return (
    <div className="app-shell">
      <div className="announcement">Complimentary shipping on orders over $150 <span>✦</span> Thoughtful tech, made simple</div>
      <header className="site-header">
        <a href="#home" className="wordmark" aria-label="YourVerse home">YourVerse<span>.</span></a>
        <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu"><Icon name="menu" /></button>
        <nav className={mobileMenu ? "main-nav nav-open" : "main-nav"}>
          <a href="#shop" onClick={() => setMobileMenu(false)}>Shop all</a>
          <a href="#shop" onClick={() => { setCategory("Audio"); setMobileMenu(false); }}>Audio</a>
          <a href="#shop" onClick={() => { setCategory("Workspace"); setMobileMenu(false); }}>Workspace</a>
          <a href="#story" onClick={() => setMobileMenu(false)}>Our philosophy</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button wishlist-header" onClick={() => { setOnlyFavorites(!onlyFavorites); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }} aria-label="Show wishlist"><Icon name="heart" /><span className="action-label">Saved</span>{favorites.length > 0 && <i>{favorites.length}</i>}</button>
          <button className="icon-button cart-trigger" onClick={() => setCartOpen(true)} aria-label="Open shopping bag"><Icon name="bag" /><span className="action-label">Bag</span><i>{cartCount}</i></button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> THE EVERYDAY EDITION · 2026</p>
            <h1>Good design.<br />Better <em>everyday.</em></h1>
            <p className="hero-description">Thoughtfully selected tech and everyday essentials that make the little things feel extraordinary.</p>
            <div className="hero-actions"><a className="button button-dark" href="#shop">Explore the collection <Icon name="arrow" /></a><span className="hero-note">Considered goods. Lasting impact.</span></div>
            <div className="hero-stats"><div><strong>08</strong><span>Curated essentials</span></div><div><strong>4.8<span className="star">★</span></strong><span>Average customer rating</span></div><div><strong>30-day</strong><span>Easy returns</span></div></div>
          </div>
          <div className="hero-art">
            <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
            <div className="hero-art-label label-top">OBJECTS FOR BETTER LIVING <span>↗</span></div>
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=90" alt="Premium over-ear headphones" />
            <div className="floating-note"><span className="floating-note-icon">✳</span><div><strong>Less, but better.</strong><span>Our design principle</span></div></div>
            <div className="hero-art-label label-bottom">Nº 001 — AUDIO / DAILY USE</div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Store benefits">
          <div><span>✳</span> Curated, not crowded</div><div><span>↗</span> Free shipping over $150</div><div><span>◎</span> 30-day easy returns</div><div><span>♡</span> Designed to last</div>
        </section>

        <section className="shop-section section-wrap" id="shop">
          <div className="section-heading">
            <div><p className="eyebrow">THE YourVerse COLLECTION</p><h2>Objects of <em>desire.</em></h2><p className="section-subtitle">Useful things. Beautifully considered.</p></div>
            <button className={onlyFavorites ? "text-button active-filter" : "text-button"} onClick={() => setOnlyFavorites(!onlyFavorites)}><Icon name="heart" /> {onlyFavorites ? "Show all products" : `Wishlist (${favorites.length})`}</button>
          </div>
          <div className="shop-toolbar">
            <div className="category-list">{categories.map((c) => <button key={c} onClick={() => setCategory(c)} className={category === c ? "category-chip selected" : "category-chip"}>{c}</button>)}</div>
            <div className="shop-tools">
              <label className="search-box"><Icon name="search" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." aria-label="Search products" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" /></button>}</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select>
            </div>
          </div>
          <div className="results-line"><span>{visibleProducts.length} thoughtfully selected {visibleProducts.length === 1 ? "piece" : "pieces"}</span><span>Designed for everyday</span></div>
          {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)} onFavorite={toggleFavorite} onAdd={addToCart} />)}</div> : <div className="empty-state"><span>⌕</span><h3>No products found</h3><p>Try another search or clear your filters.</p><button className="button button-dark" onClick={() => { setQuery(""); setCategory("All"); setOnlyFavorites(false); }}>Clear filters</button></div>}
        </section>

        <section className="manifesto" id="story"><div className="manifesto-mark">N<span>.</span></div><p className="eyebrow">A SMALLER, BETTER WAY</p><h2>Buy less.<br /><em>Choose well.</em><br />Make it matter.</h2><p>We believe the things you use every day should earn their place in your life. That's why every YourVerse pick balances form, function, and a little bit of delight.</p><a href="#shop" className="manifesto-link">Find your everyday essential <Icon name="arrow" /></a></section>
      </main>

      <footer className="site-footer"><a href="#home" className="wordmark">YourVerse<span>.</span></a><p>Considered goods for everyday life.</p><div className="footer-links"><a href="#shop">Shop</a><a href="#story">Our philosophy</a><a href="mailto:hello@example.com">Contact</a></div><small>© 2026 YourVerse. For demo — not a real store.</small></footer>

      {cartOpen && <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}><aside className="cart-drawer" aria-label="Shopping bag"><div className="drawer-heading"><div><p className="eyebrow">YOUR SELECTION</p><h2>Your bag <span>({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag"><Icon name="close" /></button></div>{cart.length === 0 ? <div className="cart-empty"><span>✳</span><h3>Your bag is taking a breather.</h3><p>Find something useful and beautiful.</p><button className="button button-dark" onClick={() => { setCartOpen(false); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}>Explore products</button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div className="cart-item-info"><span>{item.category}</span><strong>{item.name}</strong><b>{money(item.price)}</b><div className="qty-control"><button onClick={() => changeQty(item.id, -1)} aria-label="Decrease quantity"><Icon name="minus" /></button><span>{item.qty}</span><button onClick={() => changeQty(item.id, 1)} aria-label="Increase quantity"><Icon name="plus" /></button></div></div><button className="remove-item" onClick={() => setCart((current) => current.filter((p) => p.id !== item.id))}>Remove</button></div>)}</div><div className="cart-summary"><p><span>Subtotal</span><strong>{money(subtotal)}</strong></p><p><span>Shipping</span><strong>{shipping === 0 ? "Complimentary" : money(shipping)}</strong></p><div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div><button className="button button-dark checkout-button" onClick={() => setCheckoutOpen(true)}>Continue to checkout <Icon name="arrow" /></button><small>Demo checkout only. No payment is collected.</small></div></>}</aside></div>}

      {checkoutOpen && <div className="overlay modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setCheckoutOpen(false); }}><div className="checkout-modal"><button className="icon-button modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><Icon name="close" /></button>{orderPlaced ? <div className="success-state"><span><Icon name="check" /></span><h2>Order confirmed.</h2><p>This is a demo. No real order or payment was made.</p><button className="button button-dark" onClick={() => { setOrderPlaced(false); setCheckoutOpen(false); }}>Back to store</button></div> : <><p className="eyebrow">ALMOST YOURS</p><h2>Checkout</h2><p className="checkout-intro">This demo simulates the checkout experience. It does not process payments.</p><form onSubmit={placeDemoOrder}><label>Full name<input required placeholder="Alex Morgan" /></label><label>Email address<input required type="email" placeholder="alex@example.com" /></label><label>Shipping address<input required placeholder="Street and house number" /></label><div className="checkout-total"><span>Order total</span><strong>{money(total)}</strong></div><button className="button button-dark checkout-button" type="submit">Place demo order <Icon name="arrow" /></button></form></>}</div></div>}

      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}