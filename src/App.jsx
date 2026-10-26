import React, { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, Heart, Leaf, Menu, Minus, Plus, Search, ShoppingBag, Sparkles, Star, Trash2, Truck, UserRound, X } from "lucide-react";

const money = (value) => new Intl.NumberFormat("mn-MN").format(value) + "₮";
const categories = ["Бүгд", "Арьс арчилгаа", "Нүүр будалт", "Үс арчилгаа", "Үнэртэн"];
const products = [
  { id: 1, brand: "GLOW RECIPE", name: "Watermelon Glow Serum", subtitle: "Чийгшүүлэгч нүүрний серум", category: "Арьс арчилгаа", price: 79000, oldPrice: 99000, rating: 4.9, reviews: 128, tag: "BESTSELLER", image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=850&q=85" },
  { id: 2, brand: "THE ORDINARY", name: "Niacinamide 10% + Zinc 1%", subtitle: "Арьсны тослог тэнцвэржүүлэгч", category: "Арьс арчилгаа", price: 42000, oldPrice: null, rating: 4.8, reviews: 96, tag: "NEW", image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=850&q=85" },
  { id: 3, brand: "RARE BEAUTY", name: "Soft Pinch Liquid Blush", subtitle: "Шингэн хацар өнгөлөгч", category: "Нүүр будалт", price: 68000, oldPrice: 85000, rating: 4.9, reviews: 212, tag: "-20%", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=850&q=85" },
  { id: 4, brand: "L'OCCITANE", name: "Shea Butter Hand Cream", subtitle: "Тэжээл өгөх гарын тос", category: "Арьс арчилгаа", price: 55000, oldPrice: null, rating: 4.7, reviews: 84, tag: "", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=850&q=85" },
  { id: 5, brand: "OLAPLEX", name: "Bond Maintenance No.5", subtitle: "Үсний чийгшүүлэгч ангижруулагч", category: "Үс арчилгаа", price: 92000, oldPrice: null, rating: 4.8, reviews: 61, tag: "NEW", image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=850&q=85" },
  { id: 6, brand: "DIPTYQUE", name: "Eau Rose Eau de Toilette", subtitle: "Цэцэгсийн зөөлөн үнэртэн", category: "Үнэртэн", price: 189000, oldPrice: 220000, rating: 4.9, reviews: 47, tag: "-14%", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=850&q=85" },
];
const categoryCards = [
  { name: "Арьс арчилгаа", detail: "Өдөр тутмын өөртөө анхаарал", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85" },
  { name: "Нүүр будалт", detail: "Өөрийн гоо үзэсгэлэнг тодруул", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85" },
  { name: "Үс арчилгаа", detail: "Эрүүл, торгомсог үс", image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=85" },
];

export default function App() {
  const [category, setCategory] = useState("Бүгд");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [sort, setSort] = useState("popular");
  const [message, setMessage] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const rows = products.filter((p) => (category === "Бүгд" || p.category === category) && (!q || `${p.brand} ${p.name} ${p.subtitle} ${p.category}`.toLocaleLowerCase().includes(q)));
    if (sort === "low") rows.sort((a, b) => a.price - b.price);
    if (sort === "high") rows.sort((a, b) => b.price - a.price);
    return rows;
  }, [category, query, sort]);
  const qty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  function addToCart(product) {
    setCart((current) => {
      const match = current.find((p) => p.id === product.id);
      return match ? current.map((p) => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p) : [...current, { ...product, quantity: 1 }];
    });
    setMessage(`${product.name} сагсанд нэмэгдлээ`);
    window.setTimeout(() => setMessage(""), 2200);
  }
  function changeQty(id, delta) {
    setCart((current) => current.map((p) => p.id === id ? { ...p, quantity: p.quantity + delta } : p).filter((p) => p.quantity > 0));
  }
  function chooseCategory(next) {
    setCategory(next); setMenuOpen(false);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <div className="app">
      <div className="announcement">✨ 150,000₮-өөс дээш захиалгад хүргэлт ҮНЭГҮЙ <span>·</span> Өөртөө хайртай байя ♡</div>
      <header className="header">
        <div className="header-inner container">
          <button className="icon-button mobile-menu" aria-label="Цэс нээх" onClick={() => setMenuOpen(!menuOpen)}><Menu size={23} /></button>
          <a href="#home" className="logo">bloom<span>.</span><small>BEAUTY & SKINCARE</small></a>
          <nav className={menuOpen ? "nav open" : "nav"} aria-label="Үндсэн цэс"><a href="#home" onClick={() => setMenuOpen(false)}>Нүүр</a><a href="#products" onClick={() => {setCategory("Бүгд");setMenuOpen(false)}}>Бүтээгдэхүүн</a><a href="#categories" onClick={() => setMenuOpen(false)}>Ангилал</a><a href="#about" onClick={() => setMenuOpen(false)}>Бидний тухай</a></nav>
          <div className="header-actions"><label className="search-box"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Бүтээгдэхүүн хайх..." aria-label="Бүтээгдэхүүн хайх" /></label><button className="icon-button account" aria-label="Хэрэглэгч" onClick={() => alert("Нэвтрэх хэсгийг backend холбосны дараа ашиглана.")}><UserRound size={22}/></button><button className="icon-button bag-button" aria-label="Сагс" onClick={() => setCartOpen(true)}><ShoppingBag size={22}/>{qty > 0 && <span className="bag-count">{qty}</span>}</button></div>
        </div>
      </header>
      <main id="home">
        <section className="hero"><div className="hero-photo" role="img" aria-label="Байгалийн гаралтай арьс арчилгааны бүтээгдэхүүн"/><div className="container hero-inner"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line"/> THE ART OF SELF-CARE</p><h1>Өөрийнхөөрөө<br/><em>гэрэлт.</em></h1><p className="hero-description">Таны арьс, таны гоо үзэсгэлэн. Өдөр бүр өөртөө зарцуулах жижигхэн аз жаргалыг биднээс олоорой.</p><a href="#products" className="primary-button">Худалдан авалт хийх <ArrowRight size={18}/></a><div className="hero-proof"><div className="avatars"><span>♡</span><span>✿</span><span>★</span></div><div><strong>2,000+ сэтгэл хангалуун хэрэглэгч</strong><small><span>★★★★★</span> 4.9 / 5 үнэлгээ</small></div></div></div></div><div className="hero-index">01 <span>/ 03</span></div></section>
        <section className="benefits container"><div><Truck/><p><strong>Хурдан хүргэлт</strong><span>Улаанбаатар хот даяар</span></p></div><div><Leaf/><p><strong>Чанартай бүтээгдэхүүн</strong><span>Нягтлан сонгосон брэндүүд</span></p></div><div><Sparkles/><p><strong>Өдөр бүр гэрэлт</strong><span>Таны арьсанд зориулсан</span></p></div></section>
        <section id="categories" className="section categories container"><div className="section-heading center"><p className="eyebrow">DISCOVER YOUR BEAUTY</p><h2>Танд зориулсан <em>ангиллууд</em></h2><p>Өдөр тутмын арчилгаанаас онцгой мөч хүртэл</p></div><div className="category-grid">{categoryCards.map((item) => <button key={item.name} className="category-card" onClick={() => chooseCategory(item.name)}><img src={item.image} alt={item.name}/><span className="category-shade"/><span className="category-copy"><small>{item.detail}</small><strong>{item.name}</strong><span>Дэлгэрэнгүй үзэх <ArrowRight size={17}/></span></span></button>)}</div></section>
        <section id="products" className="section product-section"><div className="container"><div className="section-heading product-title"><div><p className="eyebrow">HANDPICKED FOR YOU</p><h2>Онцлох <em>бүтээгдэхүүн</em></h2><p>Хайртай бүтээгдэхүүнээ эндээс сонгоорой</p></div><div className="sort-wrap"><span>Эрэмбэлэх:</span><select aria-label="Бүтээгдэхүүн эрэмбэлэх" value={sort} onChange={(e) => setSort(e.target.value)}><option value="popular">Онцлох</option><option value="low">Үнэ өсөхөөр</option><option value="high">Үнэ буурахаар</option></select><ChevronDown size={15}/></div></div><div className="tabs">{categories.map((c) => <button key={c} className={category === c ? "tab active" : "tab"} onClick={() => setCategory(c)}>{c}</button>)}</div><div className="product-grid">{filtered.map((p) => <article className="product-card" key={p.id}><div className="product-image"><img src={p.image} alt={p.name} loading="lazy"/>{p.tag && <span className="product-tag">{p.tag}</span>}<button className={favorites.includes(p.id) ? "favorite active" : "favorite"} aria-label={favorites.includes(p.id) ? "Хүслийн жагсаалтаас хасах" : "Хүслийн жагсаалтад нэмэх"} onClick={() => setFavorites((v) => v.includes(p.id) ? v.filter((x) => x !== p.id) : [...v, p.id])}><Heart size={19} fill={favorites.includes(p.id) ? "currentColor" : "none"}/></button></div><div className="product-info"><span className="brand">{p.brand}</span><h3>{p.name}</h3><p>{p.subtitle}</p><div className="rating"><Star size={14} fill="currentColor"/> {p.rating} <span>({p.reviews} үнэлгээ)</span></div><div className="product-bottom"><div className="prices"><strong>{money(p.price)}</strong>{p.oldPrice && <s>{money(p.oldPrice)}</s>}</div><button className="add-button" onClick={() => addToCart(p)} aria-label={`${p.name} сагсанд нэмэх`}><Plus size={21}/></button></div></div></article>)}</div>{filtered.length === 0 && <div className="empty-results">Хайлтад тохирох бүтээгдэхүүн олдсонгүй. Өөр үгээр хайж үзнэ үү.</div>}<div className="all-products"><button onClick={() => {setCategory("Бүгд");setQuery("");setSort("popular")}}>Бүх бүтээгдэхүүн үзэх <ArrowRight size={17}/></button></div></div></section>
        <section className="story-section" id="about"><div className="story-image" role="img" aria-label="Зөөлөн арьс арчилгаа"/><div className="story-content"><p className="eyebrow">A LITTLE LOVE FOR YOURSELF</p><h2>Гоо сайхан бол<br/><em>өөртөө хайртай байх.</em></h2><p>Бид гоо сайхныг бусдын стандартаар биш, өөрийнхөөрөө мэдрэх ёстой гэдэгт итгэдэг. Тиймээс өдөр бүрийг тань илүү гэрэлтэй болгох бүтээгдэхүүнийг сонгон хүргэж байна.</p><a href="#categories">Өөрт тохирохыг олох <ArrowRight size={18}/></a></div></section>
        <section className="newsletter container"><div><p className="eyebrow">JOIN THE BLOOM CLUB</p><h2>Гэрэлтэх мэдээг<br/><em>түрүүлж аваарай.</em></h2><p>Шинэ бүтээгдэхүүн, онцгой хямдралын мэдээг имэйлээр аваарай.</p></div><form onSubmit={(e) => {e.preventDefault(); if(email.includes("@")) setSubscribed(true)}}><div className="email-input"><input type="email" required placeholder="Таны имэйл хаяг" value={email} onChange={(e) => {setEmail(e.target.value);setSubscribed(false)}}/><button type="submit" aria-label="Бүртгүүлэх"><ArrowRight size={20}/></button></div><small>{subscribed ? <><Check size={15}/> Баярлалаа! Бүртгэлийг демо байдлаар хүлээн авлаа.</> : "Шинэ мэдээг анхлан авахаар бүртгүүлээрэй ♡"}</small></form></section>
      </main>
      <footer className="footer"><div className="container footer-main"><div><a className="logo footer-logo" href="#home">bloom<span>.</span><small>BEAUTY & SKINCARE</small></a><p>Өөрийнхөөрөө гэрэлт. Өөртөө хайртай бай.</p></div><div><strong>Дэлгүүр</strong><a href="#products">Бүтээгдэхүүн</a><a href="#categories">Ангилал</a><a href="#products">Онцлох санал</a></div><div><strong>Мэдээлэл</strong><a href="#about">Бидний тухай</a><a href="mailto:hello@bloom.example">Холбоо барих</a><span>Хүргэлтийн мэдээлэл</span></div><div><strong>Холбоо барих</strong><span>Улаанбаатар, Монгол</span><span>hello@bloom.example</span><span>Даваа–Ням · 10:00–20:00</span></div></div><div className="footer-bottom container"><span>© 2026 Bloom Beauty. Демо вебсайт.</span><span>Made with ♡ for beautiful days</span></div></footer>
      {message && <div className="toast"><Check size={17}/>{message}</div>}
      {cartOpen && <div className="drawer-overlay" onMouseDown={(e) => {if(e.target === e.currentTarget) setCartOpen(false)}}><aside className="cart-drawer" aria-label="Худалдан авалтын сагс"><div className="drawer-header"><h2>Миний сагс <span>({qty})</span></h2><button className="icon-button" aria-label="Хаах" onClick={() => setCartOpen(false)}><X/></button></div><div className="cart-items">{cart.length === 0 ? <div className="cart-empty"><ShoppingBag size={47}/><h3>Таны сагс хоосон байна</h3><p>Өөрт таалагдсан бүтээгдэхүүнээ сонгоорой.</p><button className="primary-button" onClick={() => setCartOpen(false)}>Үргэлжлүүлэн үзэх</button></div> : cart.map((p) => <div className="cart-item" key={p.id}><img src={p.image} alt={p.name}/><div><strong>{p.name}</strong><span>{money(p.price)}</span><div className="quantity"><button aria-label="Нэгээр хасах" onClick={() => changeQty(p.id,-1)}><Minus size={15}/></button>{p.quantity}<button aria-label="Нэгээр нэмэх" onClick={() => changeQty(p.id,1)}><Plus size={15}/></button></div></div><button className="remove" aria-label="Устгах" onClick={() => setCart((v) => v.filter((item) => item.id !== p.id))}><Trash2 size={18}/></button></div>)}</div>{cart.length > 0 && <div className="cart-summary"><div><span>Нийт дүн</span><strong>{money(total)}</strong></div><p>{total >= 150000 ? "Таны хүргэлт үнэгүй! ✨" : `Үнэгүй хүргэлтэд ${money(150000 - total)} дутуу байна.`}</p><button onClick={() => alert("Энэ бол нүүр хуудасны демо. Төлбөрийн систем холбогдоогүй байна.")}>Захиалга үргэлжлүүлэх <ArrowRight size={17}/></button></div>}</aside></div>}
    </div>
  );
}
