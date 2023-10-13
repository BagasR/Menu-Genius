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
	
	// Set data pengukuran bunga iris dari input pengguna
 //  var input_sepal_length = $("#range_sepal_length").val(); 
	// var input_sepal_width  = $("#range_sepal_width").val(); 
	// var input_petal_length = $("#range_petal_length").val(); 
	// var input_petal_width  = $("#range_petal_width").val(); 

    var input_lokasi = $("#lokasi").val(); 
    var input_Luas_Tanah = $("#luas_tanah").val();
    var input_Luas_Bangunan = $("#luas_bangunan").val();
    var input_Kamar_Tidur = $("#kamar_tidur").val(); 
    var input_Kamar_Mandi = $("#kamar_mandi").val();
    var input_Listrik = $("#listrik").val();
    var input_Garasi = $("#garasi").val();

	// Panggil API dengan timeout 1 detik (1000 ms)
    setTimeout(function() {
	  try {
			$.ajax({
			  url  : "/api/prediksi",
			  type : "POST",
			  data : {
          "lokasi" : input_lokasi,
          "luas_tanah" : input_Luas_Tanah,
          "luas_bangunan" : input_Luas_Bangunan,
          "kamar_tidur"  : input_Kamar_Tidur,
          "kamar_mandi"  : input_Kamar_Mandi,
          "listrik"  : input_Listrik,
          "garasi" : input_Garasi,
        },
			  success:function(res){
				// Ambil hasil prediksi spesies dan path gambar spesies dari API
				res_data_prediksi   = res['prediksi']
        res_data_rekomendasi = res['rekomendasi']
				// res_gambar_prediksi = res['gambar_prediksi']

          console.log(res_data_prediksi)
          console.log('test data rekomendasi \n', res_data_rekomendasi)
				// Tampilkan hasil prediksi ke halaman web
			    generate_prediksi(res_data_prediksi);
          generate_rekomendasi(res_data_rekomendasi);
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
  function generate_prediksi(data_prediksi) {
    var str_prediksi="";
    // str += "<img src='" + image_prediksi + "' width=\"200\" height=\"150\"></img>";
    str_prediksi += "<h3>" +"Harga rumah impian anda adalah sebesar "+ "<br> <br>" +data_prediksi + "</h3>";
    $("#hasil_prediksi").html(str_prediksi);

  }  

  // Fungsi untuk menampilkan hasil rekomendasi model
  function generate_rekomendasi(data_rekomendasi) {

    var table = document.getElementById('hasil_rekomendasi')
    console.log(`isi dari elemen table ${table}`)
    var obj_json = JSON.parse(data_rekomendasi);
    var row = "";
    table.innerHTML = row;
    var count = 0;
    obj_json.forEach((data) => {
      console.log(`Iterasi ke-${count}`)
      console.log(`Lokasi : ${data.lokasi}`);
      console.log(`Luas Tanah : ${data.LT}`);
      console.log(`Luas Bangunan : ${data.LB}`);
      console.log(`Kamar Tidur : ${data.KT}`);
      console.log(`Tipe Listrik : ${data.listrik}`);
      console.log(`Apakah ada garasi? : ${data.garasi_carport}`);

      // Referensi Encoding pada Notebook
      // 'Kota Jakarta':0,
      // 'Kota Bogor':1,
      // 'Kabupaten Bogor':2,
      // 'Kota Depok':3,
      // 'Kota Tangerang':4,
      // 'Kota Bekasi':5,
      // 'Kabupaten Bekasi':6

      
      var str_lokasi;
      console.log(`Cek data.lokasi : ${data.lokasi}`)
      switch(data.lokasi) {
        case 0:
          // code block
          str_lokasi = 'Kota Jakarta';
          break;
        case 1:
          // code block
          str_lokasi = 'Kota Bogor';
          break;
        case 2:
          // code block
          str_lokasi = 'Kabupaten Bogor';
          break;
        case 3:
          // code block
          str_lokasi = 'Kota Depok';
          break;
        case 4:
          // code block
          str_lokasi = 'Kota Tangerang';
          break;
        case 5:
          // code block
          str_lokasi = 'Kota Bekasi';
          break;
        case 6:
          // code block
          str_lokasi = 'Kabupaten Bekasi';
          break;
        default:
          // code block
          console.log('Input Lokasi yang diinput salah!')
      }
      
      console.log(`Cek str_lokasi : ${str_lokasi}`);
      
      var str_garasi;
      switch(data.garasi_carport) {
        case 0:
          // code block
          str_garasi = 'Ada'
          break;
        case 1:
          // code block
          str_garasi = 'Tidak Ada'
          break;
        default:
          // code block
          console.log('Input Garasi Salah!')
      }
      
      row = `
        <li>
  				<div class="card-content">
  					<h3 class="h3">
  						<a class="card-title">
  							${str_lokasi}
  						</a>
  					</h3>
  					<ul class="card-list">
  						<li class="card-item">
  							<div class="item-icon">
  								<a class="fa-solid fa-chart-area">
  								</a>
  							</div>
  
  							<span class="item-text">${data.LT} m²</span>
  						</li>
  
  						<li class="card-item">
  							<div class="item-icon">
  								<a class="fa-solid fa-cube">
  								</a>
  							</div>
  
  							<span class="item-text">${data.LB} m²</span>
  						</li>
  
  						<li class="card-item">
  							<div class="item-icon">
  								<a class="fa-solid fa-bed">
  								</a>
  							</div>
  							<span class="item-text">${data.KT} KT</span>
  						</li>
  
  						<li class="card-item">
  							<div class="item-icon">
  								<a class="fa-solid fa-bath">
  								</a>
  							</div>
  							<span class="item-text">${data.KM} KM</span>
  						</li>
  
  						<li class="card-item">
  							<div class="item-icon">
  								<a class="fa-solid fa-bolt">
  								</a>
  							</div>
  							<span class="item-text">${data.listrik}</span>
  						</li>
  
  						<li class="card-item">
  							<div class="item-icon">
  								<a class="fa-solid fa-warehouse">
  								</a>
  							</div>
  							<span class="item-text">${str_garasi}</span>
  						</li>
  					</ul>
  
  					<div class="card-meta">
  						<div>
  							<span class="meta-title">Harga</span>
  							<span class="meta-text">Rp ${new Intl.NumberFormat('en-US').format(data.harga)}</span>
  						</div>
  					</div>
  				</div>
        </li>
        `

      // <div class="detail-rekomendasi" >
      //   <i class="fa-solid fa-house"></i>
      //     <div class="card-body">
      //       <h5 class="card-title">Rumah x</h5>
      //       <p class="card-text">Rumah test.</p>
      //     </div>
      //     <ul class="list-group list-group-flush">
      //       <li class="list-group-item">Lokasi : ${str_lokasi}</li>
      //       <li class="list-group-item">Luas Tanah : ${data.LT} M2</li>
      //       <li class="list-group-item">Luas Bangunan : ${data.LB} M2</li>
      //       <li class="list-group-item">Jumlah Kamar Tidur${data.KT}</li>
      //       <li class="list-group-item">Tipe Listrik : ${data.listrik}</li>
      //       <li class="list-group-item">Apakah ada garasi? : ${str_garasi}</li>
      //       <li class="list-group-item">Harga Rumah : ${data.harga}</li>
      //     </ul>
      //   </div>
      console.log(table);

      table.innerHTML += row
    });

      
    // console.log(typeof(data_rekomendasi));

    // $("#tabel_rekomendasi").html(str_rekomendasi);

    count+=1;

  } 
})
  
