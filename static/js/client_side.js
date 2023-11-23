$(document).ready(function() {

  // -[Animasi Scroll]---------------------------

  $(".navbar a, footer a[href='#halamanku']").on('click', function(event) {
    if (this.hash !== "") {
      event.preventDefault();
      var hash = this.hash;
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 900, function() {
        window.location.hash = hash;
      });
    }
  });

  $(window).scroll(function() {
    $(".slideanim").each(function() {
      var pos = $(this).offset().top;
      var winTop = $(window).scrollTop();
      if (pos < winTop + 600) {
        $(this).addClass("slide");
      }
    });
  });


  // -[Prediksi Model]---------------------------

  // Fungsi untuk memanggil API ketika tombol prediksi ditekan
  $("#prediksi_submit").click(function(e) {
    e.preventDefault();

    var input_harga_rata = $("#rentang_harga").val();
    var input_rating = $("#rating").val();
    var input_kecamatan = $("#kecamatan").val();
    var input_kabupaten = $("#kabupaten").val();
    var input_cr_angka = $("#crangka").val();

    // Panggil API dengan timeout 1 detik (1000 ms)
    setTimeout(function() {
      try {
        $.ajax({
          url: "/api/deteksi",
          type: "POST",
          data: {
            "Harga_Rata-rata": input_harga_rata,
            "rating": input_rating,
            "kecamatan": input_kecamatan,
            "kabupaten": input_kabupaten,
            "crangka": input_cr_angka
          },
          success: function(res) {
            // Ambil hasil prediksi
            res_data_prediksi = res['prediksi']
            res_data_nama_restoran = res['nama_restoran']
            res_data_menu_makanan = res['menu_makanan']
            res_data_alamat = res['alamat']
            res_data_crangka = res['crangka']
            res_data_harga = res['harga']
            res_data_reting = res['reting']
            res_data_rekomendasi_restoran = res['rekomendasi_restoran']

            console.log(res_data_prediksi)
            console.log('test data rekomendasi \n', res_data_nama_restoran)
            // Tampilkan hasil prediksi ke halaman web
            generate_prediksi(res_data_prediksi, res_data_nama_restoran, res_data_menu_makanan, res_data_alamat, res_data_crangka, res_data_harga, res_data_reting, res_data_rekomendasi_restoran);
          }
        });
      } catch (e) {
        // Jika gagal memanggil API, tampilkan error di console
        console.log("Gagal !");
        console.log(e);
      }
    }, 1000)

  })

  // Fungsi untuk menampilkan hasil prediksi model
  function generate_prediksi(data_prediksi, data_nama_restoran, data_menu_makanan, data_alamat, data_crangka, data_reting, data_harga, rekomendasi_restoran) {
    var str_prediksi = "";

    var rekomendasi_str = "";
    if (rekomendasi_restoran.length > 0) {
      for (var i = 0; i < rekomendasi_restoran.length; i++) {
        // Menghasilkan HTML untuk menampilkan rekomendasi restoran
        rekomendasi_str += `
          <li>
              <div class="card-content">
                  <h3 class="h3">
                      <a style="color: black;" class="card-title">
                          ${rekomendasi_restoran[i].nama_restoran}
                      </a>
                  </h3>
                  <ul class="card-list">
                      <li class="card-item">
                          <div class="item-icon">
                              <a style="color: black;" class="fa-solid fa-utensil-spoon">
                              </a>
                          </div>
                          <span class="item-text">${rekomendasi_restoran[i].menu_makanan}</span>
                      </li>
                      <li class="card-item">
                          <div class="item-icon">
                              <a style="color: black;" class="fa-solid fa-map-marker">
                              </a>
                          </div>
                          <span class="item-text">${rekomendasi_restoran[i].alamat}</span>
                      </li>
                      <li class="card-item">
                          <div class "item-icon">
                              <a style="color: black;" class="fa-solid fa-map">
                              </a>
                          </div>
                          <span class="item-text">${rekomendasi_restoran[i].kecamatan}</span>
                      </li>
                      <li class="card-item">
                          <div class="item-icon">
                              <a style="color: black;" class="fa-solid fa-map">
                              </a>
                          </div>
                          <span class="item-text">${rekomendasi_restoran[i].crangka}</span>
                      </li>
                      <li class="card-item">
                          <div class="item-icon">
                              <a style="color: black;" class="fa-solid fa-star">
                              </a>
                          </div>
                          <span class="item-text">${rekomendasi_restoran[i].reting}</span>
                      </li>
                  </ul>
                  <div class="card-meta">
                      <div>
                          <span class="meta-title">Harga</span>
                          <span class="meta-text">Rp ${new Intl.NumberFormat('en-US').format(rekomendasi_restoran[i].harga)}</span>
                      </div>
                  </div>
              </div>
          </li>`;
      }
    } else {
      rekomendasi_str = "Tidak ada rekomendasi tersedia.";
    }

    // Menyisipkan hasil rekomendasi ke dalam elemen HTML
    var hasilRekomendasi = document.getElementById("hasil_rekomendasi");
    hasilRekomendasi.innerHTML = rekomendasi_str;
  }
})
