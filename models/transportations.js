var connectionString = require('./database');
var express = require('express');
var router = express.Router();
var pg = require('pg');

function getTransportations(res) {
  var results = [];
  pg.connect(connectionString, function (err, client, done) {
    var query = client.query('select * from transportations order by id asc');
    query.on('row', function (row) {
      row.DT_RowId = row.id;
      results.push(row);
    });
    query.on('end', function () {
      client.end();
      return res.json({data: [
        {
          "yukleme_tarihi": "2015/01/01",
          "bosaltma_tarihi": "2015/05/05",
          "firma_adi": "Kaçmazlar Lojistik",
          "cekici_plakasi": "06 AN 0606",
          "dorse_plakasi": "06 AN 0707",
          "sofor_adi_soyadi": "Mehmet Bilir",
          "yukleme_yeri": "Trabzon",
          "bosaltim_yeri": "Erbil",
          "cmr_tarihi": "2015/12/30",
          "cmr_no": "1001",
          "urun_cinsi": "Motorin",
          "yukleme_tonaji": "26000",
          "gumruk_tonaji": "26700",
          "bosaltim_tonaji": "25700",
          "fire_hakki": "78",
          "gumruk_firesi": "-1000",
          "urun_firesi": "-300",
          "gumruk_fire_fiyati": "2.0",
          "urun_fire_fiyati": "1.5",
          "gumruk_cezasi": "2000",
          "urun_cezasi": "333",
          "cmr_bedeli": "100",
          "nakliye_fiyati": "0.07",
          "nakliye_tutari": "1799",
          "net_hakedis_tutari": "",
          "hakedis_tarihi": ""
        }
      ]});
    });
    if (err) {
      console.log(err);
    }
  });
}

router.get('/', function (req, res) {
  getTransportations(res);
});

module.exports = router;