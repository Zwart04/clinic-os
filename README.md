# ClinicOS

Administrasi klinik dengan rekam kegiatan, jadwal, stok dan tagihan; akses data berdasarkan workspace.

**Online:** https://clinic-os-app.zwart.qzz.io/

## Product workflow

Register with an email and a password of at least 12 characters. Save the recovery code, create an empty workspace, then create your own records. Owner/editor/viewer roles are enforced by the server. Invite links are limited to the specified email. Deleted records can be restored from Settings; referenced records cannot be removed until their dependencies are resolved.

No demo records, seeded business data, fake login, simulated API success, or hard-coded metrics are included. The interface derives its counts and activity from Cloudflare D1. External providers report an error if unavailable.

## Integrated modules

- Pasien
- Staf
- Ruangan
- Janji temu
- Kunjungan
- Catatan resep
- Persediaan
- Tagihan
- Rujukan
- Tindak lanjut
- Kalender klinik
- Laporan

## Run and build

Requires Node.js 24.

```sh
npm ci
npm test
npm run build
```

`npm run dev` previews the frontend. Account and record operations require the Cloudflare backend service binding; a standalone static preview does not pretend to provide a backend.

## Deployment and data

Cloudflare Workers serves the application and forwards `/api` through a private service binding to `zwart04-platform-v2`. That worker uses the free-tier D1 database and Workers AI where applicable. Backend source, schema, integration tests and deployment instructions are maintained in [zwart04-projects](https://github.com/Zwart04/zwart04-projects). Deploy that backend first, then run `npx wrangler deploy` here after configuring your own Cloudflare account and domain. Never put the backend PEPPER secret in GitHub or frontend code.

Free services have quotas. AI is limited to 5 requests per account and 40 globally each day. No automatic paid upgrade is enabled. Back up workspace data from Settings.

## Consolidation and recovery

This is one rebuilt application with one workspace flow, rather than a launcher for previous variants. The pre-rebuild Git histories are preserved in the single [unified recovery backup](https://github.com/Zwart04/zwart04-projects/releases/tag/unified-rebuild-backup). See PLAN.md for scope and verified behavior.
