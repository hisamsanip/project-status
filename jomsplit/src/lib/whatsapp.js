import { formatRM } from './money.js';

export function buildMessage(bill, { title, charges }) {
  const out = [`*${title || 'JomSplit'}* 🧾`, ''];
  out.push(`Makanan: ${formatRM(bill.subtotal)}`);
  if (bill.sst) out.push(`SST ${charges.sst}%: ${formatRM(bill.sst)}`);
  if (bill.service) out.push(`Servis ${charges.service}%: ${formatRM(bill.service)}`);
  if (bill.discount) out.push(`Diskaun: ${formatRM(-bill.discount)}`);
  out.push(`*JUMLAH: ${formatRM(bill.total)}*`, '');
  for (const row of bill.rows.filter((r) => r.total)) out.push(personBlock(row), '');
  if (bill.unassigned) out.push(`⚠️ ${formatRM(bill.unassigned)} makanan belum ditetapkan`, '');
  out.push('_Dikira dengan JomSplit_');
  return out.join('\n');
}

export function personBlock(row) {
  const lines = [`*${row.person.name} — ${formatRM(row.total)}*`];
  for (const l of row.lines) lines.push(`• ${l.name}${l.sharedWith > 1 ? ` (kongsi ${l.sharedWith})` : ''}: ${formatRM(l.amount)}`);
  if (row.extras) lines.push(`• Cukai/servis: ${formatRM(row.extras, { sign: true })}`);
  return lines.join('\n');
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
