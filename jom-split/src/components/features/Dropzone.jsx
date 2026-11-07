import { useRef, useState } from 'react';
import Icon from '../ui/Icon.jsx';

/** Kawasan muat naik: seret-lepas atau pilih fail. Input sebenar boleh difokus dengan papan kekunci. */
export default function Dropzone({ onFile }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);

  const pick = (files) => { if (files?.[0]) onFile(files[0]); };
  return (
    <div
      className={`dropzone${over ? ' is-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files); }}
    >
      <span className="dropzone__icon"><Icon name="ImageUp" size={28} /></span>
      <h2 className="dropzone__title">Letak gambar resit di sini</h2>
      <p className="dropzone__hint">JPG, PNG, WebP atau HEIC. Maksimum 8 MB. Gambar tidak dihantar ke mana-mana dalam demo ini.</p>
      <span className="btn btn--primary btn--md" aria-hidden="true"><Icon name="Upload" /><span>Pilih gambar</span></span>
      <input
        ref={input}
        id="receipt-file"
        className="dropzone__input"
        type="file"
        accept="image/*"
        aria-label="Pilih gambar resit"
        onChange={(e) => { pick(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
