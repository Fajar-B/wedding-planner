import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

/* ── KONFIGURASI SUPABASE ────────────────────────── */
// GANTI DENGAN URL DAN ANON KEY DARI PROJECT SUPABASE ANDA
const SUPABASE_URL = "https://rpqkfkrtmxhjnufwuotv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwcWtma3J0bXhoam51Znd1b3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5Mjc4MzAsImV4cCI6MjEwMTUwMzgzMH0.xLoympkxRmkWYSA7cYEM9Wp7h9cURSuU_OkquTDbumI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── AUDIO PLAYER COMPONENT ──────────────────────── */
const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <audio 
        ref={audioRef} 
        src="/audio-wedding.mp3" 
        loop 
      />
      
      <button 
        className="audio-btn"
        onClick={toggleAudio}
        title={isPlaying ? "Jeda Musik" : "Putar Musik"}
      >
        {isPlaying ? "⏸" : "🎵"}
      </button>
    </>
  );
};

/* ── PALETTE (Tema Marun & Emas) ─────────────────── */
const P = {
  em: "#7A1B29",    
  em2: "#4A0E1B",   
  em3: "#9C2740",   
  gold: "#D4AF37",  
  goldL: "#F5EEDC", 
  goldD: "#997A15", 
  cream: "#FBF9F6", 
  border: "#E8E2D9",
  white: "#FFFFFF",
};

const SC = {
  Belum:            ["#FEE2E2","#991B1B"],
  Proses:           ["#FEF3C7","#92400E"],
  Selesai:          ["#D1FAE5","#065F46"],
  "Belum Bayar":    ["#FEE2E2","#991B1B"],
  "DP/Sebagian":    ["#FEF3C7","#92400E"],
  Lunas:            ["#D1FAE5","#065F46"],
  "Belum Booking":  ["#FEE2E2","#991B1B"],
  "DP Terbayar":    ["#FEF3C7","#92400E"],
  "Sudah Booking":  ["#D1FAE5","#065F46"],
  "Belum Konfirmasi":["#FEF3C7","#92400E"],
  Hadir:            ["#D1FAE5","#065F46"],
  "Tidak Hadir":    ["#FEE2E2","#991B1B"],
};

/* ── UTILS & LOGIC ───────────────────────────────── */
const fmtRp = n => "Rp\u00A0" + (Number(n)||0).toLocaleString("id-ID");
let _k = 9000; const nid = () => ++_k;

const formatTanggal = (tgl) => {
  if (!tgl) return "";
  try {
    const d = new Date(tgl);
    if (isNaN(d)) return tgl;
    return d.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return tgl;
  }
};

const useCountdown = (targetDate, waktu) => {
  const [timeLeft, setTimeLeft] = useState({ months: 0, days: 0, hours: 0, isPast: false, error: false });

  useEffect(() => {
    if (!targetDate) return;
    let safeTime = "08:00:00"; 
    if (waktu) {
      const match = waktu.match(/(\d{1,2})[\.:\-](\d{2})/);
      if (match) {
        safeTime = `${match[1].padStart(2, '0')}:${match[2]}:00`;
      }
    }
    let target;
    const isISO = /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim());
    if (isISO) {
        target = new Date(`${targetDate.trim()}T${safeTime}`);
    } else {
        target = new Date(`${targetDate} ${safeTime}`); 
    }
    if (isNaN(target.getTime())) {
      setTimeLeft(prev => ({ ...prev, error: true }));
      return;
    }
    const timer = setInterval(() => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ months: 0, days: 0, hours: 0, isPast: true, error: false });
        clearInterval(timer);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      setTimeLeft({ months, days: remainingDays, hours, isPast: false, error: false });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, waktu]);
  return timeLeft;
};

/* ── INITIAL DATA UTUH ─────────────────────────────────── */
const D0_INFO = {
  namaPria:"", namaWanita:"", tanggal:"", waktu:"",
  masjid:"", alamat:"", wali:"", penghulu:"", mahar:"", tema:"",
};

const D0_CL = [
  {id:1,  waktu:"H-12 Bulan", tugas:"Tentukan tanggal akad & survei ketersediaan masjid",       pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:2,  waktu:"H-12 Bulan", tugas:"Ajukan izin & jadwal akad ke pengurus/takmir masjid",      pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:3,  waktu:"H-10 Bulan", tugas:"Tentukan anggaran total & sumber dana",                    pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:4,  waktu:"H-10 Bulan", tugas:"Buat daftar tamu undangan awal",                           pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:5,  waktu:"H-9 Bulan",  tugas:"Survei & booking vendor catering",                         pic:"Mempelai Wanita",  status:"Belum", catatan:""},
  {id:6,  waktu:"H-9 Bulan",  tugas:"Survei & booking dekorasi (mihrab, pelaminan)",             pic:"Mempelai Wanita",  status:"Belum", catatan:""},
  {id:7,  waktu:"H-8 Bulan",  tugas:"Booking fotografer & videografer",                         pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:8,  waktu:"H-8 Bulan",  tugas:"Pilih & pesan busana akad (gamis, kerudung)",               pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:9,  waktu:"H-7 Bulan",  tugas:"Konfirmasi penghulu / petugas KUA",                        pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:10, waktu:"H-7 Bulan",  tugas:"Urus dokumen administrasi nikah (N1-N7, KK, KTP)",         pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:11, waktu:"H-6 Bulan",  tugas:"Pesan undangan fisik & digital",                           pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:12, waktu:"H-6 Bulan",  tugas:"Tentukan mas kawin / mahar",                               pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:13, waktu:"H-5 Bulan",  tugas:"Booking MC & qori/qoriah pembaca ayat",                   pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:14, waktu:"H-5 Bulan",  tugas:"Booking sound system & multimedia masjid",                 pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:15, waktu:"H-4 Bulan",  tugas:"Fitting awal busana akad nikah",                           pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:16, waktu:"H-4 Bulan",  tugas:"Survei & pesan souvenir tamu",                             pic:"Mempelai Wanita",  status:"Belum", catatan:""},
  {id:17, waktu:"H-3 Bulan",  tugas:"Tes makanan (food tasting) dengan vendor catering",        pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:18, waktu:"H-3 Bulan",  tugas:"Cek ulang tata ruang & kapasitas masjid",                  pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:19, waktu:"H-2 Bulan",  tugas:"Sebar undangan digital & cetak",                          pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:20, waktu:"H-2 Bulan",  tugas:"Konfirmasi jumlah tamu final ke catering",                 pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:21, waktu:"H-1 Bulan",  tugas:"Gladi resik rangkaian acara akad",                        pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:22, waktu:"H-1 Bulan",  tugas:"Finalisasi rundown acara dengan MC & penghulu",            pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:23, waktu:"H-2 Minggu", tugas:"Fitting akhir busana & cek perlengkapan ibadah",           pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:24, waktu:"H-2 Minggu", tugas:"Konfirmasi ulang seluruh vendor",                          pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:25, waktu:"H-1 Minggu", tugas:"Siapkan perlengkapan akad (mahar, buku nikah, cincin)",    pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:26, waktu:"H-1 Minggu", tugas:"Briefing keluarga & petugas penerima tamu",               pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:27, waktu:"H-1 Hari",   tugas:"Antar perlengkapan dekorasi & catering ke masjid",        pic:"Vendor",           status:"Belum", catatan:""},
  {id:28, waktu:"H-1 Hari",   tugas:"Istirahat cukup & persiapan mental/spiritual",            pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:29, waktu:"Hari-H",     tugas:"Akad nikah berlangsung di masjid",                        pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:30, waktu:"Hari-H",     tugas:"Sesi foto & ramah tamah tamu undangan",                   pic:"Kedua Mempelai",   status:"Belum", catatan:""},
];

const D0_ANG = [
  {id:1,  kategori:"Sewa & Donasi Masjid",            estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:2,  kategori:"Penghulu / Petugas KUA",           estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:3,  kategori:"Mas Kawin / Mahar",                estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:4,  kategori:"Catering (Akad & Tamu)",           estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:5,  kategori:"Dekorasi (Mihrab, Pelaminan)",     estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:6,  kategori:"Busana Akad (Pria & Wanita)",      estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:7,  kategori:"Make Up & Rias Pengantin",         estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:8,  kategori:"Fotografer & Videografer",         estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:9,  kategori:"MC & Qori/Qoriah",                estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:10, kategori:"Sound System & Multimedia",        estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:11, kategori:"Undangan (Cetak & Digital)",       estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:12, kategori:"Souvenir Tamu",                    estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:13, kategori:"Dokumen & Administrasi Nikah",     estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:14, kategori:"Transportasi & Akomodasi",         estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:15, kategori:"Dana Tak Terduga",                 estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
];

const D0_VND = [
  {id:1,  kategori:"Catering",              nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:2,  kategori:"Dekorasi",              nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:3,  kategori:"Fotografer/Videografer",nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:4,  kategori:"MC",                   nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:5,  kategori:"Qori/Qoriah",          nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:6,  kategori:"Busana Akad",          nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:7,  kategori:"Make Up Artist",       nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:8,  kategori:"Sound System",         nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:9,  kategori:"Percetakan Undangan",  nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:10, kategori:"Souvenir",             nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:11, kategori:"Transportasi",         nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
];

const D0_RD = [
  {id:1,  waktu:"06.30", acara:"Kedatangan & persiapan mempelai pria beserta rombongan",   pic:"Keluarga Mempelai Pria",     catatan:""},
  {id:2,  waktu:"07.00", acara:"Kedatangan mempelai wanita & wali nikah",                   pic:"Keluarga Mempelai Wanita",   catatan:""},
  {id:3,  waktu:"07.15", acara:"Tamu & undangan mulai memasuki masjid",                     pic:"Penerima Tamu",              catatan:""},
  {id:4,  waktu:"07.30", acara:"Pembukaan oleh MC",                                         pic:"MC",                         catatan:""},
  {id:5,  waktu:"07.35", acara:"Pembacaan ayat suci Al-Qur'an & sari tilawah",             pic:"Qori/Qoriah",                catatan:""},
  {id:6,  waktu:"07.45", acara:"Sambutan & nasihat pernikahan",                             pic:"Penghulu/Ustadz",            catatan:""},
  {id:7,  waktu:"08.00", acara:"Ijab kabul (akad nikah)",                                   pic:"Wali Nikah & Mempelai Pria", catatan:"Disaksikan penghulu & 2 saksi"},
  {id:8,  waktu:"08.10", acara:"Penandatanganan buku nikah",                                pic:"Petugas KUA",                catatan:""},
  {id:9,  waktu:"08.20", acara:"Penyerahan mas kawin / mahar",                              pic:"Mempelai Pria",              catatan:""},
  {id:10, waktu:"08.25", acara:"Doa & tausiyah pernikahan",                                 pic:"Penghulu/Ustadz",            catatan:""},
  {id:11, waktu:"08.40", acara:"Sungkeman kepada orang tua",                                pic:"Kedua Mempelai",             catatan:""},
  {id:12, waktu:"08.50", acara:"Sesi foto bersama keluarga",                                pic:"Fotografer",                 catatan:""},
  {id:13, waktu:"09.10", acara:"Ramah tamah & santap bersama tamu undangan",                pic:"Panitia & Catering",         catatan:""},
  {id:14, waktu:"10.00", acara:"Acara selesai, tamu mulai pamit",                           pic:"MC",                         catatan:""},
];

/* ── SHARED MICRO-COMPONENTS ──────────────────────── */
const Badge = ({v}) => {
  const [bg, tx] = SC[v] || ["#E5E7EB","#374151"];
  return <span style={{background:bg,color:tx,fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:99,whiteSpace:"nowrap",display:"inline-block"}}>{v}</span>;
};

const Card = ({children,style={}}) => (
  <div className="card-custom" style={{background:P.white,borderRadius:16,border:`1px solid ${P.border}`,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.02)",...style}}>{children}</div>
);

const SectionHeader = ({title,onAdd,addLabel="+ Tambah"}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16, marginTop:8}}>
    <h3 style={{fontSize:18,fontWeight:800,color:P.em,margin:0}}>{title}</h3>
    {onAdd && (
      <button onClick={onAdd} style={{background:P.em,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer", transition:"0.2s", boxShadow:"0 4px 12px rgba(122, 27, 41, 0.2)"}}>
        {addLabel}
      </button>
    )}
  </div>
);

const ActionBtns = ({onEdit,onDelete}) => (
  <div style={{display:"flex",gap:6,flexShrink:0}}>
    <button onClick={onEdit} title="Edit" style={{width:32,height:32,background:P.goldL,border:"none",borderRadius:8,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
    <button onClick={onDelete} title="Hapus" style={{width:32,height:32,background:"#FEE2E2",border:"none",borderRadius:8,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑️</button>
  </div>
);

const inp = {width:"100%",border:`1.5px solid ${P.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:P.white, color:"#1F2937", transition:"border 0.2s"};

const Fld = ({label,children}) => (
  <div style={{marginBottom:16}}>
    <label style={{display:"block",fontSize:11,fontWeight:800,color:P.em,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</label>
    {children}
  </div>
);

/* ── MODALS ───────────────────────────────────────────────────── */
function Modal({open,title,onClose,onSave,children}) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}} />
      <div onClick={e=>e.stopPropagation()}
        style={{position:"relative",width:"92%",maxWidth:500,background:P.white,borderRadius:20,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 40px rgba(0,0,0,.3)", animation:"slideUp 0.3s ease-out"}}>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:P.em,borderRadius:"20px 20px 0 0"}}>
          <span style={{color:P.white,fontWeight:800,fontSize:16}}>{title}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,color:P.white,width:32,height:32,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:24}}>{children}</div>
        {onSave && (
          <div style={{padding:"16px 24px",borderTop:`1px solid ${P.border}`,display:"flex",gap:12, background:P.cream, borderRadius:"0 0 20px 20px"}}>
            <button onClick={onClose} style={{flex:1,padding:"12px 0",border:`1px solid ${P.border}`,borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",background:P.grey,color:"#555"}}>Batal</button>
            <button onClick={onSave} style={{flex:2,padding:"12px 0",border:"none",borderRadius:10,fontSize:14,fontWeight:800,cursor:"pointer",background:P.em,color:P.white}}>Simpan Perubahan</button>
          </div>
        )}
      </div>
    </div>
  );
}

function DelDlg({open,label,onClose,onConfirm}) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:110,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)"}} />
      <div onClick={e=>e.stopPropagation()} style={{position:"relative",background:P.white,borderRadius:20,padding:32,width:"100%",maxWidth:340,textAlign:"center",boxShadow:"0 20px 40px rgba(0,0,0,.3)"}}>
        <div style={{fontSize:48,marginBottom:12}}>🗑️</div>
        <p style={{fontWeight:800,fontSize:18,margin:"0 0 8px",color:"#1F2937"}}>Hapus data ini?</p>
        {label && <p style={{fontSize:13,color:"#6B7280",margin:"0 0 24px",lineHeight:1.4}}>{label}</p>}
        <div style={{display:"flex",gap:12}}>
          <button onClick={onClose} style={{flex:1,padding:"12px 0",border:`1px solid ${P.border}`,borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",background:P.grey}}>Batal</button>
          <button onClick={onConfirm} style={{flex:1,padding:"12px 0",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",background:"#DC2626",color:P.white}}>Hapus</button>
        </div>
      </div>
    </div>
  );
}

/* ── BERANDA ──────────────────────────────────────── */
function Beranda({info,setInfo}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(info);
  const countdown = useCountdown(info.tanggal, info.waktu);

  const fields = [
    ["namaPria","Nama Mempelai Pria", "text"], ["namaWanita","Nama Mempelai Wanita", "text"],
    ["tanggal","Hari & Tanggal Akad", "date"], ["waktu","Waktu Akad (Misal: 08.00)", "text"],
    ["masjid","Nama Masjid", "text"], ["alamat","Alamat Masjid", "text"],
    ["wali","Wali Nikah", "text"], ["penghulu","Penghulu / Petugas KUA", "text"],
    ["mahar","Mas Kawin / Mahar", "text"], ["tema","Tema & Warna Pernikahan", "text"],
  ];
  const save = () => { setInfo(f); setOpen(false); };
  const open_ = () => { setF(info); setOpen(true); };

  const cBox = (num, label) => (
    <div style={{background:"rgba(255,255,255,0.1)", borderRadius:12, width:64, padding:"10px 0", textAlign:"center", border:`1px solid rgba(255,255,255,0.15)`}}>
      <p style={{margin:0, fontSize:22, fontWeight:900, color:P.white}}>{num}</p>
      <p style={{margin:0, fontSize:10, fontWeight:600, color:P.gold, textTransform:"uppercase", letterSpacing:"1px"}}>{label}</p>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {/* Hero Dinamis */}
      <div style={{borderRadius:24,overflow:"hidden",boxShadow:"0 12px 32px rgba(122, 27, 41, 0.15)"}}>
        <div style={{background:`linear-gradient(135deg,${P.em2} 0%,${P.em} 50%,${P.em3} 100%)`,padding:"48px 24px 32px",textAlign:"center",position:"relative"}}>
          <div style={{position:"absolute",inset:0,opacity:.1,backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A961' fill-opacity='1'%3E%3Cpath d='M30 0l8.66 5v10L30 20l-8.66-5V5zM0 20l8.66 5v10L0 40l-8.66-5V25zM60 20l8.66 5v10L60 40l-8.66-5V25z'/%3E%3C/g%3E%3C/svg%3E\")"}} />
          <div style={{fontSize:48,marginBottom:12}}>🕌</div>
          <p style={{color:"rgba(255,255,255,.7)",fontSize:11,letterSpacing:".3em",textTransform:"uppercase",margin:"0 0 12px",fontWeight:600}}>Walimatul &lsquo;Urs</p>
          {info.namaPria || info.namaWanita ? (
            <div style={{marginBottom:16}}>
              <h2 style={{color:P.white,fontSize:32,fontWeight:900,margin:"0 0 4px",fontFamily:"Georgia,serif"}}>{info.namaPria||"—"}</h2>
              <p style={{color:P.gold,fontSize:20,margin:"4px 0",fontFamily:"Georgia,serif"}}>&amp;</p>
              <h2 style={{color:P.white,fontSize:32,fontWeight:900,margin:0,fontFamily:"Georgia,serif"}}>{info.namaWanita||"—"}</h2>
            </div>
          ) : (
            <p style={{color:"rgba(255,255,255,.4)",fontStyle:"italic",margin:"0 0 16px",fontSize:16}}>Silakan lengkapi nama mempelai</p>
          )}
          {info.tanggal && <p style={{color:P.gold,fontSize:14,margin:"0 0 4px",fontWeight:600}}>{formatTanggal(info.tanggal)}{info.waktu && ` · Pukul ${info.waktu}`}</p>}
          {info.masjid  && <p style={{color:"rgba(255,255,255,.8)",fontSize:14,margin:0}}>{info.masjid}</p>}

          {info.tanggal && (
            <div style={{marginTop:24, paddingTop:24, borderTop:`1px solid rgba(255,255,255,0.15)`}}>
              {countdown.error ? (
                <div style={{padding:"12px 16px", background:"rgba(254, 226, 226, 0.15)", borderRadius:12, display:"inline-block"}}>
                    <p style={{color:P.goldL, fontSize:13, margin:0, fontWeight:700}}>⚠️ Kalibrasi Ulang Dibutuhkan</p>
                </div>
              ) : countdown.isPast ? (
                <p style={{color:P.gold, fontSize:16, fontWeight:800, margin:0, letterSpacing:".05em"}}>Hari Bahagia Telah Tiba!</p>
              ) : (
                <div style={{display:"flex", gap:12, justifyContent:"center", alignItems:"center"}}>
                  {cBox(countdown.months, "Bulan")}
                  <div style={{color:P.goldL, fontSize:24, fontWeight:800}}>:</div>
                  {cBox(countdown.days, "Hari")}
                  <div style={{color:P.goldL, fontSize:24, fontWeight:800}}>:</div>
                  {cBox(countdown.hours, "Jam")}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{background:P.em2,padding:"16px 24px",display:"flex",justifyContent:"flex-end"}}>
          <button onClick={open_} style={{background:P.gold,color:P.em2,border:"none",borderRadius:10,padding:"8px 20px",fontSize:13,fontWeight:800,cursor:"pointer"}}>✏️ Edit Informasi</button>
        </div>
      </div>

      <Card>
        <div style={{padding:"16px 20px 12px",background:P.cream,borderBottom:`1px solid ${P.border}`}}>
          <span style={{fontSize:13,fontWeight:800,color:P.em}}>RANGKUMAN INFORMASI</span>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:0}}>
          {fields.map(([k,lbl]) => (
            <div key={k} style={{padding:"14px 20px",borderBottom:`1px solid ${P.cream}`}}>
              <p style={{margin:"0 0 6px",fontSize:11,color:"#9CA3AF",textTransform:"uppercase",fontWeight:700,letterSpacing:"0.5px"}}>{lbl}</p>
              <p style={{margin:0,fontSize:15,fontWeight:600,color:info[k]?"#1F2937":"#D1D5DB",fontStyle:info[k]?"normal":"italic"}}>
                {k === 'tanggal' ? (info[k] ? formatTanggal(info[k]) : "—") : (info[k]||"—")}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={open} title="Edit Informasi Pernikahan" onClose={()=>setOpen(false)} onSave={save}>
        {fields.map(([k,lbl,type])=>(
          <Fld key={k} label={lbl}>
            <input style={inp} type={type} value={f[k]||""} onChange={e=>setF({...f,[k]:e.target.value})} />
          </Fld>
        ))}
      </Modal>
    </div>
  );
}

/* ── CHECKLIST ─────────────────────────────────────── */
function Checklist({data,setData}) {
  const [m, setM] = useState(null);
  const [del, setDel] = useState(null);
  const [f, setF] = useState({});

  const done = data.filter(i=>i.status==="Selesai").length;
  const pct  = data.length ? Math.round(done/data.length*100) : 0;

  const openAdd  = () => { setF({waktu:"H-1 Bulan",tugas:"",pic:"",status:"Belum",catatan:""}); setM("add"); };
  const openEdit = i => { setF({...i}); setM(i.id); };
  const save = () => {
    if (!f.tugas?.trim()) return;
    if (m==="add") setData(p=>[...p,{...f,id:nid()}]);
    else setData(p=>p.map(i=>i.id===m?{...f,id:i.id}:i));
    setM(null);
  };
  const remove = () => { setData(p=>p.filter(i=>i.id!==del.id)); setDel(null); };

  const groups = data.reduce((g,i)=>{ (g[i.waktu]=g[i.waktu]||[]).push(i); return g; },{});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card style={{boxShadow:"0 8px 24px rgba(122,27,41,0.08)", border:`2px solid ${P.goldL}`}}>
        <div style={{padding:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <p style={{margin:"0 0 4px",fontSize:13,color:"#6B7280", fontWeight:600}}>Progres Persiapan</p>
              <p style={{margin:0,fontSize:32,fontWeight:900,color:P.em}}>{pct}%</p>
            </div>
            <div style={{textAlign:"right"}}>
              <p style={{margin:0,fontSize:28,fontWeight:900,color:P.gold}}>{done}</p>
              <p style={{margin:0,fontSize:12,color:"#9CA3AF"}}>dari {data.length} tugas</p>
            </div>
          </div>
          <div style={{height:10,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${P.em},${P.gold})`,borderRadius:99,transition:"width 0.5s ease-in-out"}} />
          </div>
        </div>
      </Card>

      <SectionHeader title="Daftar Tugas Checklist" onAdd={openAdd} />

      <div style={{display:"flex", flexDirection:"column", gap:20}}>
        {Object.entries(groups).map(([waktu,items])=>(
          <div key={waktu}>
            <p style={{fontSize:13,fontWeight:800,color:P.goldD,margin:"0 0 10px 4px",textTransform:"uppercase",letterSpacing:".08em"}}>⌛ {waktu}</p>
            <Card>
              {items.map((item,idx)=>(
                <div key={item.id} style={{display:"flex",gap:16,padding:"16px 20px",borderBottom:idx<items.length-1?`1px solid ${P.cream}`:"none",alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{margin:"0 0 8px",fontSize:15,fontWeight:700,color:"#1F2937",lineHeight:1.4}}>{item.tugas}</p>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                      <Badge v={item.status} />
                      {item.pic && <span style={{fontSize:12,color:"#6B7280", fontWeight:600}}>👤 {item.pic}</span>}
                    </div>
                    {item.catatan && <p style={{margin:"8px 0 0",fontSize:12,color:"#9CA3AF",fontStyle:"italic"}}>Catatan: {item.catatan}</p>}
                  </div>
                  <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDel(item)} />
                </div>
              ))}
            </Card>
          </div>
        ))}
      </div>

      <Modal open={!!m} title={m==="add"?"Tambah Tugas":"Edit Tugas"} onClose={()=>setM(null)} onSave={save}>
        <Fld label="Waktu"><input style={inp} value={f.waktu||""} onChange={e=>setF({...f,waktu:e.target.value})} placeholder="contoh: H-3 Bulan" /></Fld>
        <Fld label="Tugas / Persiapan"><textarea style={{...inp,minHeight:80,resize:"vertical"}} value={f.tugas||""} onChange={e=>setF({...f,tugas:e.target.value})} /></Fld>
        <Fld label="Penanggung Jawab"><input style={inp} value={f.pic||""} onChange={e=>setF({...f,pic:e.target.value})} /></Fld>
        <Fld label="Status">
          <select style={inp} value={f.status||"Belum"} onChange={e=>setF({...f,status:e.target.value})}>
            {["Belum","Proses","Selesai"].map(o=><option key={o}>{o}</option>)}
          </select>
        </Fld>
        <Fld label="Catatan"><textarea style={{...inp,minHeight:60,resize:"vertical"}} value={f.catatan||""} onChange={e=>setF({...f,catatan:e.target.value})} /></Fld>
      </Modal>
      <DelDlg open={!!del} label={del?.tugas} onClose={()=>setDel(null)} onConfirm={remove} />
    </div>
  );
}

/* ── ANGGARAN UTUH ──────────────────────────────────────── */
function Anggaran({data,setData}) {
  const [m, setM]   = useState(null);
  const [del, setDel] = useState(null);
  const [f, setF]   = useState({});

  const totEst = data.reduce((s,i)=>s+(Number(i.estimasi)||0),0);
  const totAkt = data.reduce((s,i)=>s+(Number(i.aktual)||0),0);
  const sel    = totEst - totAkt;

  const openAdd  = () => { setF({kategori:"",estimasi:0,aktual:0,statusBayar:"Belum Bayar",catatan:""}); setM("add"); };
  const openEdit = i => { setF({...i}); setM(i.id); };
  const save = () => {
    if (!f.kategori?.trim()) return;
    if (m==="add") setData(p=>[...p,{...f,id:nid()}]);
    else setData(p=>p.map(i=>i.id===m?{...f,id:i.id}:i));
    setM(null);
  };
  const remove = () => { setData(p=>p.filter(i=>i.id!==del.id)); setDel(null); };

  const statCard = (lbl,val,clr,prefix="")=> (
    <Card key={lbl} style={{flex:1}}>
      <div style={{padding:"16px 12px",textAlign:"center"}}>
        <p style={{margin:"0 0 6px",fontSize:11,color:"#9CA3AF",textTransform:"uppercase",fontWeight:800}}>{lbl}</p>
        <p style={{margin:0,fontSize:16,fontWeight:900,color:clr,wordBreak:"break-all"}}>{prefix}{fmtRp(val)}</p>
      </div>
    </Card>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:12, flexWrap:"wrap"}}>
        {statCard("Estimasi",totEst,P.em)}
        {statCard("Aktual",totAkt,totAkt>totEst?"#DC2626":P.em)}
        {statCard("Selisih",Math.abs(sel),sel<0?"#DC2626":"#059669",sel<0?"−":"")}
      </div>

      {totEst > 0 && (
        <Card>
          <div style={{padding:"16px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:12,color:"#6B7280", fontWeight:600}}>Realisasi anggaran</span>
              <span style={{fontSize:13,fontWeight:800,color:totAkt>totEst?"#DC2626":P.em}}>{Math.round(totAkt/totEst*100)}%</span>
            </div>
            <div style={{height:10,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min(totAkt/totEst*100,100)}%`,background:totAkt>totEst?"#DC2626":`linear-gradient(90deg,${P.em},${P.gold})`,borderRadius:99,transition:"width 0.5s"}} />
            </div>
          </div>
        </Card>
      )}

      <SectionHeader title="Rincian Biaya" onAdd={openAdd} />
      <Card>
        {data.map((item,idx)=>(
          <div key={item.id} style={{display:"flex",gap:16,padding:"16px 20px",borderBottom:idx<data.length-1?`1px solid ${P.cream}`:"none",alignItems:"flex-start"}}>
            <div style={{flex:1,minWidth:0}}>
              <p style={{margin:"0 0 6px",fontSize:15,fontWeight:800,color:"#1F2937"}}>{item.kategori}</p>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:12,color:"#6B7280",marginBottom:8}}>
                <span>Est: <strong style={{color:"#374151"}}>{fmtRp(item.estimasi)}</strong></span>
                <span>Aktual: <strong style={{color:"#374151"}}>{fmtRp(item.aktual)}</strong></span>
              </div>
              <Badge v={item.statusBayar} />
              {item.catatan && <p style={{margin:"8px 0 0",fontSize:12,color:"#9CA3AF",fontStyle:"italic"}}>{item.catatan}</p>}
            </div>
            <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDel(item)} />
          </div>
        ))}
      </Card>

      <Modal open={!!m} title={m==="add"?"Tambah Biaya":"Edit Biaya"} onClose={()=>setM(null)} onSave={save}>
        <Fld label="Kategori Biaya"><input style={inp} value={f.kategori||""} onChange={e=>setF({...f,kategori:e.target.value})} /></Fld>
        <Fld label="Estimasi Biaya (Rp)"><input style={inp} type="number" value={f.estimasi||0} onChange={e=>setF({...f,estimasi:Number(e.target.value)})} /></Fld>
        <Fld label="Biaya Aktual (Rp)"><input style={inp} type="number" value={f.aktual||0} onChange={e=>setF({...f,aktual:Number(e.target.value)})} /></Fld>
        <Fld label="Status Bayar">
          <select style={inp} value={f.statusBayar||"Belum Bayar"} onChange={e=>setF({...f,statusBayar:e.target.value})}>
            {["Belum Bayar","DP/Sebagian","Lunas"].map(o=><option key={o}>{o}</option>)}
          </select>
        </Fld>
        <Fld label="Catatan"><textarea style={{...inp,minHeight:60,resize:"vertical"}} value={f.catatan||""} onChange={e=>setF({...f,catatan:e.target.value})} /></Fld>
      </Modal>
      <DelDlg open={!!del} label={del?.kategori} onClose={()=>setDel(null)} onConfirm={remove} />
    </div>
  );
}

/* ── VENDOR UTUH ────────────────────────────────────────── */
function Vendor({data,setData}) {
  const [m, setM]   = useState(null);
  const [del, setDel] = useState(null);
  const [f, setF]   = useState({});

  const booked = data.filter(i=>i.status==="Sudah Booking").length;

  const openAdd  = () => { setF({kategori:"",nama:"",narahubung:"",telp:"",status:"Belum Booking",catatan:""}); setM("add"); };
  const openEdit = i => { setF({...i}); setM(i.id); };
  const save = () => {
    if (!f.kategori?.trim()) return;
    if (m==="add") setData(p=>[...p,{...f,id:nid()}]);
    else setData(p=>p.map(i=>i.id===m?{...f,id:i.id}:i));
    setM(null);
  };
  const remove = () => { setData(p=>p.filter(i=>i.id!==del.id)); setDel(null); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:12, flexWrap:"wrap"}}>
        {[["Total",data.length,P.em],["Booked",booked,"#059669"],["Belum",data.length-booked,"#DC2626"]].map(([l,v,c])=>(
          <Card key={l} style={{flex:1, minWidth:"30%"}}>
            <div style={{padding:"16px 12px",textAlign:"center"}}>
              <p style={{margin:"0 0 6px",fontSize:11,color:"#9CA3AF",fontWeight:800,textTransform:"uppercase"}}>{l}</p>
              <p style={{margin:0,fontSize:24,fontWeight:900,color:c}}>{v}</p>
            </div>
          </Card>
        ))}
      </div>

      <SectionHeader title="Daftar Vendor" onAdd={openAdd} />
      <Card>
        {data.map((item,idx)=>(
          <div key={item.id} style={{display:"flex",gap:16,padding:"16px 20px",borderBottom:idx<data.length-1?`1px solid ${P.cream}`:"none",alignItems:"flex-start"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
                <span style={{fontSize:14,fontWeight:800,color:P.em2}}>{item.kategori}</span>
                <Badge v={item.status} />
              </div>
              {item.nama && <p style={{margin:"0 0 6px",fontSize:13,fontWeight:700,color:"#374151"}}>{item.nama}</p>}
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {item.narahubung && <span style={{fontSize:12,color:"#6B7280"}}>👤 {item.narahubung}</span>}
                {item.telp && <span style={{fontSize:12,color:"#6B7280"}}>📞 {item.telp}</span>}
              </div>
              {item.catatan && <p style={{margin:"8px 0 0",fontSize:12,color:"#9CA3AF",fontStyle:"italic"}}>{item.catatan}</p>}
            </div>
            <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDel(item)} />
          </div>
        ))}
      </Card>

      <Modal open={!!m} title={m==="add"?"Tambah Vendor":"Edit Vendor"} onClose={()=>setM(null)} onSave={save}>
        <Fld label="Kategori Vendor"><input style={inp} value={f.kategori||""} onChange={e=>setF({...f,kategori:e.target.value})} /></Fld>
        <Fld label="Nama Vendor"><input style={inp} value={f.nama||""} onChange={e=>setF({...f,nama:e.target.value})} /></Fld>
        <Fld label="Narahubung"><input style={inp} value={f.narahubung||""} onChange={e=>setF({...f,narahubung:e.target.value})} /></Fld>
        <Fld label="No. Telepon / WA"><input style={inp} value={f.telp||""} onChange={e=>setF({...f,telp:e.target.value})} /></Fld>
        <Fld label="Status Booking">
          <select style={inp} value={f.status||"Belum Booking"} onChange={e=>setF({...f,status:e.target.value})}>
            {["Belum Booking","DP Terbayar","Sudah Booking"].map(o=><option key={o}>{o}</option>)}
          </select>
        </Fld>
        <Fld label="Catatan"><textarea style={{...inp,minHeight:60,resize:"vertical"}} value={f.catatan||""} onChange={e=>setF({...f,catatan:e.target.value})} /></Fld>
      </Modal>
      <DelDlg open={!!del} label={del?.kategori} onClose={()=>setDel(null)} onConfirm={remove} />
    </div>
  );
}

/* ── RUNDOWN UTUH ───────────────────────────────────────── */
function Rundown({data,setData}) {
  const [m, setM]   = useState(null);
  const [del, setDel] = useState(null);
  const [f, setF]   = useState({});

  const sorted = arr => [...arr].sort((a,b)=>a.waktu.localeCompare(b.waktu));

  const openAdd  = () => { setF({waktu:"",acara:"",pic:"",catatan:""}); setM("add"); };
  const openEdit = i => { setF({...i}); setM(i.id); };
  const save = () => {
    if (!f.acara?.trim()) return;
    if (m==="add") setData(p=>sorted([...p,{...f,id:nid()}]));
    else setData(p=>sorted(p.map(i=>i.id===m?{...f,id:i.id}:i)));
    setM(null);
  };
  const remove = () => { setData(p=>p.filter(i=>i.id!==del.id)); setDel(null); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <SectionHeader title="Rundown Akad Nikah" onAdd={openAdd} />
      <div style={{position:"relative", paddingLeft:10}}>
        <div style={{position:"absolute",left:65,top:10,bottom:10,width:3,background:`linear-gradient(to bottom,${P.em},${P.gold})`,borderRadius:99}} />
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {data.map(item=>(
            <div key={item.id} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:48,textAlign:"right",flexShrink:0,paddingTop:4}}>
                <span style={{fontSize:13,fontWeight:900,color:P.goldD}}>{item.waktu}</span>
              </div>
              <div style={{width:16,height:16,borderRadius:99,border:`3px solid ${P.em}`,background:P.white,flexShrink:0,marginTop:4,zIndex:1}} />
              <div style={{flex:1,background:P.white,borderRadius:16,border:`1px solid ${P.border}`,padding:"16px",display:"flex",gap:12,alignItems:"flex-start",boxShadow:"0 2px 8px rgba(0,0,0,0.03)"}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{margin:"0 0 6px",fontSize:15,fontWeight:800,color:"#1F2937",lineHeight:1.4}}>{item.acara}</p>
                  {item.pic && <p style={{margin:0,fontSize:12,color:"#6B7280"}}>👤 {item.pic}</p>}
                  {item.catatan && <p style={{margin:"6px 0 0",fontSize:12,color:P.goldD,fontStyle:"italic"}}>📌 {item.catatan}</p>}
                </div>
                <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDel(item)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={!!m} title={m==="add"?"Tambah Sesi":"Edit Sesi"} onClose={()=>setM(null)} onSave={save}>
        <Fld label="Waktu (contoh: 08.00)"><input style={inp} value={f.waktu||""} onChange={e=>setF({...f,waktu:e.target.value})} placeholder="07.30" /></Fld>
        <Fld label="Rangkaian Acara"><textarea style={{...inp,minHeight:80,resize:"vertical"}} value={f.acara||""} onChange={e=>setF({...f,acara:e.target.value})} /></Fld>
        <Fld label="Penanggung Jawab / Pengisi"><input style={inp} value={f.pic||""} onChange={e=>setF({...f,pic:e.target.value})} /></Fld>
        <Fld label="Catatan Khusus"><textarea style={{...inp,minHeight:60,resize:"vertical"}} value={f.catatan||""} onChange={e=>setF({...f,catatan:e.target.value})} /></Fld>
      </Modal>
      <DelDlg open={!!del} label={del?.acara} onClose={()=>setDel(null)} onConfirm={remove} />
    </div>
  );
}

/* ── TAMU UTUH ──────────────────────────────────────────── */
function Tamu({data,setData}) {
  const [m, setM]   = useState(null);
  const [del, setDel] = useState(null);
  const [f, setF]   = useState({});
  const [q, setQ]   = useState("");

  const openAdd  = () => { setF({nama:"",pihak:"Mempelai Pria",jumlah:1,konfirmasi:"Belum Konfirmasi",catatan:""}); setM("add"); };
  const openEdit = i => { setF({...i}); setM(i.id); };
  const save = () => {
    if (!f.nama?.trim()) return;
    if (m==="add") setData(p=>[...p,{...f,id:nid()}]);
    else setData(p=>p.map(i=>i.id===m?{...f,id:i.id}:i));
    setM(null);
  };
  const remove = () => { setData(p=>p.filter(i=>i.id!==del.id)); setDel(null); };

  const totOrang = data.reduce((s,i)=>s+(Number(i.jumlah)||0),0);
  const hadir    = data.filter(i=>i.konfirmasi==="Hadir").reduce((s,i)=>s+(Number(i.jumlah)||0),0);
  const filtered = q ? data.filter(i=>i.nama?.toLowerCase().includes(q.toLowerCase())) : data;

  const avatar = nm => {
    const ch = (nm||"?")[0].toUpperCase();
    return <div style={{width:40,height:40,borderRadius:99,background:P.em,color:P.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,flexShrink:0}}>{ch}</div>;
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:12, flexWrap:"wrap"}}>
        {[["Tamu Tercatat",data.length,P.em],["Est. Orang",totOrang,"#374151"],["Hadir",hadir,"#059669"]].map(([l,v,c])=>(
          <Card key={l} style={{flex:1, minWidth:"30%"}}>
            <div style={{padding:"16px 12px",textAlign:"center"}}>
              <p style={{margin:"0 0 6px",fontSize:11,color:"#9CA3AF",fontWeight:800,textTransform:"uppercase"}}>{l}</p>
              <p style={{margin:0,fontSize:24,fontWeight:900,color:c}}>{v}</p>
            </div>
          </Card>
        ))}
      </div>

      <div style={{display:"flex",gap:12, alignItems:"center"}}>
        <input
          style={{...inp,flex:1}} placeholder="🔍  Cari nama tamu..."
          value={q} onChange={e=>setQ(e.target.value)}
        />
        <button onClick={openAdd} style={{background:P.em,color:P.white,border:"none",borderRadius:10,padding:"0 20px", height:46, fontSize:13,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap", boxShadow:"0 4px 12px rgba(122,27,41,0.2)"}}>+ Tambah</button>
      </div>

      {filtered.length===0 ? (
        <Card><div style={{padding:40,textAlign:"center",color:"#9CA3AF",fontSize:14, fontWeight:600}}>{q?"Tamu tidak ditemukan 🔍":"Belum ada tamu yang ditambahkan."}</div></Card>
      ) : (
        <Card>
          {filtered.map((item,idx)=>(
            <div key={item.id} style={{display:"flex",gap:16,padding:"16px 20px",borderBottom:idx<filtered.length-1?`1px solid ${P.cream}`:"none",alignItems:"center"}}>
              {avatar(item.nama)}
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:"0 0 6px",fontSize:15,fontWeight:800,color:"#1F2937"}}>{item.nama}</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <Badge v={item.konfirmasi} />
                  <span style={{fontSize:12,color:"#6B7280"}}>{item.pihak} · {item.jumlah} org</span>
                </div>
                {item.catatan && <p style={{margin:"6px 0 0",fontSize:12,color:"#9CA3AF",fontStyle:"italic"}}>{item.catatan}</p>}
              </div>
              <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDel(item)} />
            </div>
          ))}
        </Card>
      )}

      <Modal open={!!m} title={m==="add"?"Tambah Tamu":"Edit Tamu"} onClose={()=>setM(null)} onSave={save}>
        <Fld label="Nama Tamu"><input style={inp} value={f.nama||""} onChange={e=>setF({...f,nama:e.target.value})} /></Fld>
        <Fld label="Pihak">
          <select style={inp} value={f.pihak||"Mempelai Pria"} onChange={e=>setF({...f,pihak:e.target.value})}>
            {["Mempelai Pria","Mempelai Wanita","Bersama"].map(o=><option key={o}>{o}</option>)}
          </select>
        </Fld>
        <Fld label="Jumlah Orang"><input style={inp} type="number" min={1} value={f.jumlah||1} onChange={e=>setF({...f,jumlah:Number(e.target.value)})} /></Fld>
        <Fld label="Konfirmasi RSVP">
          <select style={inp} value={f.konfirmasi||"Belum Konfirmasi"} onChange={e=>setF({...f,konfirmasi:e.target.value})}>
            {["Belum Konfirmasi","Hadir","Tidak Hadir"].map(o=><option key={o}>{o}</option>)}
          </select>
        </Fld>
        <Fld label="Catatan"><textarea style={{...inp,minHeight:60,resize:"vertical"}} value={f.catatan||""} onChange={e=>setF({...f,catatan:e.target.value})} /></Fld>
      </Modal>
      <DelDlg open={!!del} label={del?.nama} onClose={()=>setDel(null)} onConfirm={remove} />
    </div>
  );
}

/* ── TABS CONFIG ───────────────────────────────────── */
const TABS = [
  {id:"beranda",  icon:"🕌", label:"Beranda"},
  {id:"checklist",icon:"✅", label:"Checklist"},
  {id:"anggaran", icon:"💰", label:"Anggaran"},
  {id:"vendor",   icon:"🤝", label:"Vendor"},
  {id:"rundown",  icon:"📋", label:"Rundown"},
  {id:"tamu",     icon:"👥", label:"Tamu"},
];

/* ── MAIN APP & LAYOUT RESPONSIVE ──────────────────────────────────────── */
export default function App() {
  const [tab,  setTab]  = useState("beranda");
  const [info, setInfo] = useState(D0_INFO);
  const [cl,   setCl]   = useState(D0_CL);
  const [ang,  setAng]  = useState(D0_ANG);
  const [vnd,  setVnd]  = useState(D0_VND);
  const [rd,   setRd]   = useState(D0_RD);
  const [tamu, setTamu] = useState([]);
  const [rdy,  setRdy]  = useState(false);

  /* 1. LOAD FROM SUPABASE & LISTEN TO REAL-TIME CHANGES */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("wedding_data")
          .select("content")
          .eq("id", "main")
          .single();

        if (data && data.content) {
          const d = data.content;
          if (d.info) setInfo(d.info);
          if (d.cl) setCl(d.cl);
          if (d.ang) setAng(d.ang);
          if (d.vnd) setVnd(d.vnd);
          if (d.rd) setRd(d.rd);
          if (d.tamu) setTamu(d.tamu);
        }
      } catch (error) {
        console.error("Gagal mengambil data dari database", error);
      }
      setRdy(true);
    };

    fetchData();

    // Berlangganan (Subscribe) perubahan data secara real-time
    const channel = supabase
      .channel("public:wedding_data")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "wedding_data" },
        (payload) => {
          if (payload.new && payload.new.content) {
            const d = payload.new.content;
            if (d.info) setInfo(d.info);
            if (d.cl) setCl(d.cl);
            if (d.ang) setAng(d.ang);
            if (d.vnd) setVnd(d.vnd);
            if (d.rd) setRd(d.rd);
            if (d.tamu) setTamu(d.tamu);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* 2. SAVE TO SUPABASE DENGAN DEBOUNCE (TUNDA 1 DETIK) */
  useEffect(() => {
    if (!rdy) return;
    
    const saveData = async () => {
      try {
        await supabase.from("wedding_data").upsert({
          id: "main",
          content: { info, cl, ang, vnd, rd, tamu },
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Gagal menyimpan data", error);
      }
    };

    const timeoutId = setTimeout(saveData, 1000); 
    return () => clearTimeout(timeoutId);
  }, [info, cl, ang, vnd, rd, tamu, rdy]);

  const renderContent = ()=>{
    switch(tab){
      case "beranda":   return <Beranda  info={info}  setInfo={setInfo} />;
      case "checklist": return <Checklist data={cl}   setData={setCl}   />;
      case "anggaran":  return <Anggaran  data={ang}  setData={setAng}  />;
      case "vendor":    return <Vendor    data={vnd}  setData={setVnd}  />;
      case "rundown":   return <Rundown   data={rd}   setData={setRd}   />;
      case "tamu":      return <Tamu      data={tamu} setData={setTamu} />;
      default: return null; 
    }
  };

  return (
    <>
      {/* ── CSS DINAMIS UNTUK HYBRID LAYOUT ── */}
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: ${P.cream}; color: #1F2937; }
        
        .layout-wrapper {
          display: flex;
          min-height: 100vh;
        }

        /* DEFAULT: TAMPILAN MOBILE */
        .sidebar { display: none; }
        
        .main-content {
          flex: 1;
          width: 100%;
          padding: 20px 16px 100px; /* Padding bawah ekstra untuk bottom nav */
          max-width: 100vw;
        }

        .bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: ${P.em2};
          padding: 12px 8px;
          padding-bottom: env(safe-area-inset-bottom, 12px);
          justify-content: space-around;
          align-items: center;
          z-index: 50;
          box-shadow: 0 -8px 24px rgba(0,0,0,0.15);
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: all 0.2s;
          padding: 8px;
          border-radius: 12px;
        }
        
        .nav-item.active { color: ${P.gold}; background: rgba(255,255,255,0.08); }
        .nav-icon { font-size: 20px; }
        .nav-label { font-size: 10px; font-weight: 700; }

        .audio-btn {
          position: fixed;
          bottom: 100px; /* Di atas bottom nav pada mobile */
          right: 20px;
          z-index: 50;
          width: 48px; height: 48px;
          border-radius: 99px;
          border: 2px solid ${P.gold};
          font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          transition: 0.3s;
          background: ${P.white};
        }

        /* MEDIA QUERY: TAMPILAN DESKTOP (> 768px) */
        @media (min-width: 768px) {
          .bottom-nav { display: none; }
          
          .sidebar {
            display: flex;
            flex-direction: column;
            width: 280px;
            background: ${P.em2};
            color: ${P.white};
            height: 100vh;
            position: sticky;
            top: 0;
            flex-shrink: 0;
            padding: 32px 20px;
            box-shadow: 4px 0 24px rgba(0,0,0,0.1);
          }

          .sidebar-brand {
            margin-bottom: 40px;
            padding: 0 12px;
          }

          .sidebar-nav-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 16px;
            background: transparent;
            border: none;
            color: rgba(255,255,255,0.6);
            width: 100%;
            text-align: left;
            border-radius: 12px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.2s ease;
            margin-bottom: 8px;
          }
          
          .sidebar-nav-item:hover { background: rgba(255,255,255,0.05); color: ${P.white}; }
          .sidebar-nav-item.active { background: ${P.gold}; color: ${P.em2}; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3); }

          .main-content {
            padding: 48px 64px;
            max-width: 960px; /* Jauh lebih lebar dan lega di desktop */
            margin: 0 auto;
          }

          .audio-btn {
            bottom: 40px; /* Turun ke bawah karena tidak ada bottom nav */
            right: 40px;
            width: 56px; height: 56px;
            font-size: 24px;
          }
        }
      `}</style>

      <div className="layout-wrapper">
        
        {/* ── SIDEBAR (Hanya tampil di Desktop) ── */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span style={{fontSize:32}}>🕌</span>
            <h1 style={{fontSize:18, fontWeight:900, margin:"12px 0 4px", color:P.white}}>Walimatul 'Urs</h1>
            <p style={{fontSize:12, color:P.gold, margin:0}}>{info.namaPria&&info.namaWanita ? `${info.namaPria} & ${info.namaWanita}` : "Wedding Planner"}</p>
          </div>

          <nav style={{flex:1}}>
            {TABS.map(t=>(
              <button 
                key={t.id} 
                className={`sidebar-nav-item ${tab === t.id ? 'active' : ''}`}
                onClick={()=>setTab(t.id)}
              >
                <span style={{fontSize:20}}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          <div style={{padding:"16px", background:"rgba(0,0,0,0.2)", borderRadius:16, marginTop:24}}>
            <p style={{fontSize:11, color:"rgba(255,255,255,0.5)", margin:"0 0 8px"}}>Status Persiapan</p>
            <div style={{height:6, background:"rgba(255,255,255,0.1)", borderRadius:99}}>
              <div style={{height:"100%", width:`${cl.length ? Math.round(cl.filter(i=>i.status==="Selesai").length/cl.length*100) : 0}%`, background:P.gold, borderRadius:99}}/>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="main-content">
          {rdy ? renderContent() : (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:200,gap:10}}>
              <div style={{width:36,height:36,border:`3px solid ${P.border}`,borderTop:`3px solid ${P.em}`,borderRadius:99,animation:"spin 1s linear infinite"}} />
              <p style={{color:"#9CA3AF",fontSize:12}}>Mensinkronisasi Data...</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
        </main>

        {/* ── BOTTOM NAV (Hanya tampil di Mobile) ── */}
        <nav className="bottom-nav">
          {TABS.map(t=>(
            <button 
              key={t.id} 
              className={`nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={()=>setTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
            </button>
          ))}
        </nav>

        <AudioPlayer />
      </div>
    </>
  );
}
