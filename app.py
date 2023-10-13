# =[Modules dan Packages]========================
from flask import Flask, render_template, request

# =[Variabel Global]=============================

app = Flask(__name__, static_url_path='/static')
model = None

# [Routing untuk Halaman Utama atau Home]
@app.route("/")
def beranda():
  return render_template('index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)  

