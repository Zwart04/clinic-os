export const PRODUCTS = {
  "clinic-os": {
    "accent": "#72a8d4",
    "currency": "IDR",
    "tagline": "A clearer day for your clinic.",
    "modules": [
      {
        "key": "patients",
        "label": "Pasien",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "code",
            "label": "Kode pasien",
            "type": "text",
            "required": true
          },
          {
            "key": "birth_date",
            "label": "Tanggal lahir",
            "type": "date"
          },
          {
            "key": "phone",
            "label": "Nomor telepon",
            "type": "text"
          },
          {
            "key": "address",
            "label": "Alamat",
            "type": "textarea"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "staff",
        "label": "Staf",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "email",
            "label": "Email",
            "type": "email"
          },
          {
            "key": "role",
            "label": "Jabatan",
            "type": "text"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "rooms",
        "label": "Ruangan",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "appointments",
        "label": "Janji temu",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "patient_id",
            "label": "Pasien",
            "type": "ref",
            "ref": "patients",
            "required": true
          },
          {
            "key": "staff_id",
            "label": "Staf",
            "type": "ref",
            "ref": "staff",
            "required": true
          },
          {
            "key": "room_id",
            "label": "Ruangan",
            "type": "ref",
            "ref": "rooms",
            "required": false
          },
          {
            "key": "start",
            "label": "Mulai",
            "type": "datetime",
            "required": true
          },
          {
            "key": "end",
            "label": "Selesai",
            "type": "datetime",
            "required": true
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "scheduled",
          "checked_in",
          "done",
          "cancelled"
        ],
        "actions": [
          "appointment-encounter"
        ]
      },
      {
        "key": "encounters",
        "label": "Kunjungan",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "patient_id",
            "label": "Pasien",
            "type": "ref",
            "ref": "patients",
            "required": true
          },
          {
            "key": "appointment_id",
            "label": "Janji temu",
            "type": "ref",
            "ref": "appointments",
            "required": false
          },
          {
            "key": "date",
            "label": "Tanggal",
            "type": "date",
            "required": true
          },
          {
            "key": "notes",
            "label": "Catatan kunjungan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "open",
          "closed"
        ]
      },
      {
        "key": "prescriptions",
        "label": "Catatan resep",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "encounter_id",
            "label": "Kunjungan",
            "type": "ref",
            "ref": "encounters",
            "required": true
          },
          {
            "key": "body",
            "label": "Rincian resep dari tenaga klinis",
            "type": "textarea",
            "required": true
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "supplies",
        "label": "Persediaan",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "stock",
            "label": "Stok",
            "type": "number",
            "min": 0
          },
          {
            "key": "unit",
            "label": "Satuan",
            "type": "text"
          },
          {
            "key": "expiry",
            "label": "Kadaluarsa",
            "type": "date"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "invoices",
        "label": "Tagihan",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "patient_id",
            "label": "Pasien",
            "type": "ref",
            "ref": "patients",
            "required": true
          },
          {
            "key": "encounter_id",
            "label": "Kunjungan",
            "type": "ref",
            "ref": "encounters",
            "required": false
          },
          {
            "key": "amount",
            "label": "Jumlah",
            "type": "money"
          },
          {
            "key": "due_date",
            "label": "Jatuh tempo",
            "type": "date"
          }
        ],
        "statuses": [
          "unpaid",
          "paid",
          "void"
        ]
      },
      {
        "key": "referrals",
        "label": "Rujukan",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "patient_id",
            "label": "Pasien",
            "type": "ref",
            "ref": "patients",
            "required": true
          },
          {
            "key": "destination",
            "label": "Tujuan",
            "type": "text"
          },
          {
            "key": "date",
            "label": "Tanggal",
            "type": "date",
            "required": true
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "followups",
        "label": "Tindak lanjut",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "patient_id",
            "label": "Pasien",
            "type": "ref",
            "ref": "patients",
            "required": true
          },
          {
            "key": "date",
            "label": "Tanggal",
            "type": "date",
            "required": true
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "planned",
          "done"
        ]
      },
      {
        "key": "calendar",
        "label": "Kalender klinik",
        "tool": "calendar",
        "fields": []
      },
      {
        "key": "reports",
        "label": "Laporan",
        "tool": "reports",
        "fields": [],
        "statuses": []
      }
    ],
    "id": "clinic-os",
    "name": "ClinicOS",
    "purpose": "Administrasi klinik dengan rekam kegiatan, jadwal, stok dan tagihan; akses data berdasarkan workspace.",
    "sources": [
      "clinic-os"
    ],
    "workflow": "Pasien → janji temu tanpa bentrok → kunjungan → catatan/resep → tagihan → tindak lanjut; pemisahan akses antar-workspace diuji."
  }
};
