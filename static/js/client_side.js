 $(document).ready(function(){
  
  // -[Animasi Scroll]---------------------------
  
  $(".navbar a, footer a[href='#halamanku']").on('click', function(event) {
    if (this.hash !== "") {
      event.preventDefault();
      var hash = this.hash;
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 900, function(){
        window.location.hash = hash;
      });
    } 
  });
  
  $(window).scroll(function() {
    $(".slideanim").each(function(){
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
			  url  : "/api/deteksi",
			  type : "POST",
			  data : {
          "Harga_Rata-rata" : input_harga_rata,
          "rating" : input_rating,
          "kecamatan" : input_kecamatan,
          "kabupaten"  : input_kabupaten,
          "crangka"  : input_cr_angka,
        },
			  success:function(res){
				// Ambil hasil prediksi 
				res_data_prediksi   = res['prediksi']
        res_data_nama_restoran = res['nama_restoran']
        res_data_menu_makanan = res['menu_makanan']
        res_data_alamat = res['alamat']
        res_data_harga = res['harga']
        res_data_rekomendasi_restoran = res['rekomendasi_restoran']
				// res_gambar_prediksi = res['gambar_prediksi']

          console.log(res_data_prediksi)
          console.log('test data rekomendasi \n', res_data_nama_restoran)
				// Tampilkan hasil prediksi ke halaman web
			    generate_prediksi(res_data_prediksi, res_data_nama_restoran, res_data_menu_makanan, res_data_alamat, res_data_harga, res_data_rekomendasi_restoran);
			  }
			});
		}
		catch(e) {
			// Jika gagal memanggil API, tampilkan error di console
			console.log("Gagal !");
			console.log(e);
		} 
    }, 1000)
    
  })
    
  // Fungsi untuk menampilkan hasil prediksi model
  function generate_prediksi(data_prediksi, data_nama_restoran, data_menu_makanan, data_alamat, data_harga, rekomendasi_restoran) {
    var str_prediksi = "";
    str_prediksi += "<h3><b>Nama restoran   : <b>" + data_nama_restoran + "</h3>";
    str_prediksi += "<h3><b>Menu Makanan   : <b>" + data_menu_makanan + "</h3>";
    str_prediksi += "<h3><b>Alamat restoran : <b>" + data_alamat + "</h3>";
    str_prediksi += "<h3><b>Harga : <b>" + data_harga + "</h3>";
    
    var rekomendasi_str = "";
    for (var i = 0; i < rekomendasi_restoran.length; i++) {
        rekomendasi_str += "<p>" + rekomendasi_restoran[i].nama_restoran + " - " + rekomendasi_restoran[i].menu_makanan + " - " + rekomendasi_restoran[i].alamat + " - " + rekomendasi_restoran[i].kecamatan + " - " + rekomendasi_restoran[i].harga + "</p>";
    }
    var hasilRekomendasi = document.getElementById("hasil_rekomendasi");
    hasilRekomendasi.innerHTML = rekomendasi_str;

    $("#hasil_prediksi").html(str_prediksi)
}
})

console.log("Input Harga Rata-rata:", input_harga_rata);
console.log("Input Rating:", input_rating);
console.log("Input Kecamatan:", input_kecamatan);
console.log("Input Kabupaten:", input_kabupaten);
console.log("Input CR Angka:", input_cr_angka);

  
