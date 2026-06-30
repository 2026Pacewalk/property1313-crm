// Minimal diagnostic function — no imports, to isolate function-runtime issues.
export default function handler(_req: any, res: any) {
  res.status(200).json({ ok: true, ts: Date.now(), node: process.version });
}
