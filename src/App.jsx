import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

/* ── KONFIGURASI SUPABASE ────────────────────────── */
// GANTI DENGAN URL DAN ANON KEY DARI PROJECT SUPABASE ANDA
const SUPABASE_URL = "https://rpqkfkrtmxhjnufwuotv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwcWtma3J0bXhoam51Znd1b3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5Mjc4MzAsImV4cCI6MjEwMTUwMzgzMH0.xLoympkxRmkWYSA7cYEM9Wp7h9cURSuU_OkquTDbumI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── PALETTE (Tema Marun & Emas) ─────────────────── */
const P = {
  em: "#7A1B29",    // Marun Utama
  em2: "#4A0E1B",   // Marun Gelap 
  em3: "#9C2740",   // Marun Terang 
  gold: "#D4AF37",  // Emas 
  goldL: "#F5EEDC", // Emas Pudar
  goldD: "#997A15", // Emas Gelap
  cream: "#FBF9F6", // Offwhite 
  border: "#E8E2D9",// Offwhite Gelap
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

// Helper format tanggal ke teks bahasa manusia
const formatTanggal = (tgl) => {
  if (!tgl) return "";
  try {
    const d = new Date(tgl);
    if (isNaN(d)) return tgl; // fallback
    return d.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return tgl;
  }
};

// Hook kustom untuk Hitung Mundur
const useCountdown = (targetDate, waktu) => {
  const [timeLeft, setTimeLeft] = useState({ months: 0, days: 0, hours: 0, isPast: false, error: false });

  useEffect(() => {
    if (!targetDate) return;

    // 1. SANITASI WAKTU: Ekstraksi hanya angka Jam dan Menit (mengabaikan teks kotor)
    let safeTime = "08:00:00"; // Fallback default
    if (waktu) {
      // Mencari pola angka tersembunyi, contoh: "Jam 08.30 Pagi" akan diekstrak menjadi "08:30"
      const match = waktu.match(/(\d{1,2})[\.:\-](\d{2})/);
      if (match) {
        safeTime = `${match[1].padStart(2, '0')}:${match[2]}:00`;
      }
    }

    // 2. PARSING TANGGAL: Pengecekan ketat format ISO
    let target;
    const isISO = /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim());
    
    if (isISO) {
        // Jika format sudah standar kalender (YYYY-MM-DD)
        target = new Date(`${targetDate.trim()}T${safeTime}`);
    } else {
        // Jika format adalah residu data lama dari database
        target = new Date(`${targetDate} ${safeTime}`); 
    }

    // 3. EVALUASI AKHIR: Jika masih Invalid Date, kita hentikan komputasi agar tidak NaN
    if (isNaN(target.getTime())) {
      setTimeLeft(prev => ({ ...prev, error: true }));
      return;
    }

    // Logika Hitung Mundur Berjalan
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

/* ── INITIAL DATA ─────────────────────────────────── */
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
  {id:6,  waktu:"H-9 Bulan",  tugas:"Survei & booking dekorasi (mihrab, pelaminan)",            pic:"Mempelai Wanita",  status:"Belum", catatan:""},
  {id:7,  waktu:"H-8 Bulan",  tugas:"Booking fotografer & videografer",                         pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:8,  waktu:"H-8 Bulan",  tugas:"Pilih & pesan busana akad (gamis, kerudung)",              pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:9,  waktu:"H-7 Bulan",  tugas:"Konfirmasi penghulu / petugas KUA",                        pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:10, waktu:"H-7 Bulan",  tugas:"Urus dokumen administrasi nikah (N1-N7, KK, KTP)",         pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:11, waktu:"H-6 Bulan",  tugas:"Pesan undangan fisik & digital",                           pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:12, waktu:"H-6 Bulan",  tugas:"Tentukan mas kawin / mahar",                               pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:13, waktu:"H-5 Bulan",  tugas:"Booking MC & qori/qoriah pembaca ayat",                    pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:14, waktu:"H-5 Bulan",  tugas:"Booking sound system & multimedia masjid",                 pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:15, waktu:"H-4 Bulan",  tugas:"Fitting awal busana akad nikah",                           pic:"Kedua Mempelai",   status:"Belum", catatan:""},
  {id:16, waktu:"H-4 Bulan",  tugas:"Survei & pesan souvenir tamu",                             pic:"Mempelai Wanita",  status:"Belum", catatan:""},
  {id:17, waktu:"H-3 Bulan",  tugas:"Tes makanan (food tasting) dengan vendor catering",        pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:18, waktu:"H-3 Bulan",  tugas:"Cek ulang tata ruang & kapasitas masjid",                  pic:"Mempelai Pria",    status:"Belum", catatan:""},
  {id:19, waktu:"H-2 Bulan",  tugas:"Sebar undangan digital & cetak",                           pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:20, waktu:"H-2 Bulan",  tugas:"Konfirmasi jumlah tamu final ke catering",                 pic:"Kedua Keluarga",   status:"Belum", catatan:""},
  {id:21, waktu:"H-1 Bulan",  tugas:"Gladi resik rangkaian acara akad",                         pic:"Kedua Mempelai",   status:"Belum", catatan:""},
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
  {id:1,  kategori:"Sewa & Donasi Masjid",             estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:2,  kategori:"Penghulu / Petugas KUA",           estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:3,  kategori:"Mas Kawin / Mahar",                estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:4,  kategori:"Catering (Akad & Tamu)",           estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:5,  kategori:"Dekorasi (Mihrab, Pelaminan)",     estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:6,  kategori:"Busana Akad (Pria & Wanita)",      estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:7,  kategori:"Make Up & Rias Pengantin",         estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:8,  kategori:"Fotografer & Videografer",         estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
  {id:9,  kategori:"MC & Qori/Qoriah",                 estimasi:0, aktual:0, statusBayar:"Belum Bayar", catatan:""},
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
  {id:4,  kategori:"MC",                    nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:5,  kategori:"Qori/Qoriah",           nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:6,  kategori:"Busana Akad",           nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:7,  kategori:"Make Up Artist",        nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:8,  kategori:"Sound System",          nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:9,  kategori:"Percetakan Undangan",   nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:10, kategori:"Souvenir",              nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
  {id:11, kategori:"Transportasi",          nama:"", narahubung:"", telp:"", status:"Belum Booking", catatan:""},
];

const D0_RD = [
  {id:1,  waktu:"06.30", acara:"Kedatangan & persiapan mempelai pria beserta rombongan",   pic:"Keluarga Mempelai Pria",     catatan:""},
  {id:2,  waktu:"07.00", acara:"Kedatangan mempelai wanita & wali nikah",                  pic:"Keluarga Mempelai Wanita",   catatan:""},
  {id:3,  waktu:"07.15", acara:"Tamu & undangan mulai memasuki masjid",                    pic:"Penerima Tamu",              catatan:""},
  {id:4,  waktu:"07.30", acara:"Pembukaan oleh MC",                                        pic:"MC",                         catatan:""},
  {id:5,  waktu:"07.35", acara:"Pembacaan ayat suci Al-Qur'an & sari tilawah",             pic:"Qori/Qoriah",                catatan:""},
  {id:6,  waktu:"07.45", acara:"Sambutan & nasihat pernikahan",                            pic:"Penghulu/Ustadz",            catatan:""},
  {id:7,  waktu:"08.00", acara:"Ijab kabul (akad nikah)",                                  pic:"Wali Nikah & Mempelai Pria", catatan:"Disaksikan penghulu & 2 saksi"},
  {id:8,  waktu:"08.10", acara:"Penandatanganan buku nikah",                               pic:"Petugas KUA",                catatan:""},
  {id:9,  waktu:"08.20", acara:"Penyerahan mas kawin / mahar",                             pic:"Mempelai Pria",              catatan:""},
  {id:10, waktu:"08.25", acara:"Doa & tausiyah pernikahan",                                pic:"Penghulu/Ustadz",            catatan:""},
  {id:11, waktu:"08.40", acara:"Sungkeman kepada orang tua",                               pic:"Kedua Mempelai",             catatan:""},
  {id:12, waktu:"08.50", acara:"Sesi foto bersama keluarga",                               pic:"Fotografer",                 catatan:""},
  {id:13, waktu:"09.10", acara:"Ramah tamah & santap bersama tamu undangan",               pic:"Panitia & Catering",         catatan:""},
  {id:14, waktu:"10.00", acara:"Acara selesai, tamu mulai pamit",                          pic:"MC",                         catatan:""},
];

/* ── SHARED MICRO-COMPONENTS ──────────────────────── */
const Badge = ({v}) => {
  const [bg, tx] = SC[v] || ["#E5E7EB","#374151"];
  return <span style={{background:bg,color:tx,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,whiteSpace:"nowrap",display:"inline-block"}}>{v}</span>;
};

const Card = ({children,style={}}) => (
  <div style={{background:P.white,borderRadius:16,border:`1px solid ${P.border}`,overflow:"hidden",...style}}>{children}</div>
);

const SectionHeader = ({title,onAdd,addLabel="+ Tambah"}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
    <h3 style={{fontSize:13,fontWeight:800,color:P.em,margin:0}}>{title}</h3>
    {onAdd && (
      <button onClick={onAdd} style={{background:P.em,color:"#fff",border:"none",borderRadius:10,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
        {addLabel}
      </button>
    )}
  </div>
);

const ActionBtns = ({onEdit,onDelete}) => (
  <div style={{display:"flex",gap:4,flexShrink:0}}>
    <button onClick={onEdit} title="Edit" style={{width:28,height:28,background:P.goldL,border:"none",borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
    <button onClick={onDelete} title="Hapus" style={{width:28,height:28,background:"#FEE2E2",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑️</button>
  </div>
);

const inp = {width:"100%",border:`1px solid ${P.border}`,borderRadius:10,padding:"8px 12px",fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:P.white, color:"#1F2937"};

const Fld = ({label,children}) => (
  <div style={{marginBottom:12}}>
    <label style={{display:"block",fontSize:10,fontWeight:800,color:P.em,marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</label>
    {children}
  </div>
);

/* ── MODAL ───────────────────────────────────────────────────── */
function Modal({open,title,onClose,onSave,children}) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",backdropFilter:"blur(4px)"}} />
      <div onClick={e=>e.stopPropagation()}
        style={{position:"relative",width:"100%",maxWidth:480,background:P.white,borderRadius:"20px 20px 0 0",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 -8px 40px rgba(0,0,0,.25)"}}>
        <div style={{padding:"14px 16px 12px",borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:P.em,borderRadius:"20px 20px 0 0"}}>
          <span style={{color:P.white,fontWeight:800,fontSize:13}}>{title}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,color:P.white,width:28,height:28,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:16}}>{children}</div>
        {onSave && (
          <div style={{padding:"12px 16px",borderTop:`1px solid ${P.border}`,display:"flex",gap:8}}>
            <button onClick={onClose} style={{flex:1,padding:"9px 0",border:`1px solid ${P.border}`,borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",background:P.white,color:"#555"}}>Batal</button>
            <button onClick={onSave} style={{flex:2,padding:"9px 0",border:"none",borderRadius:10,fontSize:12,fontWeight:800,cursor:"pointer",background:P.em,color:P.white}}>Simpan Perubahan</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── CONFIRM DELETE ──────────────────────────────────────────── */
function DelDlg({open,label,onClose,onConfirm}) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:60,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)"}} />
      <div onClick={e=>e.stopPropagation()} style={{position:"relative",background:P.white,borderRadius:16,padding:20,width:"100%",maxWidth:300,textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,.3)"}}>
        <div style={{fontSize:36,marginBottom:8}}>🗑️</div>
        <p style={{fontWeight:800,fontSize:14,margin:"0 0 4px",color:"#1F2937"}}>Hapus data ini?</p>
        {label && <p style={{fontSize:11,color:"#6B7280",margin:"0 0 16px"}}>{label}</p>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"8px 0",border:`1px solid ${P.border}`,borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",background:P.white}}>Batal</button>
          <button onClick={onConfirm} style={{flex:1,padding:"8px 0",border:"none",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",background:"#DC2626",color:P.white}}>Hapus</button>
        </div>
      </div>
    </div>
  );
}

// GANTI KOMPONEN BERANDA SEPENUHNYA
/* ── BERANDA ──────────────────────────────────────── */
function Beranda({info,setInfo}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(info);
  const countdown = useCountdown(info.tanggal, info.waktu);

  // Definisi input dan tipe data
  const fields = [
    ["namaPria","Nama Mempelai Pria", "text"],
    ["namaWanita","Nama Mempelai Wanita", "text"],
    ["tanggal","Hari & Tanggal Akad", "date"], 
    ["waktu","Waktu Akad (Misal: 08.00)", "text"],
    ["masjid","Nama Masjid", "text"],
    ["alamat","Alamat Masjid", "text"],
    ["wali","Wali Nikah", "text"],
    ["penghulu","Penghulu / Petugas KUA", "text"],
    ["mahar","Mas Kawin / Mahar", "text"],
    ["tema","Tema & Warna Pernikahan", "text"],
  ];
  const save = () => { setInfo(f); setOpen(false); };
  const open_ = () => { setF(info); setOpen(true); };

  const cBox = (num, label) => (
    <div style={{background:"rgba(0,0,0,0.15)", borderRadius:8, width:50, padding:"6px 0", textAlign:"center"}}>
      <p style={{margin:0, fontSize:16, fontWeight:900, color:P.white}}>{num}</p>
      <p style={{margin:0, fontSize:9, fontWeight:600, color:P.gold, textTransform:"uppercase"}}>{label}</p>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Hero */}
      <div style={{borderRadius:20,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,.15)"}}>
        <div style={{background:`linear-gradient(145deg,${P.em2} 0%,${P.em} 55%,${P.em3} 100%)`,padding:"28px 20px 20px",textAlign:"center",position:"relative"}}>
          <div style={{position:"absolute",inset:0,opacity:.07,backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A961' fill-opacity='1'%3E%3Cpath d='M30 0l8.66 5v10L30 20l-8.66-5V5zM0 20l8.66 5v10L0 40l-8.66-5V25zM60 20l8.66 5v10L60 40l-8.66-5V25z'/%3E%3C/g%3E%3C/svg%3E\")"}} />
          <div style={{fontSize:32,marginBottom:6}}>🕌</div>
          <p style={{color:"rgba(255,255,255,.6)",fontSize:9,letterSpacing:".2em",textTransform:"uppercase",margin:"0 0 8px",fontWeight:600}}>Walimatul &lsquo;Urs</p>
          {info.namaPria || info.namaWanita ? (
            <>
              <h2 style={{color:P.white,fontSize:22,fontWeight:900,margin:"0 0 2px",fontFamily:"Georgia,serif"}}>{info.namaPria||"—"}</h2>
              <p style={{color:P.gold,fontSize:18,margin:"2px 0",fontFamily:"Georgia,serif"}}>&amp;</p>
              <h2 style={{color:P.white,fontSize:22,fontWeight:900,margin:"0 0 8px",fontFamily:"Georgia,serif"}}>{info.namaWanita||"—"}</h2>
            </>
          ) : (
            <p style={{color:"rgba(255,255,255,.35)",fontStyle:"italic",margin:"0 0 8px",fontSize:14}}>Isi nama mempelai</p>
          )}
          {info.tanggal && <p style={{color:P.gold,fontSize:11,margin:"0 0 2px",fontWeight:600}}>{formatTanggal(info.tanggal)}{info.waktu && ` · ${info.waktu}`}</p>}
          {info.masjid  && <p style={{color:"rgba(255,255,255,.7)",fontSize:11,margin:0}}>{info.masjid}</p>}

          {/* WIDGET HITUNG MUNDUR DENGAN GRACEFUL DEGRADATION */}
          {info.tanggal && (
            <div style={{marginTop:16, paddingTop:16, borderTop:`1px solid rgba(255,255,255,0.15)`}}>
              {countdown.error ? (
                <div style={{padding:"8px 12px", background:"rgba(254, 226, 226, 0.15)", borderRadius:8, display:"inline-block"}}>
                    <p style={{color:P.goldL, fontSize:11, margin:0, fontWeight:700}}>⚠️ Kalibrasi Ulang Dibutuhkan</p>
                    <p style={{color:P.white, fontSize:10, margin:"4px 0 0"}}>Tekan "Edit Info" dan pilih ulang tanggal lewat kalender.</p>
                </div>
              ) : countdown.isPast ? (
                <p style={{color:P.gold, fontSize:12, fontWeight:700, margin:0, letterSpacing:".05em"}}>Hari Bahagia Telah Tiba!</p>
              ) : (
                <div style={{display:"flex", gap:8, justifyContent:"center"}}>
                  {cBox(countdown.months, "Bulan")}
                  <div style={{color:P.goldL, fontSize:16, fontWeight:800, marginTop:4}}>:</div>
                  {cBox(countdown.days, "Hari")}
                  <div style={{color:P.goldL, fontSize:16, fontWeight:800, marginTop:4}}>:</div>
                  {cBox(countdown.hours, "Jam")}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{background:P.em2,padding:"10px 16px",display:"flex",justifyContent:"flex-end"}}>
          <button onClick={open_} style={{background:P.gold,color:P.em2,border:"none",borderRadius:8,padding:"5px 14px",fontSize:11,fontWeight:800,cursor:"pointer"}}>✏️ Edit Info</button>
        </div>
      </div>

      {/* Info rows */}
      <Card>
        <div style={{padding:"10px 14px 8px",background:P.cream,borderBottom:`1px solid ${P.border}`}}>
          <span style={{fontSize:11,fontWeight:800,color:P.em}}>INFORMASI UTAMA</span>
        </div>
        {fields.map(([k,lbl]) => (
          <div key={k} style={{display:"flex",gap:10,padding:"8px 14px",borderBottom:`1px solid ${P.cream}`}}>
            <span style={{width:130,flexShrink:0,fontSize:11,color:"#9CA3AF"}}>{lbl}</span>
            <span style={{fontSize:11,fontWeight:600,color:info[k]?"#1F2937":"#D1D5DB",fontStyle:info[k]?"normal":"italic"}}>
              {k === 'tanggal' ? (info[k] ? formatTanggal(info[k]) : "—") : (info[k]||"—")}
            </span>
          </div>
        ))}
      </Card>

      <Modal open={open} title="Edit Informasi Pernikahan" onClose={()=>setOpen(false)} onSave={save}>
        {fields.map(([k,lbl,type])=>(
          <Fld key={k} label={lbl}>
            <input 
              style={inp} 
              type={type} 
              value={f[k]||""} 
              onChange={e=>setF({...f,[k]:e.target.value})} 
            />
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
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Progress */}
      <Card>
        <div style={{padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <p style={{margin:"0 0 2px",fontSize:11,color:"#9CA3AF"}}>Progres Persiapan</p>
              <p style={{margin:0,fontSize:20,fontWeight:900,color:P.em}}>{pct}%</p>
            </div>
            <div style={{textAlign:"right"}}>
              <p style={{margin:0,fontSize:24,fontWeight:900,color:P.gold}}>{done}</p>
              <p style={{margin:0,fontSize:10,color:"#9CA3AF"}}>dari {data.length} tugas</p>
            </div>
          </div>
          <div style={{height:6,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${P.em},${P.gold})`,borderRadius:99,transition:"width .4s"}} />
          </div>
          <div style={{display:"flex",gap:12,marginTop:8}}>
            {["Belum","Proses","Selesai"].map(s=>(
              <span key={s} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#6B7280"}}>
                <span style={{width:8,height:8,borderRadius:99,background:(SC[s]||["#ccc"])[1],display:"inline-block"}} />
                {data.filter(i=>i.status===s).length} {s}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <SectionHeader title="Daftar Tugas" onAdd={openAdd} />

      {Object.entries(groups).map(([waktu,items])=>(
        <div key={waktu}>
          <p style={{fontSize:10,fontWeight:800,color:P.gold,margin:"0 0 6px 2px",textTransform:"uppercase",letterSpacing:".06em"}}>⌛ {waktu}</p>
          <Card>
            {items.map((item,idx)=>(
              <div key={item.id} style={{display:"flex",gap:10,padding:"10px 12px",borderBottom:idx<items.length-1?`1px solid ${P.cream}`:"none",alignItems:"flex-start"}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{margin:"0 0 4px",fontSize:12,fontWeight:600,color:"#1F2937",lineHeight:1.4}}>{item.tugas}</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                    <Badge v={item.status} />
                    {item.pic && <span style={{fontSize:10,color:"#9CA3AF"}}>👤 {item.pic}</span>}
                  </div>
                  {item.catatan && <p style={{margin:"4px 0 0",fontSize:10,color:"#9CA3AF",fontStyle:"italic"}}>{item.catatan}</p>}
                </div>
                <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDel(item)} />
              </div>
            ))}
          </Card>
        </div>
      ))}

      <Modal open={!!m} title={m==="add"?"Tambah Tugas":"Edit Tugas"} onClose={()=>setM(null)} onSave={save}>
        <Fld label="Waktu"><input style={inp} value={f.waktu||""} onChange={e=>setF({...f,waktu:e.target.value})} placeholder="contoh: H-3 Bulan" /></Fld>
        <Fld label="Tugas / Persiapan"><textarea style={{...inp,minHeight:64,resize:"vertical"}} value={f.tugas||""} onChange={e=>setF({...f,tugas:e.target.value})} /></Fld>
        <Fld label="Penanggung Jawab"><input style={inp} value={f.pic||""} onChange={e=>setF({...f,pic:e.target.value})} /></Fld>
        <Fld label="Status">
          <select style={inp} value={f.status||"Belum"} onChange={e=>setF({...f,status:e.target.value})}>
            {["Belum","Proses","Selesai"].map(o=><option key={o}>{o}</option>)}
          </select>
        </Fld>
        <Fld label="Catatan"><textarea style={{...inp,minHeight:48,resize:"vertical"}} value={f.catatan||""} onChange={e=>setF({...f,catatan:e.target.value})} /></Fld>
      </Modal>
      <DelDlg open={!!del} label={del?.tugas} onClose={()=>setDel(null)} onConfirm={remove} />
    </div>
  );
}

/* ── ANGGARAN ──────────────────────────────────────── */
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
      <div style={{padding:"10px 8px",textAlign:"center"}}>
        <p style={{margin:"0 0 2px",fontSize:9,color:"#9CA3AF",textTransform:"uppercase",fontWeight:700}}>{lbl}</p>
        <p style={{margin:0,fontSize:11,fontWeight:900,color:clr,wordBreak:"break-all"}}>{prefix}{fmtRp(val)}</p>
      </div>
    </Card>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:8}}>
        {statCard("Estimasi",totEst,P.em)}
        {statCard("Aktual",totAkt,totAkt>totEst?"#DC2626":P.em)}
        {statCard("Selisih",Math.abs(sel),sel<0?"#DC2626":"#059669",sel<0?"−":"")}
      </div>

      {/* Budget bar */}
      {totEst > 0 && (
        <Card>
          <div style={{padding:"10px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:10,color:"#9CA3AF"}}>Realisasi anggaran</span>
              <span style={{fontSize:10,fontWeight:700,color:totAkt>totEst?"#DC2626":P.em}}>{Math.round(totAkt/totEst*100)}%</span>
            </div>
            <div style={{height:8,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min(totAkt/totEst*100,100)}%`,background:totAkt>totEst?"#DC2626":`linear-gradient(90deg,${P.em},${P.gold})`,borderRadius:99,transition:"width .4s"}} />
            </div>
          </div>
        </Card>
      )}

      <SectionHeader title="Rincian Biaya" onAdd={openAdd} />
      <Card>
        {data.map((item,idx)=>(
          <div key={item.id} style={{display:"flex",gap:10,padding:"10px 12px",borderBottom:idx<data.length-1?`1px solid ${P.cream}`:"none",alignItems:"flex-start"}}>
            <div style={{flex:1,minWidth:0}}>
              <p style={{margin:"0 0 4px",fontSize:12,fontWeight:700,color:"#1F2937"}}>{item.kategori}</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",fontSize:10,color:"#9CA3AF",marginBottom:4}}>
                <span>Est: <strong style={{color:"#374151"}}>{fmtRp(item.estimasi)}</strong></span>
                <span>Aktual: <strong style={{color:"#374151"}}>{fmtRp(item.aktual)}</strong></span>
              </div>
              <Badge v={item.statusBayar} />
              {item.catatan && <p style={{margin:"4px 0 0",fontSize:10,color:"#9CA3AF",fontStyle:"italic"}}>{item.catatan}</p>}
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
        <Fld label="Catatan"><textarea style={{...inp,minHeight:48,resize:"vertical"}} value={f.catatan||""} onChange={e=>setF({...f,catatan:e.target.value})} /></Fld>
      </Modal>
      <DelDlg open={!!del} label={del?.kategori} onClose={()=>setDel(null)} onConfirm={remove} />
    </div>
  );
}

/* ── VENDOR ────────────────────────────────────────── */
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
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:8}}>
        {[["Total",data.length,P.em],["Booked",booked,"#059669"],["Belum",data.length-booked,"#DC2626"]].map(([l,v,c])=>(
          <Card key={l} style={{flex:1}}>
            <div style={{padding:"10px 6px",textAlign:"center"}}>
              <p style={{margin:"0 0 2px",fontSize:9,color:"#9CA3AF",fontWeight:700,textTransform:"uppercase"}}>{l}</p>
              <p style={{margin:0,fontSize:20,fontWeight:900,color:c}}>{v}</p>
            </div>
          </Card>
        ))}
      </div>

      <SectionHeader title="Daftar Vendor" onAdd={openAdd} />
      <Card>
        {data.map((item,idx)=>(
          <div key={item.id} style={{display:"flex",gap:10,padding:"10px 12px",borderBottom:idx<data.length-1?`1px solid ${P.cream}`:"none",alignItems:"flex-start"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:3}}>
                <span style={{fontSize:12,fontWeight:800,color:P.em2}}>{item.kategori}</span>
                <Badge v={item.status} />
              </div>
              {item.nama && <p style={{margin:"0 0 2px",fontSize:11,fontWeight:600,color:"#374151"}}>{item.nama}</p>}
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {item.narahubung && <span style={{fontSize:10,color:"#9CA3AF"}}>👤 {item.narahubung}</span>}
                {item.telp && <span style={{fontSize:10,color:"#9CA3AF"}}>📞 {item.telp}</span>}
              </div>
              {item.catatan && <p style={{margin:"4px 0 0",fontSize:10,color:"#9CA3AF",fontStyle:"italic"}}>{item.catatan}</p>}
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
        <Fld label="Catatan"><textarea style={{...inp,minHeight:48,resize:"vertical"}} value={f.catatan||""} onChange={e=>setF({...f,catatan:e.target.value})} /></Fld>
      </Modal>
      <DelDlg open={!!del} label={del?.kategori} onClose={()=>setDel(null)} onConfirm={remove} />
    </div>
  );
}

/* ── RUNDOWN ───────────────────────────────────────── */
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
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <SectionHeader title="Rundown Akad Nikah" onAdd={openAdd} />
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",left:55,top:0,bottom:0,width:2,background:`linear-gradient(to bottom,${P.em},${P.gold})`,borderRadius:99}} />
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {data.map(item=>(
            <div key={item.id} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <div style={{width:48,textAlign:"right",flexShrink:0,paddingTop:2}}>
                <span style={{fontSize:10,fontWeight:800,color:P.gold}}>{item.waktu}</span>
              </div>
              <div style={{width:14,height:14,borderRadius:99,border:`2.5px solid ${P.em}`,background:P.white,flexShrink:0,marginTop:4,zIndex:1}} />
              <div style={{flex:1,background:P.white,borderRadius:12,border:`1px solid ${P.border}`,padding:"9px 10px",display:"flex",gap:8,alignItems:"flex-start"}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{margin:"0 0 3px",fontSize:12,fontWeight:700,color:"#1F2937",lineHeight:1.4}}>{item.acara}</p>
                  {item.pic && <p style={{margin:0,fontSize:10,color:"#9CA3AF"}}>👤 {item.pic}</p>}
                  {item.catatan && <p style={{margin:"3px 0 0",fontSize:10,color:P.goldD,fontStyle:"italic"}}>📌 {item.catatan}</p>}
                </div>
                <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDel(item)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={!!m} title={m==="add"?"Tambah Sesi":"Edit Sesi"} onClose={()=>setM(null)} onSave={save}>
        <Fld label="Waktu (contoh: 08.00)"><input style={inp} value={f.waktu||""} onChange={e=>setF({...f,waktu:e.target.value})} placeholder="07.30" /></Fld>
        <Fld label="Rangkaian Acara"><textarea style={{...inp,minHeight:64,resize:"vertical"}} value={f.acara||""} onChange={e=>setF({...f,acara:e.target.value})} /></Fld>
        <Fld label="Penanggung Jawab / Pengisi"><input style={inp} value={f.pic||""} onChange={e=>setF({...f,pic:e.target.value})} /></Fld>
        <Fld label="Catatan Khusus"><textarea style={{...inp,minHeight:48,resize:"vertical"}} value={f.catatan||""} onChange={e=>setF({...f,catatan:e.target.value})} /></Fld>
      </Modal>
      <DelDlg open={!!del} label={del?.acara} onClose={()=>setDel(null)} onConfirm={remove} />
    </div>
  );
}

/* ── TAMU ──────────────────────────────────────────── */
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
    return <div style={{width:34,height:34,borderRadius:99,background:P.em,color:P.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0}}>{ch}</div>;
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:8}}>
        {[["Tamu",data.length,P.em],["Est. Orang",totOrang,"#374151"],["Hadir",hadir,"#059669"]].map(([l,v,c])=>(
          <Card key={l} style={{flex:1}}>
            <div style={{padding:"10px 6px",textAlign:"center"}}>
              <p style={{margin:"0 0 2px",fontSize:9,color:"#9CA3AF",fontWeight:700,textTransform:"uppercase"}}>{l}</p>
              <p style={{margin:0,fontSize:20,fontWeight:900,color:c}}>{v}</p>
            </div>
          </Card>
        ))}
      </div>

      <div style={{display:"flex",gap:8}}>
        <input
          style={{...inp,flex:1}} placeholder="🔍  Cari nama tamu..."
          value={q} onChange={e=>setQ(e.target.value)}
        />
        <button onClick={openAdd} style={{background:P.em,color:P.white,border:"none",borderRadius:10,padding:"0 14px",fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>+ Tambah</button>
      </div>

      {filtered.length===0 ? (
        <Card><div style={{padding:28,textAlign:"center",color:"#9CA3AF",fontSize:12}}>{q?"Tamu tidak ditemukan 🔍":"Belum ada tamu. Tap + Tambah untuk menambahkan."}</div></Card>
      ) : (
        <Card>
          {filtered.map((item,idx)=>(
            <div key={item.id} style={{display:"flex",gap:10,padding:"10px 12px",borderBottom:idx<filtered.length-1?`1px solid ${P.cream}`:"none",alignItems:"center"}}>
              {avatar(item.nama)}
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:"0 0 3px",fontSize:12,fontWeight:700,color:"#1F2937"}}>{item.nama}</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                  <Badge v={item.konfirmasi} />
                  <span style={{fontSize:10,color:"#9CA3AF"}}>{item.pihak} · {item.jumlah} org</span>
                </div>
                {item.catatan && <p style={{margin:"3px 0 0",fontSize:10,color:"#9CA3AF",fontStyle:"italic"}}>{item.catatan}</p>}
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
        <Fld label="Catatan"><textarea style={{...inp,minHeight:48,resize:"vertical"}} value={f.catatan||""} onChange={e=>setF({...f,catatan:e.target.value})} /></Fld>
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

/* ── MAIN APP ──────────────────────────────────────── */
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

    // Mencegah aplikasi mengirim data berlebihan setiap kali mengetik
    const timeoutId = setTimeout(saveData, 1000); 
    return () => clearTimeout(timeoutId);
  }, [info, cl, ang, vnd, rd, tamu, rdy]);

  const done  = cl.filter(i=>i.status==="Selesai").length;
  const pct   = cl.length ? Math.round(done/cl.length*100) : 0;

  const section = ()=>{
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
    <div style={{minHeight:"100vh",background:P.cream,fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <style>{`*{box-sizing:border-box}body{margin:0}.hs::-webkit-scrollbar{display:none}.hs{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      {/* ── Header ── */}
      <div style={{position:"sticky",top:0,zIndex:40,background:P.em2,boxShadow:"0 2px 12px rgba(0,0,0,.3)"}}>
        {/* Top bar */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px 6px"}}>
          <span style={{fontSize:22}}>🕌</span>
          <div style={{flex:1}}>
            <p style={{margin:0,color:P.white,fontWeight:900,fontSize:13,letterSpacing:".01em"}}>
              {info.namaPria&&info.namaWanita ? `${info.namaPria} & ${info.namaWanita}` : "Walimatul 'Urs Planner"}
            </p>
            <p style={{margin:0,color:"rgba(255,255,255,.45)",fontSize:10}}>
              {info.masjid||"Wedding Planner Premium"}
            </p>
          </div>
          {/* Mini progress */}
          <div style={{textAlign:"right"}}>
            <p style={{margin:0,color:P.gold,fontSize:11,fontWeight:800}}>{pct}%</p>
            <p style={{margin:0,color:"rgba(255,255,255,.3)",fontSize:9}}>siap</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="hs" style={{display:"flex",overflowX:"auto",gap:4,padding:"0 10px 10px"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              display:"flex",alignItems:"center",gap:5,padding:"5px 12px",
              borderRadius:10,border:"none",cursor:"pointer",whiteSpace:"nowrap",
              fontSize:11,fontWeight:700,flexShrink:0,transition:"all .15s",
              background: tab===t.id ? P.gold : "rgba(255,255,255,.08)",
              color: tab===t.id ? P.em2 : "rgba(255,255,255,.6)",
            }}>
              <span style={{fontSize:14}}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{maxWidth:540,margin:"0 auto",padding:"14px 12px 48px"}}>
        {rdy ? section() : (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:200,gap:10}}>
            <div style={{width:36,height:36,border:`3px solid ${P.border}`,borderTop:`3px solid ${P.em}`,borderRadius:99,animation:"spin 1s linear infinite"}} />
            <p style={{color:"#9CA3AF",fontSize:12}}>Memuat data…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
      </div>
    </div>
  );
}
