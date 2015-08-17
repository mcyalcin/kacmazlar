$(document).ready(function () {
  $.getJSON('shipments/api/options', function (data) {
    editor = new $.fn.dataTable.Editor({
      i18n: {
        create: {
          button: "Yarat",
          title: "Yeni Kayıt Yarat",
          submit: "Yarat"
        },
        edit: {
          button: "Değiştir",
          title: "Kaydı Değiştir",
          submit: "Değiştir"
        },
        remove: {
          button: "Sil",
          title: "Sil",
          submit: "Sil",
          confirm: {
            _: "%d kaydı silmek istediğinizden emin misiniz?",
            1: "Kaydı silmek istediğinizden emin misiniz?"
          }
        },
        error: {
          system: "Bir hata oluştu, sistem yöneticisine başvurun."
        }
      },
      ajax: "shipments/api",
      table: "#shipments",
      // TODO: Field names are to be changed
      fields: [{
        label: 'CMR Numarasi:',
        name: 'cmr_no'
      }, {
        label: 'CMR Tarihi:',
        name: 'cmr_tarihi',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Yükleme Tarihi:',
        name: 'yukleme_tarihi',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Boşaltma Tarihi:',
        name: 'bosaltma_tarihi',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Çekici Plakası:',
        name: 'cekici_plakasi',
        type: 'select',
        options: data.tractorPlateOptions
      }, {
        label: 'Dorse Plakası:',
        name: 'dorse_plakasi',
        type: 'select',
        options: data.trailerPlateOptions
      }, {
        label: 'Şöför:',
        name: 'sofor_adi_soyadi',
        type: 'select',
        options: data.driverOptions
      }, {
        label: 'Yukleme Yeri',
        name: 'yukleme_yeri',
        type: 'select',
        options: data.locationOptions
      }, {
        label: 'Bosaltma Yeri',
        name: 'bosaltma_yeri',
        type: 'select',
        options: data.locationOptions
      }, {
        label: 'Urun Cinsi:',
        name: 'urun_cinsi',
        type: 'select',
        options: data.productOptions
      }, {
        label: 'Yukleme Tonaji',
        name: 'yukleme_tonaji'
      }, {
        label: 'Gumruk Tonaji',
        name: 'gumruk_tonaji'
      }, {
        label: 'Bosaltim Tonaji',
        name: 'bosaltim_tonaji'
      }, {
        label: 'Hakedis Tarihi:',
        name: 'hakedis_tarihi',
        type: 'date',
        dateFormat: 'd.m.yy'
      }]
    });

    $('#shipments').on('click', 'tbody td:not(:first-child)', function (e) {
      editor.inline(this);
    });

    $('#shipments').DataTable({
      paging: false,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
      },
      "ajax": "shipments/api",
      dom: 'T<"clear">lfrtip',
      "scrollX": true,
      "columns": [
        {"data": "yukleme_tarihi"},
        {"data": "bosaltma_tarihi"},
        {"data": "firma_adi"},
        {"data": "cekici_plakasi"},
        {"data": "dorse_plakasi"},
        {"data": "sofor_adi_soyadi"},
        {"data": "yukleme_yeri"},
        {"data": "bosaltim_yeri"},
        {"data": "cmr_tarihi"},
        {"data": "cmr_no"},
        {"data": "urun_cinsi"},
        {"data": "yukleme_tonaji"},
        {"data": "gumruk_tonaji"},
        {"data": "bosaltim_tonaji"},
        {"data": "fire_hakki"},
        {"data": "gumruk_firesi"},
        {"data": "urun_firesi"},
        {"data": "gumruk_fire_fiyati"},
        {"data": "urun_fire_fiyati"},
        {"data": "gumruk_cezasi"},
        {"data": "urun_cezasi"},
        {"data": "cmr_bedeli"},
        {"data": "nakliye_fiyati"},
        {"data": "nakliye_tutari"},
        {"data": "net_hakedis_tutari"},
        {"data": "hakedis_tarihi"}
      ],
      tableTools: {
        sRowSelect: "os",
        sSwfPath: "/swf/copy_csv_xls_pdf.swf",
        aButtons: [
          {sExtends: "editor_create", editor: editor},
          {sExtends: "editor_edit", editor: editor},
          {sExtends: "editor_remove", editor: editor},
          {
            sExtends: "collection",
            sButtonText: "Kaydet",
            sButtonClass: "save-collection",
            aButtons: [
              {
                sExtends: 'copy',
                sButtonText: 'Kopyala'
              },
              'csv',
              'pdf'
            ]
          },
          {
            sExtends: 'print',
            sButtonText: 'Yazdır'
          }
        ]
      }
    });
  });
});