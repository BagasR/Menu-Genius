from flask import Flask, render_template, request, jsonify
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from joblib import load

app = Flask(__name__, static_url_path='/static')
model = None

# Read data nama restoran from CSV
nama_restoran_df = pd.read_csv('nama_restoran.csv')

# Mapping Dictionaries untuk kecamatan, jenis restoran, kabupaten, dan rating
peta_kecamatan = {"1": "Syiah Kuala", "2": "Kuta Alam", "3": "Banda Raya", "4": "Meuraxa"}
peta_cr_angka = {"1": "restoran", "2": "cafe"}
peta_kabupaten = {"1": "Banda Aceh", "2": "Aceh Besar"}
peta_reting = {"1.0": "1", "2.0": "2", "3.0": "3", "4.0": "4", "5.0": "5"}

# Membuat kamus yang berisi nama restoran, alamat, dan hasil prediksi
nama_restoran_peta = {}
for index, row in nama_restoran_df.iterrows():
    hasil_prediksi = row['hasil_prediksi']
    nama_restoran = row['nama_restoran']
    menu_makanan = row['menu_makanan']
    alamat = row['alamat']
    kecamatan = row['kecamatan']
    kabupaten = row['kabupaten']
    crangka = row['crangka']
    harga = row['harga']
    reting = row['reting']
    nama_restoran_peta[hasil_prediksi] = {
        'nama_restoran': nama_restoran,
        'menu_makanan': menu_makanan,
        'kecamatan': kecamatan,
        'kabupaten': kabupaten,
        'crangka': crangka,
        'alamat': alamat,
        'harga': harga,
        'reting': reting
    }

# Routes
@app.route("/")
def beranda():
    return render_template('index.html')

#API deteksi
@app.route("/api/deteksi", methods=['POST'])
def apiDeteksi():
    if request.method == 'POST':
        input_harga_rata = str(request.form['Harga_Rata-rata'])
        input_rating = float(request.form['rating'])
        input_kecamatan = str(request.form['kecamatan'])
        input_kabupaten = str(request.form['kabupaten'])
        input_cr_angka = str(request.form['crangka'])

        # Nilai default untuk variabel input atau features (X) ke model
        if input_harga_rata == "Harga_Rata-rata":
            input_harga_rata = "15000"
        if input_rating == "rating":
            input_rating = 4.6
        if input_kecamatan == "kecamatan":
            input_kecamatan = "2"
        if input_kabupaten == "kabupaten":
            input_kabupaten = "2"
        if input_cr_angka == "crangka":
            input_cr_angka = "2"

        # Load data ke dalam DataFrame
        df = pd.DataFrame(data={
            "Harga_Rata": [input_harga_rata],
            "rating": [input_rating],
            "kecamatan": [input_kecamatan],
            "kabupaten": [input_kabupaten],
            "CR_Angka": [input_cr_angka]
        })

        # Melakukan prediksi dengan model machine learning
        hasil_prediksi = model.predict(df[0:1])[0]


        # menetapkan suatu batas atau ambang nilai
        threshold = 0.5
        if hasil_prediksi < threshold:
            return jsonify({
                "prediksi": "Tidak memenuhi threshold",
                "info_kecamatan": peta_kecamatan.get(input_kecamatan, {}),
                "info_kabupaten": peta_kabupaten.get(input_kabupaten, {}),
                "info_crangka": peta_cr_angka.get(input_cr_angka, {}),
                "info_reting": peta_cr_angka.get(input_rating, {}),
                "rekomendasi_restoran": []
            })
        
         # Cari nama restoran dan alamat sesuai dengan hasil prediksi dari peta
        restoran_info = nama_restoran_peta.get(hasil_prediksi, {})
        nama_restoran = restoran_info.get('nama_restoran', 'Restoran tidak ditemukan')
        menu_makanan = restoran_info.get('menu_makanan', 'menu makananan tidak ditemukan')
        alamat = restoran_info.get('alamat', 'Alamat tidak ditemukan')
        harga = restoran_info.get('harga', 'Harga tidak ditemukan')


         # Mengambil nilai input lainnya dari peta
        input_harga = float(input_harga_rata)
        input_kecamatan = peta_kecamatan.get(input_kecamatan)
        input_kabupaten = peta_kabupaten.get(input_kabupaten)
        input_cr_angka = peta_cr_angka.get(input_cr_angka)

        # Memfilter dataframe data CSV nama_restoran
        filtered_restaurants = nama_restoran_df[
            (nama_restoran_df['harga'] <= input_harga + 10000) &
            (nama_restoran_df['harga'] >= input_harga - 10000) &
            (nama_restoran_df['reting'] == input_rating) &
            (nama_restoran_df['kecamatan'] == input_kecamatan) & 
            (nama_restoran_df['kabupaten'] == input_kabupaten) & 
            (nama_restoran_df['crangka'] == input_cr_angka)
        ]

        # inisialisasi list  untuk menyimpan rekomendasi restoran
        rekomendasi_restoran = []
        # Iterasi Melalui Hasil Filter
        for index, row in filtered_restaurants.iterrows():
            if row['hasil_prediksi'] != hasil_prediksi:
                rekomendasi_restoran.append({
                    'nama_restoran': row['nama_restoran'],
                    'menu_makanan': row['menu_makanan'],
                    'alamat': row['alamat'],
                    'kecamatan': row['kecamatan'],
                    'kabupaten': row['kabupaten'],
                    'crangka': row['crangka'],
                    'reting': row['reting'],
                    'harga': row['harga']
                })
                # Batasi jumlah rekomendasi hingga 20 restoran
                if len(rekomendasi_restoran) == 20:
                    break

        # Jika tidak ada rekomendasi restoran yang ditemukan
        if not rekomendasi_restoran:
            return jsonify({
                "prediksi": "Tidak memenuhi threshold",
                "info_kecamatan": peta_kecamatan.get(input_kecamatan, {}),
                "info_kabupaten": peta_kabupaten.get(input_kabupaten, {}),
                "info_crangka": peta_cr_angka.get(input_cr_angka, {}),
                "info_reting": peta_reting.get(input_rating, {}),
                "rekomendasi_restoran": []
            })
        
        # Mengonversi list rekomendasi menjadi format yang sesuai untuk JSON
        rekomendasi_list = [{
            'nama_restoran': r['nama_restoran'],
            'menu_makanan': r['menu_makanan'],
            'alamat': r['alamat'],
            'kecamatan': r['kecamatan'],
            'kabupaten': r['kabupaten'],
            'crangka': r['crangka'],
            'reting': r['reting'],
            'harga': r['harga']
        } for r in rekomendasi_restoran]

        info_kecamatan = peta_kecamatan.get(input_kecamatan, {})
        info_kabupaten = peta_kabupaten.get(input_kabupaten, {})
        info_crangka = peta_cr_angka.get(input_cr_angka, {})
        info_reting = peta_reting.get(input_rating, {})

        print(f'Hasil Prediksi: {hasil_prediksi}')
        print(f'Data Nama Restoran: {nama_restoran}')
        print(f'Data Menu Makanan: {menu_makanan}')
        print(f'Data Alamat Restoran: {alamat}')
        print(f'Data Harga Restoran: {harga}')
        print(f'Info Kecamatan: {kecamatan}')
        print(f'Info Kabupaten: {kabupaten}')
        print(f'Info crangka: {crangka}')
        print(model)

        # Mengembalikan hasil prediksi dan rekomendasi dalam format JSON
        return jsonify({
            "prediksi": str(hasil_prediksi),
            "nama_restoran": nama_restoran,
            "menu_makanan": menu_makanan,
            "alamat": alamat,
            "harga": harga,
            "rekomendasi_restoran": rekomendasi_list,
            "info_kecamatan": info_kecamatan,
            "info_kabupaten": info_kabupaten,
            "info_crangka": info_crangka,
            "info_reting": info_reting
        })

if __name__ == '__main__':
    model = load('resto.model')
    app.run(debug=True)
