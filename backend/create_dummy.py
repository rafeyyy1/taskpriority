import pandas as pd
from datetime import datetime, timedelta
import random

# Generate 20 tasks for semester 4-6
mata_kuliah_list = [
    "Pemrograman Web", "Sistem Basis Data", "Jaringan Komputer",
    "Kecerdasan Buatan", "Rekayasa Perangkat Lunak", "Desain Antarmuka",
    "Manajemen Proyek TI", "Keamanan Siber", "Sistem Operasi", "Statistika"
]

tasks = [
    "Tugas Besar Akhir", "Makalah Kelompok", "Quiz", "Presentasi",
    "Laporan Praktikum", "Tugas Individu Mingguan", "Proyek Mini",
    "Review Jurnal", "Analisis Kasus", "Latihan Soal"
]

data = []
today = datetime.now()

for i in range(1, 21):
    mk = random.choice(mata_kuliah_list)
    nama = random.choice(tasks) + f" {mk}"
    
    # Deadline between -2 days (overdue) and +14 days
    days_offset = random.randint(-2, 14)
    deadline = today + timedelta(days=days_offset)
    
    # Bobot nilai 5% - 40%
    bobot = random.choice([5, 10, 15, 20, 25, 30, 40])
    
    # Kesulitan 1-5
    kesulitan = random.randint(1, 5)
    
    # Tipe (Individu / Kelompok)
    tipe = random.choice(["Individu", "Kelompok"])
    
    data.append({
        "Nama Tugas": nama,
        "Mata Kuliah": mk,
        "Deadline": deadline.strftime("%Y-%m-%d"),
        "Bobot Nilai": bobot,
        "Kesulitan": kesulitan,
        "Tipe": tipe
    })

df = pd.DataFrame(data)
df.to_excel("data/dummy_tasks.xlsx", index=False)
print("Dummy data created at data/dummy_tasks.xlsx")
