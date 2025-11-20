export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { address } = req.body || {};
  // basic in-memory store (ephemeral). Replace with DB in prod.
  if (!global._fid_waitlist) global._fid_waitlist = [];
  const id = global._fid_waitlist.length + 1;
  global._fid_waitlist.push({ id, address: address || null, ts: new Date().toISOString() });
  res.status(200).json({ ok: true, id });
}
