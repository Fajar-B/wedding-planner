import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

/* ── KONFIGURASI SUPABASE ────────────────────────── */
// GANTI DENGAN URL DAN ANON KEY DARI PROJECT SUPABASE ANDA
const SUPABASE_URL = "https://rpqkfkrtmxhjnufwuotv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwcWtma3J0bXhoam51Znd1b3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5Mjc4MzAsImV4cCI6MjEwMTUwMzgzMH0.xLoympkxRmkWYSA7cYEM9Wp7h9cURSuU_OkquTDbumI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── PALETTE: RADICAL ELEGANCE ────────────────────── */
const P = {
  em: "#7A1B29",    // Marun Utama
  em2: "#4A0E1B",   // Marun Gelap (untuk teks tebal/header)
  em3: "#9C2740",   // Marun Terang (untuk aksen)
  gold: "#D4AF37",  // Emas Elegan
  goldL: "#FDFBF5", // Emas super pudar (background card tipis)
  goldD: "#997A15", // Emas Gelap (teks)
  cream: "#FBF9F6", // Offwhite (Background utama)
  white: "#FFFFFF",
};

// Shadow kustom untuk kesan "mengambang" premium
const S = {
  soft: "0 12px 40px rgba(122, 27, 41, 0.05)",
  glow: "0 8px 24px rgba(212, 175, 55, 0.15)",
};

const SC = {
  Belum:            ["#FDF8F8","#991B1B"],
  Proses:           ["#FFFBEB","#92400E"],
  Selesai:          ["#F0FDF4","#065F46"],
  "Belum Bayar":    ["#FDF8F8","#991B1B"],
  "DP/Sebagian":    ["#FFFBEB","#92400E"],
  Lunas:            ["#F0FDF4","#065F46"],
  "Belum Booking":  ["#FDF8F8","#991B1B"],
  "DP Terbayar":    ["#FFFBEB","#92400E"],
  "Sudah Booking":  ["#F0FDF4","#065F46"],
  "Belum Konfirmasi":["#FFFBEB","#92400E"],
  Hadir:            ["#F0FDF4","#065F46"],
  "Tidak Hadir":    ["#FDF8F8","#991B1B"],
};

/* ── UTILS ───────────────────────────────────────── */
const fmtRp = n => "Rp\u00A0" + (Number(n)||0).toLocaleString("id-ID");
let _k = 9000; const nid = () => ++_k;

/* ── INITIAL DATA (Sama seperti sebelumnya) ──────── */
const D0_INFO = {
  namaPria:"", namaWanita:"", tanggal:"", waktu:"",
  masjid:"", alamat:"", wali:"", penghulu:"", mahar:"", tema:"",
};

const D0_CL = [
  {id:1, waktu:"H-12 Bulan", tugas:"Tentukan tanggal akad & survei ketersediaan masjid", pic:"Kedua Keluarga", status:"Belum", catatan:""},
  {id:2, waktu:"H-10 Bulan", tugas:"Tentukan anggaran total & sumber dana", pic:"Kedua Keluarga", status:"Proses", catatan:""},
];
const D0_ANG = [{id:1, kategori:"Sewa & Donasi Masjid", estimasi:5000000, aktual:0, statusBayar:"Belum Bayar", catatan:""}];
const D0_VND = [{id:1, kategori:"Dekorasi", nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""}];
const D0_RD = [{id:1, waktu:"07.00", acara:"Kedatangan mempelai", pic:"Keluarga", catatan:""}];

/* ── SHARED MICRO-COMPONENTS ──────────────────────── */
const Badge = ({v}) => {
  const [bg, tx] = SC[v] || ["#E5E7EB","#374151"];
  return <span style={{background:bg,color:tx,fontSize:10,fontWeight:600,padding:"4px 10px",borderRadius:6,whiteSpace:"nowrap",display:"inline-block", letterSpacing:".02em"}}>{v}</span>;
};

// Card dirombak: Tanpa border keras, menggunakan radius besar dan bayangan lembut
const Card = ({children,style={}}) => (
  <div style={{background:P.white,borderRadius:24,boxShadow:S.soft,overflow:"hidden",...style}}>{children}</div>
);

const SectionHeader = ({title,onAdd,addLabel="+ Tambah"}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16, marginTop:8}}>
    <h3 style={{fontSize:16,fontWeight:500,color:P.em2,margin:0, fontFamily:"Georgia, serif", letterSpacing:".02em"}}>{title}</h3>
    {onAdd && (
      <button onClick={onAdd} style={{background:P.gold,color:P.white,border:"none",borderRadius:99,padding:"6px 16px",fontSize:11,fontWeight:600,cursor:"pointer",boxShadow:S.glow, transition:"transform 0.2s"}}>
        {addLabel}
      </button>
    )}
  </div>
);

const ActionBtns = ({onEdit,onDelete}) => (
  <div style={{display:"flex",gap:6,flexShrink:0, opacity:0.8}}>
    <button onClick={onEdit} style={{width:32,height:32,background:P.cream,color:P.em2,border:"none",borderRadius:10,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
    <button onClick={onDelete} style={{width:32,height:32,background:"#FFF5F5",color:"#991B1B",border:"none",borderRadius:10,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
  </div>
);

const inp = {width:"100%",border:"none",borderBottom:`1px solid ${P.gold}`,borderRadius:0,padding:"10px 4px",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"transparent", color:P.em2, transition:"border-color 0.3s"};

const Fld = ({label,children}) => (
  <div style={{marginBottom:20}}>
    <label style={{display:"block",fontSize:10,fontWeight:600,color:P.goldD,marginBottom:4,textTransform:"uppercase",letterSpacing:".1em"}}>{label}</label>
    {children}
  </div>
);

/* ── MODAL ───────────────────────────────────────────────────── */
function Modal({open,title,onClose,onSave,children}) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(74, 14, 27, 0.4)",backdropFilter:"blur(8px)"}} />
      <div onClick={e=>e.stopPropagation()}
        style={{position:"relative",width:"100%",maxWidth:480,background:P.cream,borderRadius:"32px 32px 0 0",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 -20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{color:P.em2,fontWeight:600,fontSize:18,fontFamily:"Georgia, serif"}}>{title}</span>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:P.em2,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"0 24px 24px"}}>{children}</div>
        {onSave && (
          <div style={{padding:"20px 24px",background:P.white,display:"flex",gap:12, borderRadius:"0 0 0 0"}}>
            <button onClick={onClose} style={{flex:1,padding:"14px 0",border:"none",borderRadius:16,fontSize:13,fontWeight:600,cursor:"pointer",background:P.cream,color:P.em2}}>Batal</button>
            <button onClick={onSave} style={{flex:2,padding:"14px 0",border:"none",borderRadius:16,fontSize:13,fontWeight:600,cursor:"pointer",background:P.em,color:P.white,boxShadow:S.soft}}>Simpan</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── BERANDA ──────────────────────────────────────── */
function Beranda({info,setInfo}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(info);
  const fields = [
    ["tanggal","Hari & Tanggal Akad"],["waktu","Waktu Akad"],
    ["masjid","Nama Masjid"],["alamat","Alamat Masjid"],
    ["wali","Wali Nikah"],["penghulu","Petugas KUA"],
    ["mahar","Mas Kawin"],["tema","Tema Pernikahan"],
  ];
  const save = () => { setInfo(f); setOpen(false); };
  const open_ = () => { setF(info); setOpen(true); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {/* Hero Kelas Atas: Desain bak undangan cetak */}
      <Card style={{background:P.white, padding:"40px 24px", textAlign:"center", position:"relative"}}>
        <div style={{position:"absolute", top:12, left:12, right:12, bottom:12, border:`1px solid ${P.goldL}`, borderRadius:16, pointerEvents:"none"}} />
        <p style={{color:P.goldD,fontSize:10,letterSpacing:".25em",textTransform:"uppercase",margin:"0 0 16px",fontWeight:600}}>Walimatul &lsquo;Urs</p>
        
        <h2 style={{color:P.em2,fontSize:28,fontWeight:400,margin:"0 0 8px",fontFamily:"Georgia,serif", letterSpacing:".02em"}}>{info.namaPria||"Nama Pria"}</h2>
        <span style={{display:"inline-block", width:30, height:1, background:P.gold, margin:"8px 0"}} />
        <h2 style={{color:P.em2,fontSize:28,fontWeight:400,margin:"8px 0 24px",fontFamily:"Georgia,serif", letterSpacing:".02em"}}>{info.namaWanita||"Nama Wanita"}</h2>
        
        {info.tanggal && <p style={{color:P.em,fontSize:12,margin:"0 0 4px",fontWeight:500, letterSpacing:".05em"}}>{info.tanggal.toUpperCase()}</p>}
        {info.masjid  && <p style={{color:"#6B7280",fontSize:11,margin:0}}>{info.masjid}</p>}
        
        <button onClick={open_} style={{marginTop:24,background:"transparent",color:P.goldD,border:`1px solid ${P.gold}`,borderRadius:99,padding:"8px 20px",fontSize:11,fontWeight:600,cursor:"pointer", letterSpacing:".05em", textTransform:"uppercase"}}>Lengkapi Profil</button>
      </Card>

      <div>
        <SectionHeader title="Detail Penyelenggaraan" />
        <Card style={{padding:"8px 16px"}}>
          {fields.map(([k,lbl], idx) => (
            <div key={k} style={{display:"flex",flexDirection:"column",padding:"12px 0",borderBottom:idx<fields.length-1?`1px solid ${P.cream}`:"none"}}>
              <span style={{fontSize:10,color:"#9CA3AF", textTransform:"uppercase", letterSpacing:".05em", marginBottom:4}}>{lbl}</span>
              <span style={{fontSize:14,color:info[k]?P.em2:"#D1D5DB", fontFamily:info[k]?"Georgia, serif":"inherit", fontStyle:info[k]?"normal":"italic"}}>{info[k]||"Belum ditentukan"}</span>
            </div>
          ))}
        </Card>
      </div>

      <Modal open={open} title="Profil Pernikahan" onClose={()=>setOpen(false)} onSave={save}>
        <Fld label="Nama Mempelai Pria"><input style={inp} value={f.namaPria||""} onChange={e=>setF({...f,namaPria:e.target.value})} /></Fld>
        <Fld label="Nama Mempelai Wanita"><input style={inp} value={f.namaWanita||""} onChange={e=>setF({...f,namaWanita:e.target.value})} /></Fld>
        {fields.map(([k,lbl])=>(
          <Fld key={k} label={lbl}><input style={inp} value={f[k]||""} onChange={e=>setF({...f,[k]:e.target.value})} /></Fld>
        ))}
      </Modal>
    </div>
  );
}

/* ── CHECKLIST (Didesain ulang menjadi garis waktu elegan) ── */
function Checklist({data,setData}) {
  const done = data.filter(i=>i.status==="Selesai").length;
  const pct  = data.length ? Math.round(done/data.length*100) : 0;
  const groups = data.reduce((g,i)=>{ (g[i.waktu]=g[i.waktu]||[]).push(i); return g; },{});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div style={{textAlign:"center", padding:"10px 0"}}>
        <p style={{fontSize:48, fontWeight:400, fontFamily:"Georgia, serif", color:P.em2, margin:"0 0 4px"}}>{pct}<span style={{fontSize:20, color:P.gold}}>%</span></p>
        <p style={{fontSize:10, color:"#6B7280", letterSpacing:".1em", textTransform:"uppercase", margin:0}}>Persiapan Selesai</p>
      </div>

      <div>
        <SectionHeader title="Agenda & Tugas" />
        <Card style={{padding:20}}>
          {Object.entries(groups).map(([waktu,items], gIdx)=>(
            <div key={waktu} style={{marginBottom:gIdx<Object.keys(groups).length-1?24:0}}>
              <p style={{fontSize:11,fontWeight:600,color:P.goldD,margin:"0 0 12px",textTransform:"uppercase",letterSpacing:".1em", borderBottom:`1px solid ${P.cream}`, paddingBottom:8}}>{waktu}</p>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {items.map((item)=>(
                  <div key={item.id} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${item.status==="Selesai"?P.gold:P.cream}`,background:item.status==="Selesai"?P.gold:"transparent",marginTop:2,flexShrink:0}} />
                    <div style={{flex:1}}>
                      <p style={{margin:"0 0 6px",fontSize:13,color:item.status==="Selesai"?"#9CA3AF":P.em2,textDecoration:item.status==="Selesai"?"line-through":"none", lineHeight:1.4}}>{item.tugas}</p>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <Badge v={item.status} />
                        {item.pic && <span style={{fontSize:11,color:"#9CA3AF"}}>• {item.pic}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ── ANGGARAN (Fokus pada visualisasi angka besar) ── */
function Anggaran({data,setData}) {
  const totEst = data.reduce((s,i)=>s+(Number(i.estimasi)||0),0);
  const totAkt = data.reduce((s,i)=>s+(Number(i.aktual)||0),0);
  
  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <Card style={{background:`linear-gradient(135deg, ${P.em2}, ${P.em})`, color:P.white, padding:32, textAlign:"center"}}>
        <p style={{fontSize:10, color:P.gold, letterSpacing:".15em", textTransform:"uppercase", margin:"0 0 8px"}}>Total Aktual</p>
        <p style={{fontSize:32, fontFamily:"Georgia, serif", margin:"0 0 16px"}}>{fmtRp(totAkt)}</p>
        <div style={{background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"12px", display:"inline-block"}}>
          <p style={{fontSize:10, color:"rgba(255,255,255,0.7)", margin:"0 0 4px", letterSpacing:".05em"}}>ESTIMASI BIAYA</p>
          <p style={{fontSize:14, fontWeight:600, margin:0}}>{fmtRp(totEst)}</p>
        </div>
      </Card>

      <div>
        <SectionHeader title="Distribusi Anggaran" />
        <Card style={{padding:8}}>
          {data.map((item,idx)=>(
            <div key={item.id} style={{padding:"16px",borderBottom:idx<data.length-1?`1px solid ${P.cream}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                <p style={{margin:0,fontSize:14,color:P.em2, fontWeight:500}}>{item.kategori}</p>
                <Badge v={item.statusBayar} />
              </div>
              <div style={{display:"flex",justifyContent:"space-between", fontSize:12}}>
                <span style={{color:"#9CA3AF"}}>Aktual: <strong style={{color:P.em2}}>{fmtRp(item.aktual)}</strong></span>
                <span style={{color:"#D1D5DB"}}>Est: {fmtRp(item.estimasi)}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ── TABS CONFIG ───────────────────────────────────── */
const TABS = [
  {id:"beranda",  icon:"✧", label:"Beranda"},
  {id:"checklist",icon:"✓", label:"Agenda"},
  {id:"anggaran", icon:"Rp", label:"Dana"},
];

/* ── MAIN APP (Dengan Floating Nav) ────────────────── */
export default function App() {
  const [tab,  setTab]  = useState("beranda");
  const [info, setInfo] = useState(D0_INFO);
  const [cl,   setCl]   = useState(D0_CL);
  const [ang,  setAng]  = useState(D0_ANG);

  const section = ()=>{
    switch(tab){
      case "beranda":   return <Beranda  info={info}  setInfo={setInfo} />;
      case "checklist": return <Checklist data={cl}   setData={setCl}   />;
      case "anggaran":  return <Anggaran  data={ang}  setData={setAng}  />;
      default: return null;
    }
  };

  return (
    <div style={{minHeight:"100vh",background:P.cream,fontFamily:"'Inter', system-ui, -apple-system, sans-serif", paddingBottom:100}}>
      {/* Header Minimalis */}
      <div style={{padding:"24px 20px 12px", display:"flex", justifyContent:"center"}}>
        <span style={{fontFamily:"Georgia, serif", fontSize:18, color:P.em2, letterSpacing:".05em", fontWeight:500}}>W & 'U</span>
      </div>

      {/* Konten Utama */}
      <div style={{maxWidth:480,margin:"0 auto",padding:"0 20px"}}>
        {section()}
      </div>

      {/* Navigasi Mengambang (Floating Segmented Control) */}
      <div style={{position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)", zIndex:90, background:"rgba(253, 251, 245, 0.8)", backdropFilter:"blur(12px)", padding:"6px", borderRadius:99, display:"flex", gap:4, boxShadow:"0 20px 40px rgba(74, 14, 27, 0.15), 0 1px 3px rgba(0,0,0,0.05)", border:`1px solid ${P.white}`}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            display:"flex",alignItems:"center",gap:6,padding:"10px 20px",
            borderRadius:99,border:"none",cursor:"pointer",
            fontSize:12,fontWeight:600, transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            background: tab===t.id ? P.em2 : "transparent",
            color: tab===t.id ? P.goldL : "#9CA3AF",
            letterSpacing:".02em"
          }}>
            <span style={{fontFamily:tab===t.id?"Georgia, serif":"inherit", fontSize:14}}>{t.icon}</span>
            <span style={{display:tab===t.id?"block":"none"}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
