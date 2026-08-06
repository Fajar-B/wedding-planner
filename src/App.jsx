import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

/* ── KONFIGURASI SUPABASE ────────────────────────── */
// GANTI DENGAN URL DAN ANON KEY DARI PROJECT SUPABASE ANDA
const SUPABASE_URL = "https://rpqkfkrtmxhjnufwuotv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwcWtma3J0bXhoam51Znd1b3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5Mjc4MzAsImV4cCI6MjEwMTUwMzgzMH0.xLoympkxRmkWYSA7cYEM9Wp7h9cURSuU_OkquTDbumI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── PALETTE ─────────────────────────────────────── */
const P = {
  em: "#1F4E3D", em2: "#14352A", em3: "#2C6E54",
  gold: "#C9A961", goldL: "#F2E8CA", goldD: "#7A5C14",
  cream: "#FAF7F0", border: "#E6DFD2", white: "#FFFFFF",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  cardShadow: "0 1px 3px rgba(31,78,61,.06), 0 4px 16px rgba(31,78,61,.07)",
  deepShadow: "0 8px 32px rgba(20,53,42,.18), 0 2px 8px rgba(20,53,42,.12)",
};
 
/* ── STATUS COLORS ───────────────────────────────── */
const SC = {
  Belum:              ["#FFF1F1","#C0392B"],
  Proses:             ["#FFFBEB","#B45309"],
  Selesai:            ["#F0FFF4","#15803D"],
  "Belum Bayar":      ["#FFF1F1","#C0392B"],
  "DP/Sebagian":      ["#FFFBEB","#B45309"],
  Lunas:              ["#F0FFF4","#15803D"],
  "Belum Booking":    ["#FFF1F1","#C0392B"],
  "DP Terbayar":      ["#FFFBEB","#B45309"],
  "Sudah Booking":    ["#F0FFF4","#15803D"],
  "Belum Konfirmasi": ["#FFFBEB","#B45309"],
  Hadir:              ["#F0FFF4","#15803D"],
  "Tidak Hadir":      ["#FFF1F1","#C0392B"],
};
 
/* ── UTILS ───────────────────────────────────────── */
const fmtRp = n => "Rp\u00A0" + (Number(n)||0).toLocaleString("id-ID");
let _k = 9000; const nid = () => ++_k;
 
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
 
/* ══════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS  (UI redesign only)
══════════════════════════════════════════════════════ */
 
const Badge = ({v}) => {
  const [bg, tx] = SC[v] || ["#F5F5F4","#57534E"];
  return (
    <span style={{
      background:bg, color:tx,
      fontSize:10, fontWeight:700, letterSpacing:".03em",
      padding:"3px 9px", borderRadius:99,
      border:`1px solid ${tx}22`,
      whiteSpace:"nowrap", display:"inline-block",
      lineHeight:1.5,
    }}>{v}</span>
  );
};
 
const Card = ({children, style={}}) => (
  <div style={{
    background:P.white,
    borderRadius:18,
    border:`1px solid ${P.border}`,
    overflow:"hidden",
    boxShadow: P.cardShadow,
    ...style,
  }}>{children}</div>
);
 
const SectionHeader = ({title, onAdd, addLabel="+ Tambah"}) => (
  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", margin:"4px 0 10px"}}>
    <div style={{display:"flex", alignItems:"center", gap:9}}>
      <span style={{display:"block", width:3, height:18, background:`linear-gradient(to bottom,${P.gold},${P.em})`, borderRadius:99}} />
      <h3 style={{fontSize:13, fontWeight:700, color:P.em, margin:0, letterSpacing:".01em"}}>{title}</h3>
    </div>
    {onAdd && (
      <button onClick={onAdd} style={{
        background:`linear-gradient(135deg,${P.em},${P.em3})`,
        color:P.white, border:"none", borderRadius:99,
        padding:"6px 14px", fontSize:11, fontWeight:700,
        cursor:"pointer", letterSpacing:".03em",
        boxShadow:"0 2px 8px rgba(31,78,61,.3)",
        transition:"all .15s",
      }}>{addLabel}</button>
    )}
  </div>
);
 
const ActionBtns = ({onEdit, onDelete}) => (
  <div style={{display:"flex", gap:5, flexShrink:0}}>
    <button onClick={onEdit} title="Edit" style={{
      width:30, height:30, background:P.goldL,
      border:`1px solid ${P.gold}44`, borderRadius:9,
      cursor:"pointer", fontSize:13, display:"flex",
      alignItems:"center", justifyContent:"center",
      transition:"all .15s",
    }}>✏️</button>
    <button onClick={onDelete} title="Hapus" style={{
      width:30, height:30, background:"#FFF1F1",
      border:"1px solid #fca5a5", borderRadius:9,
      cursor:"pointer", fontSize:13, display:"flex",
      alignItems:"center", justifyContent:"center",
      transition:"all .15s",
    }}>🗑️</button>
  </div>
);
 
const inp = {
  width:"100%", border:`1.5px solid ${P.border}`,
  borderRadius:11, padding:"9px 13px",
  fontSize:13, fontFamily:"inherit",
  outline:"none", boxSizing:"border-box",
  background:P.white, color:P.text1,
  transition:"border-color .15s, box-shadow .15s",
};
 
const Fld = ({label, children}) => (
  <div style={{marginBottom:14}}>
    <label style={{
      display:"flex", alignItems:"center", gap:5,
      fontSize:10, fontWeight:800, color:P.em,
      marginBottom:6, textTransform:"uppercase",
      letterSpacing:".07em",
    }}>
      <span style={{width:4,height:4,borderRadius:99,background:P.gold,display:"inline-block"}}/>
      {label}
    </label>
    {children}
  </div>
);
 
/* ── MODAL ──────────────────────────────────────── */
function Modal({open, title, onClose, onSave, children}) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(10,18,14,.65)",backdropFilter:"blur(6px)"}} />
      <div onClick={e=>e.stopPropagation()} style={{
        position:"relative", width:"100%", maxWidth:500,
        background:P.white, borderRadius:"24px 24px 0 0",
        maxHeight:"92vh", display:"flex", flexDirection:"column",
        boxShadow: P.deepShadow,
      }}>
        {/* Drag handle */}
        <div style={{display:"flex",justifyContent:"center",paddingTop:10,paddingBottom:2}}>
          <span style={{width:36,height:4,borderRadius:99,background:P.border,display:"block"}}/>
        </div>
        {/* Header */}
        <div style={{
          padding:"12px 18px 14px",
          borderBottom:`1px solid ${P.border}`,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background:`linear-gradient(to right,${P.em2},${P.em})`,
          borderRadius:"20px 20px 0 0",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:3,height:16,background:P.gold,borderRadius:99,display:"block"}}/>
            <span style={{color:P.white,fontWeight:700,fontSize:13,letterSpacing:".02em"}}>{title}</span>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,.12)", border:"none",
            borderRadius:8, color:P.white, width:30, height:30,
            cursor:"pointer", fontSize:16, display:"flex",
            alignItems:"center", justifyContent:"center",
          }}>✕</button>
        </div>
        <div style={{overflowY:"auto", flex:1, padding:"16px 18px"}}>{children}</div>
        {onSave && (
          <div style={{padding:"12px 18px 18px", borderTop:`1px solid ${P.border}`, display:"flex", gap:10}}>
            <button onClick={onClose} style={{
              flex:1, padding:"10px 0",
              border:`1.5px solid ${P.border}`, borderRadius:12,
              fontSize:12, fontWeight:700, cursor:"pointer",
              background:P.white, color:P.text2,
            }}>Batal</button>
            <button onClick={onSave} style={{
              flex:2, padding:"10px 0", border:"none",
              borderRadius:12, fontSize:12, fontWeight:800,
              cursor:"pointer",
              background:`linear-gradient(135deg,${P.em},${P.em3})`,
              color:P.white,
              boxShadow:"0 2px 10px rgba(31,78,61,.35)",
            }}>Simpan Perubahan</button>
          </div>
        )}
      </div>
    </div>
  );
}
 
/* ── CONFIRM DELETE ─────────────────────────────── */
function DelDlg({open, label, onClose, onConfirm}) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:60,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(10,18,14,.6)",backdropFilter:"blur(6px)"}} />
      <div onClick={e=>e.stopPropagation()} style={{
        position:"relative", background:P.white,
        borderRadius:20, padding:"24px 22px",
        width:"100%", maxWidth:300, textAlign:"center",
        boxShadow: P.deepShadow,
      }}>
        <div style={{
          width:56,height:56,borderRadius:16,
          background:"#FFF1F1",border:"1.5px solid #fca5a5",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:26,margin:"0 auto 12px",
        }}>🗑️</div>
        <p style={{fontWeight:800,fontSize:15,margin:"0 0 6px",color:P.text1}}>Hapus data ini?</p>
        {label && <p style={{fontSize:12,color:P.text3,margin:"0 0 18px",lineHeight:1.4}}>{label}</p>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{
            flex:1,padding:"9px 0",
            border:`1.5px solid ${P.border}`,borderRadius:11,
            fontSize:12,fontWeight:700,cursor:"pointer",background:P.white,color:P.text2,
          }}>Batal</button>
          <button onClick={onConfirm} style={{
            flex:1,padding:"9px 0",border:"none",
            borderRadius:11,fontSize:12,fontWeight:700,cursor:"pointer",
            background:"linear-gradient(135deg,#DC2626,#B91C1C)",
            color:P.white,boxShadow:"0 2px 8px rgba(220,38,38,.3)",
          }}>Hapus</button>
        </div>
      </div>
    </div>
  );
}
 
/* ══════════════════════════════════════════════════
   BERANDA
══════════════════════════════════════════════════ */
function Beranda({info, setInfo}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(info);
  const fields = [
    ["namaPria","Nama Mempelai Pria"],["namaWanita","Nama Mempelai Wanita"],
    ["tanggal","Hari & Tanggal Akad"],["waktu","Waktu Akad"],
    ["masjid","Nama Masjid"],["alamat","Alamat Masjid"],
    ["wali","Wali Nikah"],["penghulu","Penghulu / Petugas KUA"],
    ["mahar","Mas Kawin / Mahar"],["tema","Tema & Warna Pernikahan"],
  ];
  const save = () => { setInfo(f); setOpen(false); };
  const open_ = () => { setF(info); setOpen(true); };
 
  /* geometric SVG pattern */
  const pattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='%23C9A961' fill-opacity='.13'%3E%3Cpolygon points='36,0 42,12 54,6 48,18 60,18 54,30 60,42 48,36 42,48 36,36 30,48 24,36 12,42 18,30 12,18 24,18 18,6 30,12'/%3E%3C/g%3E%3C/svg%3E")`;
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Hero */}
      <div style={{borderRadius:22,overflow:"hidden",boxShadow:P.deepShadow}}>
        <div style={{
          background:`linear-gradient(150deg,${P.em2} 0%,${P.em} 50%,${P.em3} 100%)`,
          padding:"32px 22px 24px", textAlign:"center", position:"relative",
        }}>
          <div style={{position:"absolute",inset:0,backgroundImage:pattern,backgroundSize:"72px 72px"}} />
          {/* Ornament top */}
          <div style={{position:"relative",zIndex:1}}>
            <p style={{
              color:P.gold, fontSize:20, margin:"0 0 4px",
              letterSpacing:".25em", fontWeight:300,
            }}>✦ ✦ ✦</p>
            <p style={{
              color:"rgba(255,255,255,.5)", fontSize:9,
              letterSpacing:".25em", textTransform:"uppercase",
              margin:"0 0 14px", fontWeight:600,
            }}>Walimatul &lsquo;Urs</p>
 
            {info.namaPria || info.namaWanita ? (
              <>
                <h2 style={{
                  color:P.white, fontSize:26, fontWeight:700,
                  margin:"0 0 2px",
                  fontFamily:"'Playfair Display',Georgia,serif",
                  textShadow:"0 2px 12px rgba(0,0,0,.2)",
                }}>{info.namaPria||"—"}</h2>
                <p style={{
                  color:P.gold, fontSize:22, margin:"4px 0",
                  fontFamily:"'Playfair Display',Georgia,serif",
                  fontStyle:"italic", letterSpacing:".05em",
                }}>&amp;</p>
                <h2 style={{
                  color:P.white, fontSize:26, fontWeight:700,
                  margin:"0 0 14px",
                  fontFamily:"'Playfair Display',Georgia,serif",
                  textShadow:"0 2px 12px rgba(0,0,0,.2)",
                }}>{info.namaWanita||"—"}</h2>
              </>
            ) : (
              <p style={{
                color:"rgba(255,255,255,.3)", fontStyle:"italic",
                margin:"0 0 14px", fontSize:14,
                fontFamily:"'Playfair Display',Georgia,serif",
              }}>Isi nama mempelai</p>
            )}
 
            {/* Thin gold divider */}
            <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",margin:"0 0 10px"}}>
              <span style={{flex:1,maxWidth:60,height:1,background:`linear-gradient(to right,transparent,${P.gold})`}}/>
              <span style={{color:P.gold,fontSize:8,letterSpacing:".15em"}}>◆</span>
              <span style={{flex:1,maxWidth:60,height:1,background:`linear-gradient(to left,transparent,${P.gold})`}}/>
            </div>
 
            {info.tanggal && (
              <p style={{color:P.gold,fontSize:11,margin:"0 0 3px",fontWeight:600,letterSpacing:".05em"}}>
                {info.tanggal}{info.waktu && ` · ${info.waktu}`}
              </p>
            )}
            {info.masjid && (
              <p style={{color:"rgba(255,255,255,.65)",fontSize:11,margin:0,letterSpacing:".02em"}}>{info.masjid}</p>
            )}
          </div>
        </div>
 
        {/* Edit bar */}
        <div style={{
          background:`linear-gradient(to right,${P.em2},#0D2318)`,
          padding:"11px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",
        }}>
          <span style={{color:"rgba(255,255,255,.3)",fontSize:9,letterSpacing:".12em",textTransform:"uppercase"}}>
            Wedding Planner Premium
          </span>
          <button onClick={open_} style={{
            background:`linear-gradient(135deg,${P.gold},#E8C97A)`,
            color:P.em2, border:"none", borderRadius:99,
            padding:"6px 16px", fontSize:11, fontWeight:800,
            cursor:"pointer", letterSpacing:".03em",
            boxShadow:`0 2px 10px ${P.gold}55`,
          }}>✏️ Edit Info</button>
        </div>
      </div>
 
      {/* Info rows */}
      <Card>
        <div style={{
          padding:"11px 16px 10px",
          borderBottom:`1px solid ${P.border}`,
          background:`linear-gradient(to right,${P.cream},${P.white})`,
          display:"flex",alignItems:"center",gap:7,
        }}>
          <span style={{width:3,height:14,background:P.gold,borderRadius:99,display:"block"}}/>
          <span style={{fontSize:10,fontWeight:800,color:P.em,letterSpacing:".1em"}}>INFORMASI UTAMA</span>
        </div>
        {fields.map(([k,lbl]) => (
          <div key={k} style={{
            display:"flex", gap:12, padding:"9px 16px",
            borderBottom:`1px solid ${P.cream}`,
            transition:"background .1s",
          }}>
            <span style={{
              width:136, flexShrink:0, fontSize:11,
              color:P.text3, paddingTop:1,
            }}>{lbl}</span>
            <span style={{
              fontSize:12, fontWeight:info[k]?600:400,
              color:info[k]?P.text1:"#C4BEB8",
              fontStyle:info[k]?"normal":"italic", flex:1,
            }}>{info[k]||"—"}</span>
          </div>
        ))}
      </Card>
 
      <Modal open={open} title="Edit Informasi Pernikahan" onClose={()=>setOpen(false)} onSave={save}>
        {fields.map(([k,lbl])=>(
          <Fld key={k} label={lbl}>
            <input style={inp} value={f[k]||""} onChange={e=>setF({...f,[k]:e.target.value})} />
          </Fld>
        ))}
      </Modal>
    </div>
  );
}
 
/* ══════════════════════════════════════════════════
   CHECKLIST
══════════════════════════════════════════════════ */
function Checklist({data, setData}) {
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
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Progress Card */}
      <div style={{
        background:`linear-gradient(135deg,${P.em2},${P.em})`,
        borderRadius:20, padding:"18px 18px 16px",
        boxShadow:P.deepShadow,
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <p style={{margin:"0 0 3px",fontSize:10,color:"rgba(255,255,255,.5)",letterSpacing:".08em",textTransform:"uppercase"}}>Progres Persiapan</p>
            <p style={{margin:0,fontSize:28,fontWeight:900,color:P.white,fontFamily:"'Playfair Display',Georgia,serif"}}>{pct}<span style={{fontSize:16,fontWeight:600}}>%</span></p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{margin:0,fontSize:30,fontWeight:900,color:P.gold,lineHeight:1}}>{done}</p>
            <p style={{margin:"2px 0 0",fontSize:10,color:"rgba(255,255,255,.4)"}}>dari {data.length} tugas</p>
          </div>
        </div>
        {/* Bar */}
        <div style={{height:8,background:"rgba(255,255,255,.12)",borderRadius:99,overflow:"hidden",marginBottom:10}}>
          <div style={{
            height:"100%",width:`${pct}%`,
            background:`linear-gradient(90deg,${P.gold},#E8D090)`,
            borderRadius:99,transition:"width .6s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
        <div style={{display:"flex",gap:14}}>
          {["Belum","Proses","Selesai"].map(s=>(
            <span key={s} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"rgba(255,255,255,.6)"}}>
              <span style={{
                width:7,height:7,borderRadius:99,
                background:(SC[s]||["","#ccc"])[1],
                display:"inline-block",flexShrink:0,
              }} />
              {data.filter(i=>i.status===s).length} {s}
            </span>
          ))}
        </div>
      </div>
 
      <SectionHeader title="Daftar Tugas" onAdd={openAdd} />
 
      {Object.entries(groups).map(([waktu,items])=>(
        <div key={waktu}>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:6,
            background:P.goldL,border:`1px solid ${P.gold}55`,
            borderRadius:99,padding:"3px 12px",margin:"0 0 8px 0",
          }}>
            <span style={{fontSize:9,color:P.goldD}}>⏳</span>
            <span style={{fontSize:10,fontWeight:800,color:P.goldD,letterSpacing:".06em"}}>{waktu}</span>
          </div>
          <Card>
            {items.map((item,idx)=>(
              <div key={item.id} style={{
                display:"flex",gap:12,padding:"12px 14px",
                borderBottom:idx<items.length-1?`1px solid ${P.cream}`:"none",
                alignItems:"flex-start",
              }}>
                {/* Status dot */}
                <div style={{
                  width:10,height:10,borderRadius:99,flexShrink:0,marginTop:4,
                  background:(SC[item.status]||["#ccc"])[1],
                  boxShadow:`0 0 0 3px ${(SC[item.status]||["#f0f0f0"])[0]}`,
                }} />
                <div style={{flex:1,minWidth:0}}>
                  <p style={{margin:"0 0 5px",fontSize:12.5,fontWeight:600,color:P.text1,lineHeight:1.45}}>{item.tugas}</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                    <Badge v={item.status} />
                    {item.pic && (
                      <span style={{fontSize:10,color:P.text3,display:"flex",alignItems:"center",gap:3}}>
                        <span style={{fontSize:9}}>👤</span>{item.pic}
                      </span>
                    )}
                  </div>
                  {item.catatan && <p style={{margin:"5px 0 0",fontSize:10,color:P.text3,fontStyle:"italic"}}>{item.catatan}</p>}
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
 
/* ══════════════════════════════════════════════════
   ANGGARAN
══════════════════════════════════════════════════ */
function Anggaran({data, setData}) {
  const [m, setM]     = useState(null);
  const [del, setDel] = useState(null);
  const [f, setF]     = useState({});
 
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
 
  const statCard = (lbl, val, clr, prefix="") => (
    <div key={lbl} style={{
      flex:1, background:P.white,
      borderRadius:16, border:`1px solid ${P.border}`,
      padding:"13px 10px", textAlign:"center",
      boxShadow:P.cardShadow,
    }}>
      <p style={{margin:"0 0 4px",fontSize:9,color:P.text3,textTransform:"uppercase",fontWeight:700,letterSpacing:".07em"}}>{lbl}</p>
      <p style={{margin:0,fontSize:11,fontWeight:800,color:clr,wordBreak:"break-all",lineHeight:1.3}}>{prefix}{fmtRp(val)}</p>
    </div>
  );
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10}}>
        {statCard("Estimasi", totEst, P.em)}
        {statCard("Aktual", totAkt, totAkt>totEst?"#B91C1C":P.em)}
        {statCard("Selisih", Math.abs(sel), sel<0?"#B91C1C":"#15803D", sel<0?"−":"")}
      </div>
 
      {/* Budget bar */}
      {totEst > 0 && (
        <Card>
          <div style={{padding:"12px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
              <span style={{fontSize:11,color:P.text3,fontWeight:500}}>Realisasi anggaran</span>
              <span style={{
                fontSize:11,fontWeight:800,
                color:totAkt>totEst?"#B91C1C":P.em,
                background:totAkt>totEst?"#FFF1F1":P.goldL,
                padding:"2px 8px",borderRadius:99,
              }}>{Math.round(totAkt/totEst*100)}%</span>
            </div>
            <div style={{height:10,background:P.cream,borderRadius:99,overflow:"hidden"}}>
              <div style={{
                height:"100%",
                width:`${Math.min(totAkt/totEst*100,100)}%`,
                background:totAkt>totEst
                  ?"linear-gradient(90deg,#DC2626,#EF4444)"
                  :`linear-gradient(90deg,${P.em},${P.gold})`,
                borderRadius:99, transition:"width .5s",
              }} />
            </div>
          </div>
        </Card>
      )}
 
      <SectionHeader title="Rincian Biaya" onAdd={openAdd} />
      <Card>
        {data.map((item,idx)=>(
          <div key={item.id} style={{
            display:"flex",gap:12,padding:"12px 14px",
            borderBottom:idx<data.length-1?`1px solid ${P.cream}`:"none",
            alignItems:"flex-start",
          }}>
            <div style={{flex:1,minWidth:0}}>
              <p style={{margin:"0 0 5px",fontSize:12.5,fontWeight:700,color:P.text1}}>{item.kategori}</p>
              <div style={{
                display:"flex",gap:3,padding:"4px 8px",
                background:P.cream, borderRadius:8,
                width:"fit-content", marginBottom:5,
                flexWrap:"wrap", gap:8,
              }}>
                <span style={{fontSize:10,color:P.text3}}>Est: <strong style={{color:P.text2,fontWeight:700}}>{fmtRp(item.estimasi)}</strong></span>
                <span style={{fontSize:10,color:P.text3}}>Aktual: <strong style={{color:P.text2,fontWeight:700}}>{fmtRp(item.aktual)}</strong></span>
              </div>
              <Badge v={item.statusBayar} />
              {item.catatan && <p style={{margin:"5px 0 0",fontSize:10,color:P.text3,fontStyle:"italic"}}>{item.catatan}</p>}
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
 
/* ══════════════════════════════════════════════════
   VENDOR
══════════════════════════════════════════════════ */
function Vendor({data, setData}) {
  const [m, setM]     = useState(null);
  const [del, setDel] = useState(null);
  const [f, setF]     = useState({});
 
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
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10}}>
        {[["Total Vendor",data.length,P.em,P.goldL,P.gold],["Terbooking",booked,"#15803D","#F0FFF4","#86EFAC"],["Belum",data.length-booked,"#B91C1C","#FFF1F1","#fca5a5"]].map(([l,v,c,bg,bd])=>(
          <div key={l} style={{
            flex:1, background:bg,
            borderRadius:16, border:`1px solid ${bd}55`,
            padding:"12px 8px", textAlign:"center",
          }}>
            <p style={{margin:"0 0 3px",fontSize:9,color:c,textTransform:"uppercase",fontWeight:700,letterSpacing:".06em",opacity:.7}}>{l}</p>
            <p style={{margin:0,fontSize:22,fontWeight:900,color:c}}>{v}</p>
          </div>
        ))}
      </div>
 
      <SectionHeader title="Daftar Vendor" onAdd={openAdd} />
      <Card>
        {data.map((item,idx)=>(
          <div key={item.id} style={{
            display:"flex", gap:12, padding:"12px 14px",
            borderBottom:idx<data.length-1?`1px solid ${P.cream}`:"none",
            alignItems:"flex-start",
            borderLeft: item.status==="Sudah Booking"?`3px solid #22C55E`
              : item.status==="DP Terbayar"?`3px solid ${P.gold}`
              : "3px solid transparent",
          }}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",marginBottom:5}}>
                <span style={{fontSize:12.5,fontWeight:800,color:P.em}}>{item.kategori}</span>
                <Badge v={item.status} />
              </div>
              {item.nama && (
                <p style={{margin:"0 0 3px",fontSize:12,fontWeight:600,color:P.text1}}>{item.nama}</p>
              )}
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {item.narahubung && <span style={{fontSize:10,color:P.text3}}>👤 {item.narahubung}</span>}
                {item.telp && <span style={{fontSize:10,color:P.text3}}>📞 {item.telp}</span>}
              </div>
              {item.catatan && <p style={{margin:"4px 0 0",fontSize:10,color:P.text3,fontStyle:"italic"}}>{item.catatan}</p>}
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
 
/* ══════════════════════════════════════════════════
   RUNDOWN
══════════════════════════════════════════════════ */
function Rundown({data, setData}) {
  const [m, setM]     = useState(null);
  const [del, setDel] = useState(null);
  const [f, setF]     = useState({});
 
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
 
  /* Highlight item ijab kabul */
  const isIjab = item => item.acara?.toLowerCase().includes("ijab");
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <SectionHeader title="Rundown Akad Nikah" onAdd={openAdd} />
      <div style={{position:"relative"}}>
        {/* Timeline gradient line */}
        <div style={{
          position:"absolute", left:60, top:8, bottom:8,
          width:2,
          background:`linear-gradient(to bottom,${P.gold}44,${P.em},${P.gold}44)`,
          borderRadius:99,
        }} />
 
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {data.map((item,idx)=>(
            <div key={item.id} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              {/* Time pill */}
              <div style={{
                width:52, flexShrink:0, textAlign:"center", paddingTop:9,
              }}>
                <span style={{
                  display:"inline-block",
                  background: isIjab(item) ? P.em : P.white,
                  color: isIjab(item) ? P.gold : P.goldD,
                  fontSize:10, fontWeight:800,
                  padding:"2px 5px", borderRadius:6,
                  border:`1px solid ${isIjab(item)?P.em:P.gold}44`,
                }}>{item.waktu}</span>
              </div>
 
              {/* Node dot */}
              <div style={{
                width: isIjab(item)?16:12,
                height: isIjab(item)?16:12,
                borderRadius:99,
                background: isIjab(item) ? P.gold : P.white,
                border:`2.5px solid ${isIjab(item)?P.gold:P.em}`,
                flexShrink:0,
                marginTop: isIjab(item)?7:9,
                zIndex:1,
                boxShadow: isIjab(item)?`0 0 0 3px ${P.gold}33`:"none",
              }} />
 
              {/* Card */}
              <div style={{
                flex:1,
                background: isIjab(item)?`linear-gradient(135deg,${P.em2},${P.em})`:`${P.white}`,
                borderRadius:14,
                border: isIjab(item)?`none`:`1px solid ${P.border}`,
                padding:"10px 13px",
                display:"flex", gap:10, alignItems:"flex-start",
                boxShadow: isIjab(item)?P.deepShadow:P.cardShadow,
              }}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{
                    margin:"0 0 4px", fontSize:12.5, fontWeight:700,
                    color: isIjab(item)?P.white:P.text1,
                    lineHeight:1.4,
                  }}>{item.acara}</p>
                  {item.pic && (
                    <p style={{margin:0,fontSize:10,color: isIjab(item)?"rgba(255,255,255,.6)":P.text3}}>
                      👤 {item.pic}
                    </p>
                  )}
                  {item.catatan && (
                    <div style={{
                      marginTop:6, padding:"4px 9px",
                      background: isIjab(item)?"rgba(201,169,97,.2)":P.goldL,
                      borderRadius:7, display:"inline-block",
                    }}>
                      <p style={{margin:0,fontSize:10,color: isIjab(item)?P.gold:P.goldD,fontStyle:"italic"}}>
                        📌 {item.catatan}
                      </p>
                    </div>
                  )}
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
 
/* ══════════════════════════════════════════════════
   TAMU
══════════════════════════════════════════════════ */
function Tamu({data, setData}) {
  const [m, setM]     = useState(null);
  const [del, setDel] = useState(null);
  const [f, setF]     = useState({});
  const [q, setQ]     = useState("");
 
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
 
  /* Avatar with colored initials */
  const AVATAR_COLORS = [
    [P.em2,P.gold],[P.em3,"#E0F2F7"],["#2D3A8C","#BAC8FF"],
    ["#7C3AED","#EDE9FE"],["#B45309","#FEF3C7"],
  ];
  const avatar = (nm, idx) => {
    const ch = (nm||"?")[0].toUpperCase();
    const [bg,tx] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
    return (
      <div style={{
        width:38, height:38, borderRadius:12,
        background:bg, color:tx,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:14, fontWeight:800, flexShrink:0,
        fontFamily:"'Playfair Display',Georgia,serif",
        boxShadow:`0 2px 8px ${bg}66`,
      }}>{ch}</div>
    );
  };
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10}}>
        {[["Total Tamu",data.length,P.em],["Est. Orang",totOrang,P.text2],["Hadir",hadir,"#15803D"]].map(([l,v,c])=>(
          <Card key={l} style={{flex:1}}>
            <div style={{padding:"12px 8px",textAlign:"center"}}>
              <p style={{margin:"0 0 3px",fontSize:9,color:P.text3,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>{l}</p>
              <p style={{margin:0,fontSize:22,fontWeight:900,color:c}}>{v}</p>
            </div>
          </Card>
        ))}
      </div>
 
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1,position:"relative"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:P.text3}}>🔍</span>
          <input
            style={{...inp,paddingLeft:34}}
            placeholder="Cari nama tamu..."
            value={q} onChange={e=>setQ(e.target.value)}
          />
        </div>
        <button onClick={openAdd} style={{
          background:`linear-gradient(135deg,${P.em},${P.em3})`,
          color:P.white, border:"none", borderRadius:11,
          padding:"0 16px", fontSize:11, fontWeight:800,
          cursor:"pointer", whiteSpace:"nowrap",
          boxShadow:"0 2px 8px rgba(31,78,61,.3)",
        }}>+ Tambah</button>
      </div>
 
      {filtered.length===0 ? (
        <Card>
          <div style={{padding:32, textAlign:"center"}}>
            <p style={{fontSize:28,margin:"0 0 6px"}}>👥</p>
            <p style={{fontSize:13,color:P.text3,margin:0}}>
              {q?"Tamu tidak ditemukan":"Belum ada tamu undangan."}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          {filtered.map((item,idx)=>(
            <div key={item.id} style={{
              display:"flex", gap:12, padding:"12px 14px",
              borderBottom:idx<filtered.length-1?`1px solid ${P.cream}`:"none",
              alignItems:"center",
            }}>
              {avatar(item.nama, idx)}
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:"0 0 4px",fontSize:12.5,fontWeight:700,color:P.text1}}>{item.nama}</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                  <Badge v={item.konfirmasi} />
                  <span style={{fontSize:10,color:P.text3}}>{item.pihak} · {item.jumlah} orang</span>
                </div>
                {item.catatan && <p style={{margin:"4px 0 0",fontSize:10,color:P.text3,fontStyle:"italic"}}>{item.catatan}</p>}
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
 
/* ── TABS CONFIG ─────────────────────────────────── */
const TABS = [
  {id:"beranda",  icon:"🕌", label:"Beranda"},
  {id:"checklist",icon:"✅", label:"Checklist"},
  {id:"anggaran", icon:"💰", label:"Anggaran"},
  {id:"vendor",   icon:"🤝", label:"Vendor"},
  {id:"rundown",  icon:"📋", label:"Rundown"},
  {id:"tamu",     icon:"👥", label:"Tamu"},
];
 
/* ══════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════ */
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
 
    return () => { supabase.removeChannel(channel); };
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
 
  const done = cl.filter(i=>i.status==="Selesai").length;
  const pct  = cl.length ? Math.round(done/cl.length*100) : 0;
 
  const section = () => {
    switch(tab){
      case "beranda":   return <Beranda  info={info}  setInfo={setInfo} />;
      case "checklist": return <Checklist data={cl}   setData={setCl}   />;
      case "anggaran":  return <Anggaran  data={ang}  setData={setAng}  />;
      case "vendor":    return <Vendor    data={vnd}  setData={setVnd}  />;
      case "rundown":   return <Rundown   data={rd}   setData={setRd}   />;
      case "tamu":      return <Tamu      data={tamu} setData={setTamu} />;
    }
  };
 
  return (
    <div style={{minHeight:"100vh",background:P.cream,fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&display=swap');
        *{box-sizing:border-box}
        body{margin:0}
        .hs::-webkit-scrollbar{display:none}
        .hs{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        input:focus,select:focus,textarea:focus{
          outline:none!important;
          border-color:#1F4E3D!important;
          box-shadow:0 0 0 3px rgba(31,78,61,.12)!important;
        }
      `}</style>
 
      {/* ══ HEADER ══ */}
      <div style={{
        position:"sticky", top:0, zIndex:40,
        background:P.em2,
        boxShadow:"0 4px 24px rgba(10,25,18,.35)",
      }}>
        {/* Top bar */}
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px 8px"}}>
          {/* Mosque icon with gold ring */}
          <div style={{
            width:36, height:36, borderRadius:10,
            background:`linear-gradient(135deg,${P.em3},${P.em})`,
            border:`1.5px solid ${P.gold}55`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18, flexShrink:0,
          }}>🕌</div>
 
          <div style={{flex:1,minWidth:0}}>
            <p style={{
              margin:0, color:P.white, fontWeight:700, fontSize:13,
              letterSpacing:".01em", fontFamily:"'Playfair Display',Georgia,serif",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}>
              {info.namaPria&&info.namaWanita
                ? `${info.namaPria} & ${info.namaWanita}`
                : "Walimatul 'Urs Planner"}
            </p>
            <p style={{
              margin:0, color:"rgba(255,255,255,.38)",
              fontSize:10, letterSpacing:".01em",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}>
              {info.masjid||"Wedding Planner Premium"}
              {info.tanggal&&<span style={{color:`${P.gold}88`}}> · {info.tanggal}</span>}
            </p>
          </div>
 
          {/* Progress pill */}
          <div style={{
            background:"rgba(255,255,255,.07)",
            border:`1px solid ${P.gold}33`,
            borderRadius:10, padding:"5px 11px", textAlign:"center", flexShrink:0,
          }}>
            <p style={{margin:0,color:P.gold,fontSize:13,fontWeight:800,lineHeight:1}}>{pct}%</p>
            <p style={{margin:0,color:"rgba(255,255,255,.28)",fontSize:8,letterSpacing:".06em"}}>SIAP</p>
          </div>
        </div>
 
        {/* Gold separator */}
        <div style={{height:1,background:`linear-gradient(to right,transparent,${P.gold}44,transparent)`,margin:"0 16px"}}/>
 
        {/* Tabs */}
        <div className="hs" style={{display:"flex",overflowX:"auto",gap:3,padding:"8px 12px 12px"}}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"7px 13px", borderRadius:12,
                border: active ? `1px solid ${P.gold}66` : "1px solid transparent",
                cursor:"pointer", whiteSpace:"nowrap",
                fontSize:11, fontWeight:active?700:500,
                flexShrink:0, transition:"all .18s",
                background: active
                  ? `linear-gradient(135deg,${P.goldD}22,${P.gold}18)`
                  : "rgba(255,255,255,.05)",
                color: active ? P.gold : "rgba(255,255,255,.5)",
              }}>
                <span style={{fontSize:14}}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
 
      {/* ══ CONTENT ══ */}
      <div style={{maxWidth:560,margin:"0 auto",padding:"16px 14px 56px"}}>
        {rdy ? (
          <div style={{animation:"fadeUp .3s ease both"}}>{section()}</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:240,gap:14}}>
            {/* Elegant spinner */}
            <div style={{position:"relative",width:44,height:44}}>
              <div style={{
                position:"absolute",inset:0,
                border:`3px solid ${P.border}`,
                borderTop:`3px solid ${P.gold}`,
                borderRadius:99,
                animation:"spin 1s cubic-bezier(.6,.1,.4,.9) infinite",
              }}/>
              <div style={{
                position:"absolute",inset:8,
                border:`2px solid transparent`,
                borderTop:`2px solid ${P.em}66`,
                borderRadius:99,
                animation:"spin .7s linear infinite reverse",
              }}/>
            </div>
            <div style={{textAlign:"center"}}>
              <p style={{color:P.em,fontSize:13,fontWeight:600,margin:"0 0 2px",fontFamily:"'Playfair Display',Georgia,serif"}}>Memuat data…</p>
              <p style={{color:P.text3,fontSize:10,margin:0,letterSpacing:".05em"}}>Terhubung ke Supabase</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}