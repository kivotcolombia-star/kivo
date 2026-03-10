import { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Re-exportar compat API via CDN no funciona en Vite, usamos firebase compat via import
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDG_jgUJAsKo2ywA1ofy91buj37ILPhAuw",
  authDomain: "kivo-405ec.firebaseapp.com",
  projectId: "kivo-405ec",
  storageBucket: "kivo-405ec.firebasestorage.app",
  messagingSenderId: "176335042901",
  appId: "1:176335042901:web:d174dcc844f5dca10cd7dc"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const CLOUDINARY_CLOUD = "dw9vlzgyx";
const CLOUDINARY_UPLOAD_PRESET = "kivo_unsigned";
const ADMIN_WHATSAPP = "573106593037";
const ADMIN_UID = "HEYdsAU0eyghGScUELs6LSqWnxr2"; // Solo este usuario ve el panel Admin


const fmt = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}).format(n);

function useLocalState(key, init) {
  const [val, setVal] = useState(() => { try { const s=localStorage.getItem(key); return s?JSON.parse(s):init; } catch { return init; }});
  const set = v => { setVal(v); try { localStorage.setItem(key,JSON.stringify(v)); } catch {} };
  return [val, set];
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
const Ic = {
  home:     <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  heart:    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  user:     <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  cart:     <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.8 13h8.4c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0020.64 4H5.21L4.27 2H1v2h2l3.6 7.59L5.25 14a2 2 0 002 2.97V19h14v-2H9.28c-.14 0-.25-.11-.25-.25L7.8 13z"/></svg>,
  back:     <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>,
  search:   <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  star:     <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
  plus:     <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>,
  minus:    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 13H5v-2h14v2z"/></svg>,
  trash:    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
  time:     <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>,
  tag:      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>,
  close:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  map:      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  upload:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>,
  edit:     <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
};

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  app:       { maxWidth:430, margin:"0 auto", minHeight:"100vh", position:"relative", background:"#F4F5F7" },
  page:      { paddingBottom:84, minHeight:"100vh" },
  topbar:    { position:"sticky", top:0, zIndex:50, background:"#F4F5F7", padding:"14px 16px 10px", borderBottom:"1px solid var(--border)" },
  nav:       { position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"#fff", borderTop:"1px solid var(--border)", display:"flex", zIndex:100, paddingBottom:"env(safe-area-inset-bottom,6px)" },
  navBtn:    a => ({ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"9px 0 5px", background:"none", color:a?"var(--orange)":"var(--muted)", fontSize:10, fontWeight:600 }),
  card:      { background:"#fff", borderRadius:16, border:"1px solid var(--border)", overflow:"hidden" },
  chip:      a => ({ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, background:a?"var(--orange)":"var(--surface)", color:a?"#fff":"var(--muted)", border:"none", whiteSpace:"nowrap" }),
  btnPrimary:{ background:"linear-gradient(135deg,#FF5722,#FF8A65)", color:"#fff", borderRadius:14, padding:"14px", fontSize:15, fontWeight:700, width:"100%", border:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  btnGreen:  { background:"linear-gradient(135deg,#25D366,#128C7E)", color:"#fff", borderRadius:14, padding:"14px", fontSize:15, fontWeight:700, width:"100%", border:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  btnOutline:{ background:"none", color:"var(--orange)", border:"1.5px solid var(--orange)", borderRadius:12, padding:"10px 18px", fontSize:14, fontWeight:600 },
  cartFab:   { position:"fixed", bottom:78, right:14, background:"linear-gradient(135deg,#FF5722,#FF8A65)", borderRadius:"50%", width:50, height:50, display:"flex", alignItems:"center", justifyContent:"center", zIndex:90, boxShadow:"0 4px 18px rgba(255,87,34,.45)", border:"none", color:"#fff" },
  input:     { width:"100%", background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:12, padding:"11px 14px", color:"var(--text)", fontSize:14, marginTop:6 },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function Spinner() {
  return <div style={{ width:28, height:28, border:"3px solid #eee", borderTopColor:"var(--orange)", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>;
}

function StarRow({ rating, reviews }) {
  return (
    <span style={{ display:"flex", alignItems:"center", gap:3, color:"#FFD700", fontSize:11 }}>
      {Ic.star} <b style={{ color:"var(--text)" }}>{rating?.toFixed(1)||"Nuevo"}</b>
      {reviews > 0 && <span style={{ color:"var(--muted)" }}>({reviews})</span>}
    </span>
  );
}

function Badge({ n }) {
  if (!n) return null;
  return <span style={{ position:"absolute", top:-5, right:-6, background:"var(--orange)", color:"#fff", borderRadius:"50%", width:15, height:15, fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{n>99?"99+":n}</span>;
}

function AddBtn({ product, cart, setCart, bizId, bizName }) {
  const item = cart.find(i => i.id === product.id);
  const qty = item?.qty || 0;
  const price = product.offerPrice || product.price;
  const currentBizId = cart[0]?.bizId || null;
  const differentBiz = currentBizId && currentBizId !== bizId && cart.length > 0;

  const add = e => {
    e.stopPropagation();
    if (differentBiz) {
      if (window.confirm(`Tu carrito tiene productos de otro negocio.\n¿Vaciarlo y agregar de ${bizName}?`)) {
        setCart([{...product, price, qty:1, bizId}]);
      }
      return;
    }
    setCart(p => {
      const idx = p.findIndex(i=>i.id===product.id);
      if (idx>=0) return p.map((i,n)=>n===idx?{...i,qty:i.qty+1}:i);
      return [...p,{...product,price,qty:1,bizId}];
    });
  };
  const sub = e => { e.stopPropagation(); setCart(p => { const idx=p.findIndex(i=>i.id===product.id); if(p[idx].qty===1) return p.filter((_,n)=>n!==idx); return p.map((i,n)=>n===idx?{...i,qty:i.qty-1}:i); }); };
  if (qty===0) return (
    <button onClick={add} style={{ background:"var(--orange)", color:"#fff", borderRadius:10, padding:"6px 12px", fontSize:12, fontWeight:700, border:"none", display:"flex", alignItems:"center", gap:3 }}>
      {Ic.plus} Agregar
    </button>
  );
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <button onClick={sub} style={{ background:"var(--surface)", color:"var(--text)", borderRadius:8, width:28, height:28, border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}>{Ic.minus}</button>
      <b style={{ minWidth:16, textAlign:"center", fontSize:14 }}>{qty}</b>
      <button onClick={add} style={{ background:"var(--orange)", color:"#fff", borderRadius:8, width:28, height:28, border:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>{Ic.plus}</button>
    </div>
  );
}

// ── CLOUDINARY UPLOAD ─────────────────────────────────────────────────────────
async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  fd.append("folder", "kivo");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method:"POST", body:fd });
  const data = await res.json();
  if (data.secure_url) return data.secure_url;
  throw new Error(data.error?.message || "Error subiendo imagen");
}

// ── HOME PAGE ─────────────────────────────────────────────────────────────────
// ── BANNERS CAROUSEL ──────────────────────────────────────────────────────────
function BannersCarousel() {
  const [banners, setBanners] = useState([]);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = db.collection("banners").where("active","==",true).onSnapshot(snap => {
      const docs = snap.docs.map(d=>({id:d.id,...d.data()}));
      docs.sort((a,b)=>(a.order||0)-(b.order||0));
      setBanners(docs);
      setLoaded(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setActive(p => (p+1) % banners.length), 3500);
    return () => clearInterval(t);
  }, [banners.length]);

  const defaultBanners = [{
    id:"default", title:"Primer domicilio", subtitle:"OFERTA ESPECIAL",
    highlight:"¡GRATIS!", emoji:"🛵",
    gradient:"linear-gradient(135deg,#FF5722,#9B59B6)", btnText:"Pedir ahora",
  }];

  if (!loaded) return <div style={{ margin:"0 16px 20px", height:110, borderRadius:18, background:"var(--surface)" }}/>;

  const list = banners.length > 0 ? banners : defaultBanners;
  const b = list[active] || list[0];

  return (
    <div style={{ margin:"0 16px 20px" }}>
      <div style={{ borderRadius:18, overflow:"hidden", background:b.image?"#000":b.gradient||"linear-gradient(135deg,#FF5722,#9B59B6)", position:"relative", minHeight:110 }}>
        {b.image ? (
          <>
            <img src={b.image} alt={b.title} style={{ width:"100%", height:150, objectFit:"cover", display:"block" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,rgba(0,0,0,.55),rgba(0,0,0,.1))" }}/>
            <div style={{ position:"absolute", bottom:16, left:18, right:18 }}>
              {b.subtitle && <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.8)", marginBottom:3 }}>{b.subtitle}</div>}
              <div style={{ fontSize:20, fontWeight:800, color:"#fff", lineHeight:1.2 }}>{b.title}{b.highlight&&<><br/><span style={{ color:"#FFE082" }}>{b.highlight}</span></>}</div>
              {b.btnText && <button style={{ background:"#fff", color:"var(--orange)", borderRadius:10, padding:"6px 14px", fontSize:12, fontWeight:700, border:"none", marginTop:10 }}>{b.btnText}</button>}
            </div>
          </>
        ) : (
          <div style={{ padding:"18px 20px", position:"relative" }}>
            {b.emoji && <div style={{ position:"absolute", right:-8, top:-8, fontSize:72, opacity:.15 }}>{b.emoji}</div>}
            {b.subtitle && <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.7)", marginBottom:3 }}>{b.subtitle}</div>}
            <div style={{ fontSize:19, fontWeight:800, color:"#fff", lineHeight:1.2, marginBottom:10 }}>
              {b.title}{b.highlight&&<><br/><span style={{ color:"#FFE082" }}>{b.highlight}</span></>}
            </div>
            {b.btnText && <button style={{ background:"#fff", color:"var(--orange)", borderRadius:10, padding:"7px 14px", fontSize:12, fontWeight:700, border:"none" }}>{b.btnText}</button>}
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div style={{ display:"flex", justifyContent:"center", gap:5, marginTop:8 }}>
          {list.map((_,i) => (
            <button key={i} onClick={()=>setActive(i)}
              style={{ width:i===active?18:7, height:7, borderRadius:4, background:i===active?"var(--orange)":"#ccc", border:"none", padding:0, transition:"width .3s" }}/>
          ))}
        </div>
      )}
    </div>
  );
}

function HomePage({ setPage, cart, setCart, favorites, toggleFav }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsub = db.collection("businesses").where("active","==",true).onSnapshot(snap => {
      setBusinesses(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const categories = [
    { id:"all", label:"Todo", emoji:"🏪" },
    { id:"supermarkets", label:"Súper", emoji:"🛒" },
    { id:"restaurants", label:"Comida", emoji:"🍔" },
    { id:"pharmacies", label:"Farmacias", emoji:"💊" },
    { id:"bakeries", label:"Panaderías", emoji:"🥐" },
  ];

  const filtered = businesses.filter(b => {
    const matchCat = filter==="all" || b.category===filter;
    const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Separar por plan
  const premium   = filtered.filter(b => b.plan === "premium");
  const destacado = filtered.filter(b => b.plan === "destacado");
  const basico    = filtered.filter(b => !b.plan || b.plan === "basico");

  // Ofertas solo de negocios destacado o premium
  const offerBiz = businesses.filter(b => b.plan === "destacado" || b.plan === "premium");

  return (
    <div style={S.page}>
      {/* Topbar */}
      <div style={S.topbar}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <div>
            <div style={{ fontSize:11, color:"var(--muted)", display:"flex", alignItems:"center", gap:3 }}>{Ic.map} Mariquita, Tolima</div>
            <div style={{ fontFamily:"'Plus Jakarta Sans'", fontWeight:800, fontSize:22, letterSpacing:"-.5px" }}>
              <span style={{ color:"var(--orange)" }}>KI</span>VO
            </div>
          </div>
          <div style={{ background:"#fff", borderRadius:12, padding:"7px 11px", fontSize:11, fontWeight:700, color:"var(--orange)", border:"1px solid rgba(255,87,34,.25)" }}>🛵 Activo</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", borderRadius:13, padding:"9px 13px", border:"1px solid var(--border)" }}>
          <span style={{ color:"var(--muted)" }}>{Ic.search}</span>
          <input style={{ flex:1, background:"none", color:"var(--text)", fontSize:14 }} placeholder="Buscar negocios o productos..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button onClick={()=>setSearch("")} style={{ background:"none", color:"var(--muted)", padding:0 }}>{Ic.close}</button>}
        </div>
      </div>

      <div style={{ padding:"14px 0" }}>
        {/* Categorías */}
        <div style={{ overflowX:"auto", display:"flex", gap:8, padding:"0 16px 14px", scrollbarWidth:"none" }}>
          {categories.map(c => (
            <button key={c.id} style={S.chip(filter===c.id)} onClick={()=>setFilter(c.id)}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Carrusel de banners */}
        {!search && filter==="all" && <BannersCarousel/>}

        {/* Ofertas del día — solo destacado y premium */}
        {!search && offerBiz.length > 0 && (
          <section style={{ marginBottom:20 }}>
            <h2 style={{ fontSize:16, fontWeight:800, padding:"0 16px", marginBottom:10 }}>🔥 Ofertas del día</h2>
            <div style={{ overflowX:"auto", display:"flex", gap:12, padding:"2px 16px 8px", scrollbarWidth:"none" }}>
              {offerBiz.map(b => (
                <div key={b.id} onClick={()=>setPage({name:"business",data:b})}
                  style={{ minWidth:140, background:"#fff", borderRadius:13, overflow:"hidden", border:"1px solid var(--border)", flexShrink:0, cursor:"pointer" }}>
                  <img src={b.image||"https://via.placeholder.com/140x80?text="+b.name} alt={b.name} style={{ width:"100%", height:80, objectFit:"cover" }}/>
                  <div style={{ padding:"7px 9px" }}>
                    <div style={{ fontSize:11, fontWeight:700 }}>{b.name}</div>
                    <div style={{ fontSize:10, color:"var(--orange)", fontWeight:600, marginTop:2 }}>Ver ofertas →</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"40px 0" }}><Spinner/></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", color:"var(--muted)", padding:"40px 0" }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
            <div>No encontramos resultados</div>
          </div>
        ) : (
          <>
            {/* Negocios Premium — Recomendados */}
            {premium.length > 0 && (
              <section style={{ padding:"0 16px", marginBottom:22 }}>
                <h2 style={{ fontSize:16, fontWeight:800, marginBottom:12 }}>👑 Recomendados</h2>
                <div style={{ overflowX:"auto", display:"flex", gap:13, padding:"2px 0 8px", scrollbarWidth:"none" }}>
                  {premium.map(biz => (
                    <div key={biz.id} style={{ minWidth:145, maxWidth:145, flexShrink:0 }}>
                      <BizCard biz={biz} onClick={()=>setPage({name:"business",data:biz})} favorites={favorites} toggleFav={toggleFav}/>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Negocios Destacados */}
            {destacado.length > 0 && (
              <section style={{ padding:"0 16px", marginBottom:22 }}>
                <h2 style={{ fontSize:16, fontWeight:800, marginBottom:12 }}>⭐ Destacados</h2>
                <div style={{ overflowX:"auto", display:"flex", gap:13, padding:"2px 0 8px", scrollbarWidth:"none" }}>
                  {destacado.map(biz => (
                    <div key={biz.id} style={{ minWidth:145, maxWidth:145, flexShrink:0 }}>
                      <BizCard biz={biz} onClick={()=>setPage({name:"business",data:biz})} favorites={favorites} toggleFav={toggleFav}/>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Todos los negocios */}
            <section style={{ padding:"0 16px" }}>
              <h2 style={{ fontSize:16, fontWeight:800, marginBottom:12 }}>
                {filter==="all" ? "🏪 Todos los negocios" : categories.find(c=>c.id===filter)?.emoji + " " + categories.find(c=>c.id===filter)?.label}
              </h2>
              <div style={{ overflowX:"auto", display:"flex", gap:13, padding:"2px 0 8px", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
                {[...premium, ...destacado, ...basico].map(biz => (
                  <div key={biz.id} style={{ minWidth:145, maxWidth:145, flexShrink:0, width:145 }}>
                    <BizCard biz={biz} onClick={()=>setPage({name:"business",data:biz})} favorites={favorites} toggleFav={toggleFav}/>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function BizCard({ biz, onClick, favorites, toggleFav }) {
  const isFav = favorites.includes(biz.id);
  const planBadge = biz.plan === "premium"   ? { label:"👑 Premium",   bg:"#6C3483", color:"#fff" }
                  : biz.plan === "destacado" ? { label:"⭐ Destacado", bg:"#FF5722", color:"#fff" }
                  : null;
  return (
    <div style={{ ...S.card, cursor:"pointer" }} onClick={onClick} className="fadeup">
      <div style={{ position:"relative" }}>
        <img src={biz.image||"https://via.placeholder.com/400x130?text="+biz.name} alt={biz.name} style={{ width:"100%", height:90, objectFit:"cover" }}/>
        <button onClick={e=>{e.stopPropagation();toggleFav(biz.id);}}
          style={{ position:"absolute", top:9, right:9, background:"rgba(0,0,0,.35)", borderRadius:"50%", width:30, height:30, border:"none", color:isFav?"#FF4757":"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {Ic.heart}
        </button>
        {planBadge && (
          <span style={{ position:"absolute", top:9, left:9, background:planBadge.bg, color:planBadge.color, borderRadius:8, padding:"2px 8px", fontSize:9, fontWeight:700 }}>
            {planBadge.label}
          </span>
        )}
      </div>
      <div style={{ padding:"8px 10px 10px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <img src={biz.logo||"https://via.placeholder.com/28?text="+biz.name[0]} alt="" style={{ width:28, height:28, borderRadius:7, objectFit:"cover", border:"2px solid var(--border)", flexShrink:0 }}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:11, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{biz.name}</div>
            <StarRow rating={biz.rating} reviews={biz.reviews}/>
          </div>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:6, fontSize:10, color:"var(--muted)" }}>
          <span style={{ display:"flex", alignItems:"center", gap:2 }}>{Ic.time} {biz.deliveryTime||"30-45 min"}</span>
        </div>
      </div>
    </div>
  );
}

// ── BUSINESS PAGE ─────────────────────────────────────────────────────────────
function BusinessPage({ biz, setPage, cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainCat, setMainCat] = useState("Todos");
  const [subcat, setSubcat] = useState("Todos");

  useEffect(() => {
    db.collection("businesses").doc(biz.id).collection("products")
      .where("active","==",true)
      .get().then(snap => {
        setProducts(snap.docs.map(d=>({id:d.id,...d.data()})));
        setLoading(false);
      }).catch(()=>setLoading(false));
  }, [biz.id]);

  // Obtener categorías principales únicas
  const catMap = {
    supermarkets: {
      "Alimentos y Despensa": ["Condimentos","Enlatados y Envasados","Pasta","Granos, Azúcar y Panela","Harinas y Pre-mezclas","Margarinas y Aceites","Salsas y Aderezos","Huevos"],
      "Aseo del Hogar": ["Accesorios de Limpieza","Cuidado de la Ropa","Cuidado de Superficies y Cocina","Cuidado del Aire","Desechables"],
      "Aseo y Cuidado Personal": ["Afeitado","Cuidado Capilar","Cuidado Corporal","Cuidado Oral","Desodorantes","Jabonería","Papel Higiénico y Pañuelos"],
      "Lácteos": ["Leches","Quesos","Yogures","Otros Derivados"],
      "Mascotas": ["Alimentación Gatos","Alimentación Perros","Aseo de Mascotas"],
      "Bebidas": ["Cervezas","Aguas","Bebidas Vegetales","Gaseosas","Isotónicas y Energizantes","Infusiones, Té, Cafés y Chocolates","Jugos, Refrescos y Néctares"],
    },
    restaurants:  { "Menú": ["Platos","Combos","Entradas","Desayunos","Postres","Bebidas"] },
    pharmacies:   { "Productos": ["Medicamentos","Belleza","Bebé","Vitaminas","Primeros Auxilios"] },
    bakeries:     { "Productos": ["Panes","Pasteles","Tortas","Desayunos","Bebidas"] },
    stores:       { "Productos": ["General","Ofertas","Más Vendido"] },
  };

  const bizCatMap = catMap[biz.category] || {};
  const hasCategories = Object.keys(bizCatMap).length > 0;

  // Subcats disponibles según categoría principal seleccionada
  const availableSubcats = mainCat === "Todos" ? [] : (bizCatMap[mainCat] || []);

  // Filtrar productos
  const filtered = products.filter(p => {
    const pcat = p.category || p.cat || "General";
    if (mainCat === "Todos") return true;
    const subcatsOfMain = bizCatMap[mainCat] || [];
    if (subcat === "Todos") return subcatsOfMain.includes(pcat);
    return pcat === subcat;
  });

  return (
    <div style={S.page}>
      <div style={{ position:"relative" }}>
        <img src={biz.image||"https://via.placeholder.com/430x190?text="+biz.name} alt={biz.name} style={{ width:"100%", height:190, objectFit:"cover" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,.25),rgba(0,0,0,.72))" }}/>
        <button onClick={()=>setPage({name:"home"})} style={{ position:"absolute", top:14, left:14, background:"rgba(0,0,0,.4)", borderRadius:"50%", width:36, height:36, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", border:"none" }}>{Ic.back}</button>
        <div style={{ position:"absolute", bottom:14, left:14, right:14, display:"flex", gap:11, alignItems:"flex-end" }}>
          <img src={biz.logo||"https://via.placeholder.com/52?text="+biz.name[0]} alt="" style={{ width:52, height:52, borderRadius:13, border:"3px solid #fff", objectFit:"cover", flexShrink:0 }}/>
          <div>
            <div style={{ fontWeight:800, fontSize:17, color:"#fff", textShadow:"0 1px 4px rgba(0,0,0,.5)" }}>{biz.name}</div>
            <StarRow rating={biz.rating} reviews={biz.reviews}/>
          </div>
        </div>
      </div>

      <div style={{ padding:"13px 16px" }}>
        <div style={{ display:"flex", gap:14, fontSize:11, color:"var(--muted)", marginBottom:12 }}>
          <span style={{ display:"flex", alignItems:"center", gap:3 }}>{Ic.time} {biz.deliveryTime||"30-45 min"}</span>
          <span>🕒 {biz.hours||"8am-8pm"}</span>
        </div>
        {biz.description && <p style={{ fontSize:13, color:"var(--muted)", marginBottom:14, lineHeight:1.5 }}>{biz.description}</p>}

        {/* Categorías principales */}
        {hasCategories && (
          <div style={{ overflowX:"auto", display:"flex", gap:7, marginBottom:8, scrollbarWidth:"none" }}>
            <button style={S.chip(mainCat==="Todos")} onClick={()=>{ setMainCat("Todos"); setSubcat("Todos"); }}>Todos</button>
            {Object.keys(bizCatMap).map(cat => (
              <button key={cat} style={S.chip(mainCat===cat)} onClick={()=>{ setMainCat(cat); setSubcat("Todos"); }}>{cat}</button>
            ))}
          </div>
        )}
        {/* Subcategorías */}
        {mainCat !== "Todos" && availableSubcats.length > 0 && (
          <div style={{ overflowX:"auto", display:"flex", gap:7, marginBottom:14, scrollbarWidth:"none" }}>
            <button style={{ ...S.chip(subcat==="Todos"), fontSize:11 }} onClick={()=>setSubcat("Todos")}>Todos</button>
            {availableSubcats.map(s => (
              <button key={s} style={{ ...S.chip(subcat===s), fontSize:11 }} onClick={()=>setSubcat(s)}>{s}</button>
            ))}
          </div>
        )}
        {!hasCategories && (
          <div style={{ overflowX:"auto", display:"flex", gap:7, marginBottom:14, scrollbarWidth:"none" }}>
            {["Todos", ...new Set(products.map(p=>p.category||"General"))].map(s => (
              <button key={s} style={S.chip(subcat===s)} onClick={()=>setSubcat(s)}>{s}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"40px 0" }}><Spinner/></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"50px 20px", color:"var(--muted)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🛍️</div>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>Sin productos aún</div>
            <p style={{ fontSize:13 }}>Este negocio aún no tiene productos cargados</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
            {filtered.map(prod => (
              <div key={prod.id} style={{ background:"var(--surface)", borderRadius:13, padding:11, display:"flex", gap:11, border:"1px solid var(--border)" }} className="fadeup">
                <img src={prod.image||"https://via.placeholder.com/78?text=Prod"} alt={prod.name} style={{ width:78, height:78, borderRadius:11, objectFit:"cover", flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{prod.name}</div>
                  {prod.description && <div style={{ color:"var(--muted)", fontSize:11, marginTop:2, lineHeight:1.3 }}>{prod.description}</div>}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}>
                    <div>
                      {prod.offer
                        ? <div style={{ display:"flex", gap:5, alignItems:"center" }}><span style={{ color:"var(--orange)", fontWeight:800, fontSize:14 }}>{fmt(prod.offerPrice)}</span><span style={{ color:"var(--muted)", fontSize:11, textDecoration:"line-through" }}>{fmt(prod.price)}</span></div>
                        : <span style={{ color:"var(--orange)", fontWeight:800, fontSize:14 }}>{fmt(prod.price)}</span>
                      }
                    </div>
                    <AddBtn product={prod} cart={cart} setCart={setCart} bizId={biz.id} bizName={biz.name}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CART PAGE ─────────────────────────────────────────────────────────────────
function CartPage({ cart, setCart, setPage }) {
  const [step, setStep] = useState("cart");
  const [form, setForm] = useState({ name:"", phone:"", address:"", barrio:"", notes:"" });
  const [gpsState, setGpsState] = useState("idle");
  const [clientPos, setClientPos] = useState(null);
  const [bizWhatsapp, setBizWhatsapp] = useState(null);
  const subtotal = cart.reduce((a,i)=>a+i.price*i.qty, 0);
  const bizId = cart[0]?.bizId || null;

  useEffect(() => {
    if (!bizId) return;
    db.collection("businesses").doc(bizId).get().then(doc => {
      if (doc.exists && doc.data().whatsapp) {
        setBizWhatsapp(doc.data().whatsapp);
      }
    });
  }, [bizId]);

  const getGPS = () => {
    setGpsState("loading");
    navigator.geolocation.getCurrentPosition(
      pos => { setClientPos({ lat:pos.coords.latitude, lng:pos.coords.longitude }); setGpsState("ok"); },
      ()   => setGpsState("error"),
      { enableHighAccuracy:true, timeout:10000 }
    );
  };

  const canSend = form.name && form.phone && form.address && form.barrio;

  const sendWhatsApp = () => {
    if (!canSend) return;
    const items = cart.map(i=>`• ${i.name} x${i.qty} — ${fmt(i.price*i.qty)}`).join("\n");
    const mapsLink = clientPos ? `\n📍 *Ubicación:* https://maps.google.com/?q=${clientPos.lat},${clientPos.lng}` : "";
    const msg = `🛵 *Pedido KIVO*\n\n*Cliente:* ${form.name}\n*Tel:* ${form.phone}\n*Dir:* ${form.address}\n*Barrio:* ${form.barrio}${mapsLink}${form.notes?`\n*Notas:* ${form.notes}`:""}\n\n${items}\n\n*TOTAL:* ${fmt(subtotal)}`;
    const waNumber = bizWhatsapp || ADMIN_WHATSAPP;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
    setCart([]);
    setStep("success");
  };

  if (step==="success") return (
    <div style={{ ...S.page, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, minHeight:"70vh" }}>
      <div style={{ fontSize:72 }}>🎉</div>
      <h2 style={{ fontWeight:800, fontSize:22, marginTop:18, marginBottom:8 }}>¡Pedido enviado!</h2>
      <p style={{ color:"var(--muted)", textAlign:"center", fontSize:14, lineHeight:1.6 }}>Tu pedido fue enviado por WhatsApp al negocio. Pronto recibirás confirmación.</p>
      <button onClick={()=>setPage({name:"home"})} style={{ ...S.btnPrimary, marginTop:26, maxWidth:240 }}>Volver al inicio</button>
    </div>
  );

  if (step==="checkout") return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <button onClick={()=>setStep("cart")} style={{ background:"none", color:"var(--text)", padding:0 }}>{Ic.back}</button>
          <h1 style={{ fontWeight:800, fontSize:18 }}>Datos del pedido</h1>
        </div>
      </div>
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:13 }}>

        {/* GPS opcional */}
        <div style={{ background:"var(--surface)", borderRadius:13, padding:"13px 15px", border:"1px solid var(--border)" }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>📍 Compartir ubicación <span style={{ fontWeight:400, color:"var(--muted)", fontSize:11 }}>(opcional)</span></div>
          <div style={{ fontSize:12, color:"var(--muted)", marginBottom:8 }}>Facilita la entrega al negocio</div>
          {gpsState==="idle" && (
            <button onClick={getGPS} style={{ ...S.btnOutline, fontSize:13, padding:"9px" }}>
              📡 Compartir mi ubicación
            </button>
          )}
          {gpsState==="loading" && (
            <div style={{ display:"flex", alignItems:"center", gap:10, color:"var(--muted)", fontSize:13 }}>
              <Spinner/> Obteniendo ubicación...
            </div>
          )}
          {gpsState==="ok" && (
            <div style={{ background:"#E8F5E9", borderRadius:10, padding:"10px 13px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ color:"var(--green)", fontWeight:700, fontSize:13 }}>✅ Ubicación compartida</div>
              <button onClick={getGPS} style={{ background:"none", color:"var(--green)", fontSize:12, fontWeight:600, padding:0 }}>🔄</button>
            </div>
          )}
          {gpsState==="error" && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ color:"#E65100", fontSize:12 }}>⚠️ No se pudo obtener ubicación</div>
              <button onClick={getGPS} style={{ background:"none", color:"var(--orange)", fontSize:12, fontWeight:600, padding:0 }}>Reintentar</button>
            </div>
          )}
        </div>

        {[{k:"name",l:"Nombre completo *",p:"Ej: Juan Pérez",t:"text"},{k:"phone",l:"Teléfono *",p:"3001234567",t:"tel"},{k:"address",l:"Dirección *",p:"Calle 7 # 4-20",t:"text"},{k:"barrio",l:"Barrio *",p:"Centro",t:"text"},{k:"notes",l:"Notas (opcional)",p:"Instrucciones especiales...",t:"text"}].map(f=>(
          <div key={f.k}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>{f.l}</label>
            <input type={f.t} placeholder={f.p} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={S.input}/>
          </div>
        ))}

        <div style={{ background:"var(--surface)", borderRadius:13, padding:"13px 15px", border:"1px solid var(--border)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:17 }}><span>TOTAL</span><span style={{ color:"var(--orange)" }}>{fmt(subtotal)}</span></div>
        </div>

        <button onClick={sendWhatsApp} disabled={!canSend}
          style={{ ...(canSend?S.btnGreen:{...S.btnGreen, background:"var(--surface)", color:"var(--muted)"}), cursor:canSend?"pointer":"default" }}>
          {Ic.whatsapp} Confirmar por WhatsApp
        </button>
        {!canSend && <p style={{ textAlign:"center", fontSize:12, color:"var(--muted)" }}>Completa todos los campos para continuar</p>}
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <h1 style={{ fontWeight:800, fontSize:20 }}>🛒 Mi carrito</h1>
      </div>
      {cart.length===0 ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, minHeight:"60vh" }}>
          <div style={{ fontSize:60 }}>🛒</div>
          <h3 style={{ fontWeight:700, marginTop:14, marginBottom:7 }}>Tu carrito está vacío</h3>
          <p style={{ color:"var(--muted)", fontSize:14 }}>Agrega productos para continuar</p>
          <button onClick={()=>setPage({name:"home"})} style={{ ...S.btnPrimary, marginTop:22, maxWidth:210 }}>Ver negocios</button>
        </div>
      ) : (
        <div style={{ padding:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:11, marginBottom:14 }}>
            {cart.map(item => (
              <div key={item.id} style={{ background:"var(--surface)", borderRadius:13, padding:11, display:"flex", gap:11, border:"1px solid var(--border)" }}>
                <img src={item.image||"https://via.placeholder.com/62"} alt={item.name} style={{ width:62, height:62, borderRadius:10, objectFit:"cover", flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{item.name}</div>
                  <div style={{ color:"var(--orange)", fontWeight:700, fontSize:13, marginTop:3 }}>{fmt(item.price*item.qty)}</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:7 }}>
                    <AddBtn product={item} cart={cart} setCart={setCart}/>
                    <button onClick={()=>setCart(p=>p.filter(i=>i.id!==item.id))} style={{ background:"none", color:"var(--red)", padding:0 }}>{Ic.trash}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:"#fff", borderRadius:14, padding:15, border:"1px solid var(--border)", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:17, borderTop:"1px solid var(--border)", paddingTop:11 }}><span>TOTAL</span><span style={{ color:"var(--orange)" }}>{fmt(subtotal)}</span></div>
          </div>
          <button onClick={()=>setStep("checkout")} style={S.btnPrimary}>Continuar al pedido →</button>
        </div>
      )}
    </div>
  );
}

// ── FAVORITES PAGE ────────────────────────────────────────────────────────────
function FavoritesPage({ favorites, setPage }) {
  const [favBiz, setFavBiz] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length===0) { setLoading(false); return; }
    Promise.all(favorites.map(id => db.collection("businesses").doc(id).get()))
      .then(docs => setFavBiz(docs.filter(d=>d.exists).map(d=>({id:d.id,...d.data()}))))
      .finally(()=>setLoading(false));
  }, [favorites.join(",")]);

  return (
    <div style={S.page}>
      <div style={S.topbar}><h1 style={{ fontWeight:800, fontSize:20 }}>❤️ Favoritos</h1></div>
      <div style={{ padding:16 }}>
        {loading ? <div style={{ display:"flex", justifyContent:"center", padding:"40px 0" }}><Spinner/></div>
        : favBiz.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--muted)" }}>
            <div style={{ fontSize:56, marginBottom:14 }}>💔</div>
            <div style={{ fontWeight:700, marginBottom:7 }}>Sin favoritos aún</div>
            <p style={{ fontSize:13 }}>Presiona ❤️ en cualquier negocio</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
            {favBiz.map(biz => (
              <div key={biz.id} style={{ ...S.card, cursor:"pointer" }} onClick={()=>setPage({name:"business",data:biz})}>
                <img loading="lazy" src={biz.image} alt={biz.name} style={{ width:"100%", height:110, objectFit:"cover" }}/>
                <div style={{ padding:"11px 13px" }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{biz.name}</div>
                  <StarRow rating={biz.rating} reviews={biz.reviews}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ACCOUNT PAGE ──────────────────────────────────────────────────────────────
function AccountPage({ setPage }) {
  const [mode, setMode] = useState("main");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  const register = async () => {
    if (!form.name || !form.email || !form.password) { setErr("Completa todos los campos"); return; }
    setLoading(true); setErr("");
    try {
      const cred = await auth.createUserWithEmailAndPassword(form.email, form.password);
      await cred.user.updateProfile({ displayName: form.name });
      await db.collection("users").doc(cred.user.uid).set({ name:form.name, email:form.email, createdAt:new Date() });
    } catch(e) { setErr(e.message); }
    setLoading(false);
  };

  const login = async () => {
    if (!form.email || !form.password) { setErr("Completa los campos"); return; }
    setLoading(true); setErr("");
    try { await auth.signInWithEmailAndPassword(form.email, form.password); }
    catch(e) { setErr("Correo o contraseña incorrectos"); }
    setLoading(false);
  };

  if (user) return (
    <div style={S.page}>
      <div style={S.topbar}><h1 style={{ fontWeight:800, fontSize:20 }}>👤 Mi cuenta</h1></div>
      <div style={{ padding:16 }}>
        <div style={{ background:"#fff", borderRadius:18, padding:18, border:"1px solid var(--border)", marginBottom:14, display:"flex", gap:13, alignItems:"center" }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#FF5722,#9B59B6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#fff" }}>
            {(user.displayName||user.email)?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:17 }}>{user.displayName||"Usuario"}</div>
            <div style={{ color:"var(--muted)", fontSize:12 }}>{user.email}</div>
          </div>
        </div>
        {[{e:"📦",l:"Mis pedidos"},{e:"❤️",l:"Favoritos"},{e:"📍",l:"Mis direcciones"},{e:"🔔",l:"Notificaciones"}].map(item=>(
          <div key={item.l} style={{ background:"#fff", borderRadius:13, padding:"13px 15px", border:"1px solid var(--border)", marginBottom:9, display:"flex", alignItems:"center", gap:11 }}>
            <span style={{ fontSize:18 }}>{item.e}</span>
            <span style={{ fontWeight:600 }}>{item.l}</span>
            <span style={{ marginLeft:"auto", color:"var(--muted)" }}>›</span>
          </div>
        ))}
        <button onClick={()=>auth.signOut()} style={{ ...S.btnOutline, width:"100%", marginTop:6, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {Ic.logout} Cerrar sesión
        </button>
      </div>
    </div>
  );

  if (mode==="register") return (
    <div style={S.page}>
      <div style={S.topbar}><div style={{ display:"flex", alignItems:"center", gap:11 }}><button onClick={()=>setMode("main")} style={{ background:"none", color:"var(--text)", padding:0 }}>{Ic.back}</button><h1 style={{ fontWeight:800, fontSize:18 }}>Crear cuenta</h1></div></div>
      <div style={{ padding:16 }}>
        {[{k:"name",l:"Nombre",p:"Tu nombre",t:"text"},{k:"email",l:"Correo",p:"correo@ejemplo.com",t:"email"},{k:"password",l:"Contraseña",p:"••••••",t:"password"}].map(f=>(
          <div key={f.k} style={{ marginBottom:13 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>{f.l}</label>
            <input type={f.t} placeholder={f.p} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={S.input}/>
          </div>
        ))}
        {err && <p style={{ color:"var(--red)", fontSize:12, marginBottom:11 }}>{err}</p>}
        <button onClick={register} style={S.btnPrimary} disabled={loading}>{loading?<Spinner/>:"Crear cuenta"}</button>
        <p style={{ textAlign:"center", color:"var(--muted)", fontSize:13, marginTop:13 }}>¿Ya tienes cuenta? <button onClick={()=>setMode("login")} style={{ background:"none", color:"var(--orange)", fontWeight:700, padding:0 }}>Inicia sesión</button></p>
      </div>
    </div>
  );

  if (mode==="login") return (
    <div style={S.page}>
      <div style={S.topbar}><div style={{ display:"flex", alignItems:"center", gap:11 }}><button onClick={()=>setMode("main")} style={{ background:"none", color:"var(--text)", padding:0 }}>{Ic.back}</button><h1 style={{ fontWeight:800, fontSize:18 }}>Iniciar sesión</h1></div></div>
      <div style={{ padding:16 }}>
        {[{k:"email",l:"Correo",p:"correo@ejemplo.com",t:"email"},{k:"password",l:"Contraseña",p:"••••••",t:"password"}].map(f=>(
          <div key={f.k} style={{ marginBottom:13 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>{f.l}</label>
            <input type={f.t} placeholder={f.p} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={S.input}/>
          </div>
        ))}
        {err && <p style={{ color:"var(--red)", fontSize:12, marginBottom:11 }}>{err}</p>}
        <button onClick={login} style={S.btnPrimary} disabled={loading}>{loading?<Spinner/>:"Entrar"}</button>
        <p style={{ textAlign:"center", color:"var(--muted)", fontSize:13, marginTop:13 }}>¿No tienes cuenta? <button onClick={()=>setMode("register")} style={{ background:"none", color:"var(--orange)", fontWeight:700, padding:0 }}>Regístrate</button></p>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.topbar}><h1 style={{ fontWeight:800, fontSize:20 }}>👤 Mi cuenta</h1></div>
      <div style={{ padding:32, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
        <div style={{ fontSize:68, marginBottom:14 }}>🛵</div>
        <h2 style={{ fontWeight:800, fontSize:21, marginBottom:7 }}>Bienvenido a KIVO</h2>
        <p style={{ color:"var(--muted)", fontSize:14, marginBottom:26, lineHeight:1.6 }}>Crea una cuenta para guardar favoritos y pedir más rápido.</p>
        <button onClick={()=>setMode("register")} style={{ ...S.btnPrimary, marginBottom:11 }}>Crear cuenta gratis</button>
        <button onClick={()=>setMode("login")} style={{ ...S.btnOutline, width:"100%" }}>Ya tengo cuenta</button>
      </div>
    </div>
  );
}

// ── ADMIN PAGE ────────────────────────────────────────────────────────────────
function AdminPage({ setPage }) {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | addBiz | editBiz | products | banners
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [imgUploading, setImgUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { auth.onAuthStateChanged(u=>setUser(u)); }, []);

  useEffect(() => {
    const unsub = db.collection("businesses").onSnapshot(snap=>{
      setBusinesses(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    });
    return unsub;
  }, []);

  const uploadImg = async (file, field) => {
    setImgUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(p=>({...p,[field]:url}));
      setMsg("✅ Imagen subida");
    } catch(e) { setMsg("❌ Error: "+e.message); }
    setImgUploading(false);
  };

  const saveBusiness = async () => {
    if (!form.name) { setMsg("❌ El nombre es obligatorio"); return; }
    setSaving(true);
    try {
      const data = {
        name: form.name||"",
        description: form.description||"",
        category: form.category||"supermarkets",
        deliveryTime: form.deliveryTime||"30-45 min",
        whatsapp: form.whatsapp||"",
        hours: form.hours||"8am-8pm",
        image: form.image||"",
        logo: form.logo||"",
        plan: form.plan||"basico",
        featured: form.featured||false,
        active: form.active!==false,
        order: Number(form.order)||99,
        rating: Number(form.rating)||0,
        reviews: Number(form.reviews)||0,
        updatedAt: new Date(),
      };
      if (selected?.id) {
        await db.collection("businesses").doc(selected.id).update(data);
        setMsg("✅ Negocio actualizado");
      } else {
        data.createdAt = new Date();
        await db.collection("businesses").add(data);
        setMsg("✅ Negocio creado");
      }
      setView("list");
    } catch(e) { setMsg("❌ "+e.message); }
    setSaving(false);
  };

  const deleteBusiness = async (id) => {
    if (!window.confirm("¿Eliminar este negocio?")) return;
    await db.collection("businesses").doc(id).delete();
  };

  const toggleActive = async (biz) => {
    await db.collection("businesses").doc(biz.id).update({ active:!biz.active });
  };

  if (!user) return (
    <div style={{ padding:32, textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:14 }}>🔐</div>
      <h2 style={{ fontWeight:800, marginBottom:8 }}>Panel Admin</h2>
      <p style={{ color:"var(--muted)", fontSize:14 }}>Debes iniciar sesión para acceder</p>
      <button onClick={()=>setPage({name:"account"})} style={{ ...S.btnPrimary, marginTop:20, maxWidth:200 }}>Iniciar sesión</button>
    </div>
  );

  // ── Form negocio ──
  if (view==="addBiz" || view==="editBiz") return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <button onClick={()=>setView("list")} style={{ background:"none", color:"var(--text)", padding:0 }}>{Ic.back}</button>
          <h1 style={{ fontWeight:800, fontSize:17 }}>{view==="addBiz"?"Nuevo negocio":"Editar negocio"}</h1>
        </div>
      </div>
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:13 }}>
        {msg && <div style={{ background:msg.startsWith("✅")?"#E8F5E9":"#FFEBEE", padding:"10px 14px", borderRadius:10, fontSize:13, fontWeight:600 }}>{msg}</div>}

        {/* Fotos */}
        <div style={{ display:"flex", gap:12 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>Foto principal</label>
            {form.image && <img src={form.image} style={{ width:"100%", height:80, objectFit:"cover", borderRadius:10, marginTop:6, marginBottom:6 }}/>}
            <label style={{ display:"flex", alignItems:"center", gap:6, background:"var(--surface)", borderRadius:10, padding:"9px 12px", cursor:"pointer", fontSize:13, fontWeight:600, marginTop:6 }}>
              {Ic.upload} {imgUploading?"Subiendo...":"Subir foto"}
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>e.target.files[0]&&uploadImg(e.target.files[0],"image")}/>
            </label>
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>Logo</label>
            {form.logo && <img src={form.logo} style={{ width:"100%", height:80, objectFit:"cover", borderRadius:10, marginTop:6, marginBottom:6 }}/>}
            <label style={{ display:"flex", alignItems:"center", gap:6, background:"var(--surface)", borderRadius:10, padding:"9px 12px", cursor:"pointer", fontSize:13, fontWeight:600, marginTop:6 }}>
              {Ic.upload} {imgUploading?"Subiendo...":"Subir logo"}
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>e.target.files[0]&&uploadImg(e.target.files[0],"logo")}/>
            </label>
          </div>
        </div>

        {[{k:"name",l:"Nombre *",p:"Ej: Ara Mariquita"},{k:"description",l:"Descripción",p:"Descripción breve"},{k:"hours",l:"Horario",p:"7am - 9pm"},{k:"deliveryTime",l:"Tiempo de entrega",p:"30-45 min"},{k:"whatsapp",l:"WhatsApp del negocio *",p:"573001234567"}].map(f=>(
          <div key={f.k}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>{f.l}</label>
            <input placeholder={f.p} value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={S.input}/>
          </div>
        ))}

        <div style={{ display:"flex", gap:11 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>Orden</label>
            <input type="number" placeholder="1" value={form.order||""} onChange={e=>setForm(p=>({...p,order:e.target.value}))} style={S.input}/>
          </div>
        </div>



        <div>
          <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>Plan de membresía</label>
          <select value={form.plan||"basico"} onChange={e=>setForm(p=>({...p,plan:e.target.value}))} style={{ ...S.input, marginTop:6 }}>
            <option value="basico">🟢 Básico — $20.000/mes</option>
            <option value="destacado">⭐ Destacado — $50.000/mes</option>
            <option value="premium">👑 Premium — $100.000/mes</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>Categoría</label>
          <select value={form.category||"supermarkets"} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={{ ...S.input, marginTop:6 }}>
            <option value="supermarkets">🛒 Supermercado</option>
            <option value="restaurants">🍔 Restaurante</option>
            <option value="pharmacies">💊 Farmacia</option>
            <option value="bakeries">🥐 Panadería</option>
            <option value="stores">🏪 Tienda</option>
          </select>
        </div>

        <div style={{ display:"flex", gap:16 }}>
          <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:14, fontWeight:600 }}>
            <input type="checkbox" checked={form.active!==false} onChange={e=>setForm(p=>({...p,active:e.target.checked}))} style={{ width:16, height:16 }}/>
            Activo
          </label>
          <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:14, fontWeight:600 }}>
            <input type="checkbox" checked={!!form.featured} onChange={e=>setForm(p=>({...p,featured:e.target.checked}))} style={{ width:16, height:16 }}/>
            Destacado
          </label>
        </div>

        <button onClick={saveBusiness} style={S.btnPrimary} disabled={saving}>{saving?<Spinner/>:(view==="addBiz"?"Crear negocio":"Guardar cambios")}</button>

        {selected?.id && (
          <button onClick={()=>{ setSelected(selected); setView("products"); }} style={{ ...S.btnOutline, width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            🛍️ Gestionar productos
          </button>
        )}
      </div>
    </div>
  );

  // ── Productos ──
  if (view==="products") return (
    <ProductsAdmin biz={selected} onBack={()=>setView("list")}/>
  );

  if (view==="banners") return (
    <BannersAdmin onBack={()=>setView("list")}/>
  );

  // ── Lista de negocios ──
  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <h1 style={{ fontWeight:800, fontSize:20 }}>⚙️ Admin</h1>
          <div style={{ display:"flex", gap:7 }}>
            <button onClick={()=>setView("banners")}
              style={{ background:"#9B59B6", color:"#fff", borderRadius:10, padding:"7px 13px", fontSize:13, fontWeight:700, border:"none" }}>
              🖼️ Banners
            </button>
            <button onClick={()=>{ setForm({ active:true, category:"supermarkets", order:99 }); setSelected(null); setView("addBiz"); }}
              style={{ background:"var(--orange)", color:"#fff", borderRadius:10, padding:"7px 13px", fontSize:13, fontWeight:700, border:"none" }}>
              + Negocio
            </button>
          </div>
        </div>
      </div>
      <div style={{ padding:16 }}>
        {msg && <div style={{ background:"#E8F5E9", padding:"10px 14px", borderRadius:10, fontSize:13, fontWeight:600, marginBottom:12 }}>{msg}</div>}
        {loading ? <div style={{ display:"flex", justifyContent:"center", padding:"40px 0" }}><Spinner/></div>
        : businesses.map(biz => (
          <div key={biz.id} style={{ background:"#fff", borderRadius:13, padding:"12px 14px", border:"1px solid var(--border)", marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
            <img src={biz.logo||biz.image||"https://via.placeholder.com/44"} style={{ width:44, height:44, borderRadius:10, objectFit:"cover", flexShrink:0 }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{biz.name}</div>
              <div style={{ fontSize:11, color:biz.active?"var(--green)":"var(--red)", fontWeight:600 }}>{biz.active?"● Activo":"● Inactivo"}</div>
            </div>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button onClick={()=>toggleActive(biz)} style={{ background:"var(--surface)", borderRadius:8, padding:"6px 10px", fontSize:11, fontWeight:700, color:"var(--muted)", border:"1px solid var(--border)" }}>
                {biz.active?"Pausar":"Activar"}
              </button>
              <button onClick={()=>{ setSelected(biz); setForm({...biz}); setView("editBiz"); }}
                style={{ background:"var(--surface)", borderRadius:8, padding:"6px 8px", color:"var(--text)", border:"1px solid var(--border)", display:"flex", alignItems:"center" }}>
                {Ic.edit}
              </button>
              <button onClick={()=>{ setSelected(biz); setView("products"); }}
                style={{ background:"var(--orange)", borderRadius:8, padding:"6px 10px", fontSize:11, fontWeight:700, color:"#fff", border:"none" }}>
                🛍️
              </button>
              <button onClick={()=>deleteBusiness(biz.id)}
                style={{ background:"none", borderRadius:8, padding:"6px 8px", color:"var(--red)", border:"1px solid rgba(229,57,53,.3)", display:"flex", alignItems:"center" }}>
                {Ic.trash}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BANNERS ADMIN ─────────────────────────────────────────────────────────────
function BannersAdmin({ onBack }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [form, setForm] = useState({});
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const unsub = db.collection("banners").onSnapshot(snap => {
      const docs = snap.docs.map(d=>({id:d.id,...d.data()}));
      docs.sort((a,b)=>(a.order||0)-(b.order||0));
      setBanners(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  const uploadImg = async (file) => {
    setImgUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(p=>({...p,image:url}));
      setMsg("✅ Imagen subida");
    } catch(e) { setMsg("❌ "+e.message); }
    setImgUploading(false);
  };

  const saveBanner = async () => {
    if (!form.title) { setMsg("❌ El título es obligatorio"); return; }
    setSaving(true);
    try {
      const data = {
        title: form.title||"",
        subtitle: form.subtitle||"",
        highlight: form.highlight||"",
        emoji: form.emoji||"",
        btnText: form.btnText||"",
        gradient: form.gradient||"linear-gradient(135deg,#FF5722,#9B59B6)",
        image: form.image||"",
        order: Number(form.order)||99,
        active: form.active!==false,
        updatedAt: new Date(),
      };
      if (selected?.id) {
        await db.collection("banners").doc(selected.id).update(data);
      } else {
        data.createdAt = new Date();
        await db.collection("banners").add(data);
      }
      setMsg("✅ Banner guardado");
      setView("list");
    } catch(e) { setMsg("❌ "+e.message); }
    setSaving(false);
  };

  const deleteBanner = async (id) => {
    if (!window.confirm("¿Eliminar banner?")) return;
    await db.collection("banners").doc(id).delete();
  };

  const gradients = [
    { label:"Naranja", value:"linear-gradient(135deg,#FF5722,#FF8A65)" },
    { label:"Morado", value:"linear-gradient(135deg,#FF5722,#9B59B6)" },
    { label:"Verde", value:"linear-gradient(135deg,#00A67E,#00D4AA)" },
    { label:"Azul", value:"linear-gradient(135deg,#2196F3,#21CBF3)" },
    { label:"Rosa", value:"linear-gradient(135deg,#E91E63,#FF5722)" },
    { label:"Oscuro", value:"linear-gradient(135deg,#1A1A2E,#16213E)" },
  ];

  if (view==="form") return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <button onClick={()=>setView("list")} style={{ background:"none", color:"var(--text)", padding:0 }}>{Ic.back}</button>
          <h1 style={{ fontWeight:800, fontSize:17 }}>{selected?"Editar banner":"Nuevo banner"}</h1>
        </div>
      </div>
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:13 }}>
        {msg && <div style={{ background:msg.startsWith("✅")?"#E8F5E9":"#FFEBEE", padding:"10px 14px", borderRadius:10, fontSize:13, fontWeight:600 }}>{msg}</div>}

        {/* Preview */}
        <div style={{ borderRadius:16, background:form.image?"#000":form.gradient||"linear-gradient(135deg,#FF5722,#9B59B6)", overflow:"hidden", position:"relative", minHeight:100 }}>
          {form.image
            ? <><img src={form.image} style={{ width:"100%", height:120, objectFit:"cover" }}/><div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,rgba(0,0,0,.55),rgba(0,0,0,.1))" }}/></>
            : form.emoji && <div style={{ position:"absolute", right:-4, top:-4, fontSize:60, opacity:.18 }}>{form.emoji}</div>
          }
          <div style={{ position:"absolute", bottom:12, left:14 }}>
            {form.subtitle && <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,.75)" }}>{form.subtitle}</div>}
            <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{form.title||"Título del banner"}{form.highlight&&<><br/><span style={{ color:"#FFE082" }}>{form.highlight}</span></>}</div>
            {form.btnText && <div style={{ background:"#fff", color:"var(--orange)", borderRadius:8, padding:"4px 11px", fontSize:11, fontWeight:700, display:"inline-block", marginTop:7 }}>{form.btnText}</div>}
          </div>
        </div>

        {/* Imagen */}
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>Imagen de fondo (opcional)</label>
          <label style={{ display:"flex", alignItems:"center", gap:6, background:"var(--surface)", borderRadius:10, padding:"9px 12px", cursor:"pointer", fontSize:13, fontWeight:600, marginTop:6 }}>
            {Ic.upload} {imgUploading?"Subiendo...":"Subir imagen"}
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>e.target.files[0]&&uploadImg(e.target.files[0])}/>
          </label>
          {form.image && <button onClick={()=>setForm(p=>({...p,image:""}))} style={{ background:"none", color:"var(--red)", fontSize:12, marginTop:5, padding:0 }}>✕ Quitar imagen</button>}
        </div>

        {/* Color si no hay imagen */}
        {!form.image && (
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>Color de fondo</label>
            <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
              {gradients.map(g => (
                <button key={g.value} onClick={()=>setForm(p=>({...p,gradient:g.value}))}
                  style={{ width:36, height:36, borderRadius:10, background:g.value, border:form.gradient===g.value?"3px solid var(--text)":"3px solid transparent" }}/>
              ))}
            </div>
          </div>
        )}

        {[{k:"title",l:"Título *",p:"Ej: Primer domicilio"},{k:"highlight",l:"Texto destacado (amarillo)",p:"¡GRATIS!"},{k:"subtitle",l:"Subtítulo (arriba)",p:"OFERTA ESPECIAL"},{k:"btnText",l:"Texto del botón",p:"Pedir ahora"},{k:"emoji",l:"Emoji decorativo",p:"🛵"},{k:"order",l:"Orden",p:"1"}].map(f=>(
          <div key={f.k}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>{f.l}</label>
            <input placeholder={f.p} value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={S.input}/>
          </div>
        ))}

        <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:14, fontWeight:600 }}>
          <input type="checkbox" checked={form.active!==false} onChange={e=>setForm(p=>({...p,active:e.target.checked}))} style={{ width:16, height:16 }}/>
          Activo (visible en la app)
        </label>

        <button onClick={saveBanner} style={S.btnPrimary} disabled={saving}>{saving?<Spinner/>:"Guardar banner"}</button>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:11 }}>
            <button onClick={onBack} style={{ background:"none", color:"var(--text)", padding:0 }}>{Ic.back}</button>
            <h1 style={{ fontWeight:800, fontSize:17 }}>🖼️ Banners</h1>
          </div>
          <button onClick={()=>{ setSelected(null); setForm({ active:true, gradient:"linear-gradient(135deg,#FF5722,#9B59B6)", order:99 }); setView("form"); }}
            style={{ background:"#9B59B6", color:"#fff", borderRadius:10, padding:"7px 13px", fontSize:13, fontWeight:700, border:"none" }}>
            + Banner
          </button>
        </div>
      </div>
      <div style={{ padding:16 }}>
        {msg && <div style={{ background:"#E8F5E9", padding:"10px 14px", borderRadius:10, fontSize:13, fontWeight:600, marginBottom:12 }}>{msg}</div>}
        {loading ? <div style={{ display:"flex", justifyContent:"center", padding:"40px 0" }}><Spinner/></div>
        : banners.length===0 ? (
          <div style={{ textAlign:"center", padding:"50px 20px", color:"var(--muted)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🖼️</div>
            <div style={{ fontWeight:700, marginBottom:6 }}>Sin banners</div>
            <p style={{ fontSize:13 }}>Crea tu primer banner promocional</p>
          </div>
        ) : banners.map(b => (
          <div key={b.id} style={{ borderRadius:13, overflow:"hidden", border:"1px solid var(--border)", marginBottom:12 }}>
            <div style={{ background:b.image?"#000":b.gradient, position:"relative", height:70 }}>
              {b.image && <img src={b.image} style={{ width:"100%", height:70, objectFit:"cover" }}/>}
              <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.2)", display:"flex", alignItems:"center", padding:"0 14px" }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#fff" }}>{b.title}{b.highlight&&" — "}<span style={{ color:"#FFE082" }}>{b.highlight}</span></div>
              </div>
            </div>
            <div style={{ background:"#fff", padding:"9px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:b.active?"var(--green)":"var(--red)", fontWeight:600 }}>{b.active?"● Activo":"● Inactivo"} · Orden {b.order||99}</span>
              <div style={{ display:"flex", gap:7 }}>
                <button onClick={()=>{ setSelected(b); setForm({...b}); setView("form"); }}
                  style={{ background:"var(--surface)", borderRadius:8, padding:"5px 8px", color:"var(--text)", border:"1px solid var(--border)", display:"flex", alignItems:"center" }}>
                  {Ic.edit}
                </button>
                <button onClick={()=>deleteBanner(b.id)}
                  style={{ background:"none", borderRadius:8, padding:"5px 8px", color:"var(--red)", border:"1px solid rgba(229,57,53,.3)", display:"flex", alignItems:"center" }}>
                  {Ic.trash}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PRODUCTS ADMIN ────────────────────────────────────────────────────────────
function ProductsAdmin({ biz, onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [form, setForm] = useState({});
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const unsub = db.collection("businesses").doc(biz.id).collection("products")
      .onSnapshot(snap=>{
        setProducts(snap.docs.map(d=>({id:d.id,...d.data()})));
        setLoading(false);
      });
    return unsub;
  }, [biz.id]);

  const uploadImg = async (file) => {
    setImgUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(p=>({...p,image:url}));
      setMsg("✅ Imagen subida");
    } catch(e) { setMsg("❌ "+e.message); }
    setImgUploading(false);
  };

  const saveProduct = async () => {
    if (!form.name || !form.price) { setMsg("❌ Nombre y precio obligatorios"); return; }
    setSaving(true);
    try {
      const data = {
        name: form.name||"",
        description: form.description||"",
        category: form.category||"General",
        price: Number(form.price)||0,
        offerPrice: form.offer ? Number(form.offerPrice)||0 : null,
        offer: !!form.offer,
        image: form.image||"",
        active: form.active!==false,
        updatedAt: new Date(),
      };
      const ref = db.collection("businesses").doc(biz.id).collection("products");
      if (selected?.id) {
        await ref.doc(selected.id).update(data);
      } else {
        data.createdAt = new Date();
        await ref.add(data);
      }
      setMsg("✅ Producto guardado");
      setView("list");
    } catch(e) { setMsg("❌ "+e.message); }
    setSaving(false);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    await db.collection("businesses").doc(biz.id).collection("products").doc(id).delete();
  };

  if (view==="form") return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <button onClick={()=>setView("list")} style={{ background:"none", color:"var(--text)", padding:0 }}>{Ic.back}</button>
          <h1 style={{ fontWeight:800, fontSize:17 }}>{selected?"Editar producto":"Nuevo producto"}</h1>
        </div>
      </div>
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:13 }}>
        {msg && <div style={{ background:msg.startsWith("✅")?"#E8F5E9":"#FFEBEE", padding:"10px 14px", borderRadius:10, fontSize:13, fontWeight:600 }}>{msg}</div>}

        <div>
          <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>Foto del producto</label>
          {form.image && <img src={form.image} style={{ width:"100%", height:120, objectFit:"cover", borderRadius:11, marginTop:6, marginBottom:6 }}/>}
          <label style={{ display:"flex", alignItems:"center", gap:6, background:"var(--surface)", borderRadius:10, padding:"9px 12px", cursor:"pointer", fontSize:13, fontWeight:600, marginTop:6 }}>
            {Ic.upload} {imgUploading?"Subiendo...":"Subir foto"}
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>e.target.files[0]&&uploadImg(e.target.files[0])}/>
          </label>
        </div>

        {[{k:"name",l:"Nombre *",p:"Ej: Leche Alquería 1L"},{k:"description",l:"Descripción",p:"Descripción breve"}].map(f=>(
          <div key={f.k}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>{f.l}</label>
            <input placeholder={f.p} value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={S.input}/>
          </div>
        ))}

        {/* Subcategorías predefinidas + personalizada */}
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>Categoría</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:8, marginBottom:8 }}>
            {(() => {
              const catMap = {
                supermarkets: {
                  "Alimentos y Despensa": ["Condimentos","Enlatados y Envasados","Pasta","Granos, Azúcar y Panela","Harinas y Pre-mezclas","Margarinas y Aceites","Salsas y Aderezos","Huevos"],
                  "Aseo del Hogar": ["Accesorios de Limpieza","Cuidado de la Ropa","Cuidado de Superficies y Cocina","Cuidado del Aire","Desechables"],
                  "Aseo y Cuidado Personal": ["Afeitado","Cuidado Capilar","Cuidado Corporal","Cuidado Oral","Desodorantes","Jabonería","Papel Higiénico y Pañuelos"],
                  "Lácteos": ["Leches","Quesos","Yogures","Otros Derivados"],
                  "Mascotas": ["Alimentación Gatos","Alimentación Perros","Aseo de Mascotas"],
                  "Bebidas": ["Cervezas","Aguas","Bebidas Vegetales","Gaseosas","Isotónicas y Energizantes","Infusiones, Té, Cafés y Chocolates","Jugos, Refrescos y Néctares"],
                },
                restaurants:  { "Menú": ["Platos","Combos","Entradas","Desayunos","Postres","Bebidas"] },
                pharmacies:   { "Productos": ["Medicamentos","Belleza","Bebé","Vitaminas","Primeros Auxilios"] },
                bakeries:     { "Productos": ["Panes","Pasteles","Tortas","Desayunos","Bebidas"] },
                stores:       { "Productos": ["General","Ofertas","Más Vendido"] },
              };
              const bizCats = catMap[biz.category] || { "General": ["General","Otros"] };
              const selectedMainCat = form.mainCat || Object.keys(bizCats)[0];
              const subcats = bizCats[selectedMainCat] || [];
              return (
                <div style={{ width:"100%" }}>
                  {/* Categorías principales */}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                    {Object.keys(bizCats).map(cat => (
                      <button key={cat} type="button"
                        onClick={()=>setForm(p=>({...p,mainCat:cat,category:""}))}
                        style={{ padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:600, border:"1.5px solid", borderColor:selectedMainCat===cat?"var(--orange)":"var(--border)", background:selectedMainCat===cat?"var(--orange)":"var(--surface)", color:selectedMainCat===cat?"#fff":"var(--muted)" }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  {/* Subcategorías */}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {subcats.map(sub => (
                      <button key={sub} type="button"
                        onClick={()=>setForm(p=>({...p,category:sub,customCat:""}))}
                        style={{ padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:600, border:"1.5px solid", borderColor:form.category===sub?"#9B59B6":"var(--border)", background:form.category===sub?"#9B59B6":"var(--surface)", color:form.category===sub?"#fff":"var(--muted)" }}>
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
          <input placeholder="O escribe una subcategoría personalizada..." value={form.customCat||""} onChange={e=>setForm(p=>({...p,customCat:e.target.value,category:e.target.value||p.category}))} style={S.input}/>
        </div>

        <div style={{ display:"flex", gap:11 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>Precio *</label>
            <input type="number" placeholder="3900" value={form.price||""} onChange={e=>setForm(p=>({...p,price:e.target.value}))} style={S.input}/>
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>Precio oferta</label>
            <input type="number" placeholder="3500" value={form.offerPrice||""} onChange={e=>setForm(p=>({...p,offerPrice:e.target.value}))} style={S.input} disabled={!form.offer}/>
          </div>
        </div>

        <div style={{ display:"flex", gap:16 }}>
          <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:14, fontWeight:600 }}>
            <input type="checkbox" checked={!!form.offer} onChange={e=>setForm(p=>({...p,offer:e.target.checked}))} style={{ width:16, height:16 }}/>
            En oferta
          </label>
          <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:14, fontWeight:600 }}>
            <input type="checkbox" checked={form.active!==false} onChange={e=>setForm(p=>({...p,active:e.target.checked}))} style={{ width:16, height:16 }}/>
            Activo
          </label>
        </div>

        <button onClick={saveProduct} style={S.btnPrimary} disabled={saving}>{saving?<Spinner/>:"Guardar producto"}</button>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:11 }}>
            <button onClick={onBack} style={{ background:"none", color:"var(--text)", padding:0 }}>{Ic.back}</button>
            <h1 style={{ fontWeight:800, fontSize:17 }}>🛍️ {biz.name}</h1>
          </div>
          <button onClick={()=>{ setSelected(null); setForm({ active:true }); setView("form"); }}
            style={{ background:"var(--orange)", color:"#fff", borderRadius:10, padding:"7px 13px", fontSize:13, fontWeight:700, border:"none" }}>
            + Producto
          </button>
        </div>
      </div>
      <div style={{ padding:16 }}>
        {msg && <div style={{ background:"#E8F5E9", padding:"10px 14px", borderRadius:10, fontSize:13, fontWeight:600, marginBottom:12 }}>{msg}</div>}
        {loading ? <div style={{ display:"flex", justifyContent:"center", padding:"40px 0" }}><Spinner/></div>
        : products.length===0 ? (
          <div style={{ textAlign:"center", padding:"50px 20px", color:"var(--muted)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
            <div style={{ fontWeight:700, marginBottom:6 }}>Sin productos</div>
            <p style={{ fontSize:13 }}>Agrega el primer producto</p>
          </div>
        ) : products.map(prod => (
          <div key={prod.id} style={{ background:"#fff", borderRadius:12, padding:"11px 13px", border:"1px solid var(--border)", marginBottom:9, display:"flex", alignItems:"center", gap:11 }}>
            <img src={prod.image||"https://via.placeholder.com/44"} style={{ width:44, height:44, borderRadius:9, objectFit:"cover", flexShrink:0 }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{prod.name}</div>
              <div style={{ fontSize:11, color:"var(--orange)", fontWeight:700 }}>{fmt(prod.offerPrice||prod.price)}{prod.offer&&<span style={{ color:"var(--muted)", textDecoration:"line-through", marginLeft:5 }}>{fmt(prod.price)}</span>}</div>
            </div>
            <div style={{ display:"flex", gap:7, flexShrink:0 }}>
              <button onClick={()=>{ setSelected(prod); setForm({...prod}); setView("form"); }}
                style={{ background:"var(--surface)", borderRadius:8, padding:"6px 8px", color:"var(--text)", border:"1px solid var(--border)", display:"flex", alignItems:"center" }}>
                {Ic.edit}
              </button>
              <button onClick={()=>deleteProduct(prod.id)}
                style={{ background:"none", borderRadius:8, padding:"6px 8px", color:"var(--red)", border:"1px solid rgba(229,57,53,.3)", display:"flex", alignItems:"center" }}>
                {Ic.trash}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
function KivoApp() {
  const [page, setPage] = useState({ name:"home" });
  const [cart, setCart] = useLocalState("kivo_cart_v2", []);
  const [favorites, setFavorites] = useLocalState("kivo_favs_v2", []);
  const [tab, setTab] = useState("home");
  const [showAdmin, setShowAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setCurrentUser(u));
    return unsub;
  }, []);

  const isAdmin = currentUser?.uid === ADMIN_UID;

  const toggleFav = id => setFavorites(p => p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const cartCount = cart.reduce((a,i)=>a+i.qty, 0);

  const goTab = t => { setTab(t); setPage({name:t}); setShowAdmin(false); };

  const renderPage = () => {
    if (showAdmin) return isAdmin ? <AdminPage setPage={p=>{setPage(p);setShowAdmin(false);}}/> : <HomePage setPage={setPage} cart={cart} setCart={setCart} favorites={favorites} toggleFav={toggleFav}/>;
    switch(page.name) {
      case "home":      return <HomePage setPage={setPage} cart={cart} setCart={setCart} favorites={favorites} toggleFav={toggleFav}/>;
      case "business":  return <BusinessPage biz={page.data} setPage={setPage} cart={cart} setCart={setCart}/>;
      case "cart":      return <CartPage cart={cart} setCart={setCart} setPage={p=>{setPage(p);setTab(p.name||"home");}}/>;
      case "favorites": return <FavoritesPage favorites={favorites} setPage={p=>{setPage(p);setTab("home");}}/>;
      case "account":   return <AccountPage setPage={p=>{setPage(p);setTab(p.name||"home");}}/>;
      default:          return <HomePage setPage={setPage} cart={cart} setCart={setCart} favorites={favorites} toggleFav={toggleFav}/>;
    }
  };

  return (
    <div style={S.app}>
      {renderPage()}

      {cartCount>0 && page.name!=="cart" && !showAdmin && (
        <button style={S.cartFab} onClick={()=>{setPage({name:"cart"});setTab("cart");}}>
          <span style={{ position:"relative" }}>
            {Ic.cart}
            <Badge n={cartCount}/>
          </span>
        </button>
      )}

      <nav style={S.nav}>
        {[
          { id:"home",      icon:Ic.home,     label:"Inicio" },
          { id:"cart",      icon:Ic.cart,     label:"Carrito", badge:cartCount },
          { id:"favorites", icon:Ic.heart,    label:"Favoritos", badge:favorites.length },
          { id:"account",   icon:Ic.user,     label:"Cuenta" },
          ...(isAdmin ? [{ id:"admin", icon:Ic.settings, label:"Admin" }] : []),
        ].map(item => (
          <button key={item.id}
            style={S.navBtn((item.id==="admin"?showAdmin:tab===item.id||page.name===item.id))}
            onClick={()=>item.id==="admin"?setShowAdmin(p=>!p):goTab(item.id)}>
            <span style={{ position:"relative" }}>
              {item.icon}
              {item.badge>0 && <Badge n={item.badge}/>}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}


// Ocultar splash cuando React termina de montar
requestAnimationFrame(() => {
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) { splash.classList.add("hide"); setTimeout(()=>splash.remove(), 450); }
  }, 300);
});

export default KivoApp;
