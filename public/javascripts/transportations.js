$(document).ready(function() {
  $('#transportations').DataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
    },
    "ajax": "transportations/api",
    dom: 'T<"clear">lfrtip',
    "scrollX": true,
    "columns": [
      { "data": "yukleme_tarihi" },
      { "data": "bosaltma_tarihi" },
      { "data": "firma_adi" },
      { "data": "cekici_plakasi" },
      { "data": "dorse_plakasi" },
      { "data": "sofor_adi_soyadi" },
      { "data": "yukleme_yeri" },
      { "data": "bosaltim_yeri" },
      { "data": "cmr_tarihi" },
      { "data": "cmr_no" },
      { "data": "urun_cinsi" },
      { "data": "yukleme_tonaji" },
      { "data": "gumruk_tonaji" },
      { "data": "bosaltim_tonaji" },
      { "data": "fire_hakki" },
      { "data": "gumruk_firesi" },
      { "data": "urun_firesi" },
      { "data": "gumruk_fire_fiyati" },
      { "data": "urun_fire_fiyati" },
      { "data": "gumruk_cezasi" },
      { "data": "urun_cezasi" },
      { "data": "cmr_bedeli" },
      { "data": "nakliye_fiyati" },
      { "data": "nakliye_tutari" },
      { "data": "net_hakedis_tutari" },
      { "data": "hakedis_tarihi" }
    ]
  });
});