from flask import Flask,render_template,request,jsonify
from flask_ngrok import run_with_ngrok
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from joblib import load

app = Flask(__name__, static_url_path='/static')
model = None

# Baca data nama restoran dari file CSV
nama_restoran_df = pd.read_csv('nama_restoran.csv')

# Dictionary pemetaan 
peta_kecamatan = {
    "1": "Syiah Kuala",
    "2": "Kuta Alam",
    "3": "Banda Raya",
    "4": "Meuraxa"
}
peta_tempat = {
    "1": "Restoran",
    "2": "Cafe"
}
peta_kabupaten = {
    "1": "Banda Aceh",
    "2": "Aceh Besar"
}

# Membuat kamus yang berisi nama restoran, alamat, dan hasil prediksi
nama_restoran_peta = {}
for index, row in nama_restoran_df.iterrows():
    hasil_prediksi = row['hasil_prediksi']
    nama_restoran = row['nama_restoran']
    menu_makanan = row['menu_makanan']
    alamat = row['alamat']
    kecamatan = row['kecamatan']
    kabupaten = row['kabupaten']
    harga = row['harga']
    nama_restoran_peta[hasil_prediksi] = {'nama_restoran': nama_restoran, 'menu_makanan': menu_makanan, 'kecamatan': kecamatan, 'kabupaten': kabupaten, 'alamat': alamat, 'harga': harga}

@app.route("/")
def beranda():
    return render_template('index.html')

@app.route("/api/deteksi", methods=['POST'])
def apiDeteksi():
    if request.method == 'POST':
        # Set nilai untuk variabel input atau features (X) berdasarkan input dari pengguna
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

        hasil_prediksi = model.predict(df[0:1])[0]

        # Filter hasil prediksi sesuai dengan kondisi tertentu
        # Misalnya, hanya restoran dengan hasil prediksi >= 0.5 yang diberikan
        threshold = 0.5
        if hasil_prediksi < threshold:
            return jsonify({
                "prediksi": "Tidak memenuhi threshold",
                "info_kecamatan": peta_kecamatan.get(input_kecamatan, {}),
                "info_kabupaten": peta_kabupaten.get(input_kabupaten, {}),
                "rekomendasi_restoran": []
            })

        # Cari nama restoran dan alamat sesuai dengan hasil prediksi dari peta
        restoran_info = nama_restoran_peta.get(hasil_prediksi, {})
        nama_restoran = restoran_info.get('nama_restoran', 'Restoran tidak ditemukan')
        menu_makanan = restoran_info.get('menu_makanan', 'menu makananan tidak ditemukan')
        alamat = restoran_info.get('alamat', 'Alamat tidak ditemukan')
        harga = restoran_info.get('harga', 'Harga tidak ditemukan')

        # Dapatkan nilai harga yang diinputkan oleh pengguna
        input_harga = float(input_harga_rata)

        input_kecamatan = peta_kecamatan.get(input_kecamatan)
        input_kabupaten = peta_kabupaten.get(input_kabupaten)
        # Filter data restoran berdasarkan rentang harga
        # Filter data restoran berdasarkan rentang harga dan kecamatan
        filtered_restaurants = nama_restoran_df[(nama_restoran_df['harga'] <= input_harga + 10000) &
                                        (nama_restoran_df['harga'] >= input_harga - 10000) &
                                        (nama_restoran_df['kecamatan'] == input_kecamatan) & (nama_restoran_df['kabupaten'] == input_kabupaten)]


        # Ambil 6 restoran terdekat dari data yang sudah difilter
        rekomendasi_restoran = []
        for index, row in filtered_restaurants.iterrows():
            if row['hasil_prediksi'] != hasil_prediksi:
                rekomendasi_restoran.append({'nama_restoran': row['nama_restoran'], 'menu_makanan': row['menu_makanan'], 'alamat': row['alamat'], 'kecamatan': row['kecamatan'], 'kabupaten': row['kabupaten'], 'harga': row['harga']})
                if len(rekomendasi_restoran) == 20:
                    break

            rekomendasi_list = [{'nama_restoran': r['nama_restoran'], 'menu_makanan': r['menu_makanan'], 'alamat': r['alamat'], 'kecamatan': r['kecamatan'], 'kabuapten': r['kabupaten'], 'harga': r['harga']} for r in rekomendasi_restoran]

        # Cari informasi kecamatan sesuai dengan input_kecamatan
        info_kecamatan = peta_kecamatan.get(input_kecamatan, {})
        info_kabupaten = peta_kabupaten.get(input_kabupaten, {})

        # Print hasil prediksi, nama restoran, dan alamat restoran
        print(f'Hasil Prediksi: {hasil_prediksi}')
        print(f'Data Nama Restoran: {nama_restoran}')
        print(f'Data Menu Makanan: {menu_makanan}')
        print(f'Data Alamat Restoran: {alamat}')
        print(f'Data Harga Restoran: {harga}')
        print(f'Info Kecamatan: {info_kecamatan}')
        print(f'Info Kabupaten: {info_kabupaten}')
        print(model)

        # Return hasil prediksi dengan format JSON
        return jsonify({
            "prediksi": str(hasil_prediksi),
            "nama_restoran": nama_restoran,
            "menu_makanan": menu_makanan,
            "alamat": alamat,
            "harga": harga,
            "rekomendasi_restoran": rekomendasi_list,
            "info_kecamatan": info_kecamatan,
            "info_kabupaten": info_kabupaten
        })

if __name__ == '__main__':
    # Load model yang telah ditraining
    model = load('resto.model')

    # Run Flask di Google Colab menggunakan ngrok
    run_with_ngrok(app)
    app.run()
