/* global $ */
(function ($, DataTable) {

  if (!DataTable.ext.editorFields) {
    DataTable.ext.editorFields = {};
  }

  DataTable.Editor.fieldTypes.acom = {
    create: function ( conf ) {
      conf._input = $(
        '<input id="' + conf.name + '">');
      conf._input.autocomplete({
        source: conf.options
      });
      return conf._input;
    },

    get: function ( conf ) {
      return conf._input[0].value;
    },

    set: function ( conf, val ) {
      conf._input[0].value = val;
    }
  };

})(jQuery, jQuery.fn.dataTable);

$(document).ready(function () {
  $.getJSON('shipments/api/options', function (data) {
    var loadingEditor = new $.fn.dataTable.Editor({
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
      fields: [{
        label: 'CMR Numarası:',
        name: 'cmr_number'
      }, {
        label: 'CMR Tarihi:',
        name: 'cmr_date',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Yükleme Tarihi:',
        name: 'loading_date',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Çekici Plakası:',
        name: 'tractor_plate_number',
        type: 'acom',
        options: data.tractorPlateOptions
      }, {
        label: 'Dorse Plakası:',
        name: 'trailer_plate_number',
        type: 'acom',
        options: data.trailerPlateOptions
      }, {
        label: 'Şöför:',
        name: 'driver',
        type: 'acom',
        options: data.driverOptions
      }, {
        label: 'Yükleme Yeri',
        name: 'loading_location',
        type: 'select',
        options: data.locationOptions
      }, {
        label: 'Boşaltma Yeri',
        name: 'delivery_location',
        type: 'select',
        options: data.locationOptions
      }, {
        label: 'Ürün Cinsi:',
        name: 'product',
        type: 'select',
        options: data.productOptions
      }, {
        label: 'Yükleme Tonajı',
        name: 'loading_weight'
      }]
    });

    var deliveryEditor = new $.fn.dataTable.Editor({
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
      fields: [{
        label: 'Bosaltım Tonajı',
        name: 'delivery_weight'
      }, {
        label: 'Boşaltma Tarihi:',
        name: 'delivery_date',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Boşaltma Yeri',
        name: 'delivery_location',
        type: 'select',
        options: data.locationOptions
      }, {
        label: 'Gümrük Tonaji',
        name: 'customs_weight'
      }, {
        label: 'Gümrüğe Giriş Tarihi:',
        name: 'customs_entry_date',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Gümrükten Çıkış Tarihi:',
        name: 'customs_exit_date',
        type: 'date',
        dateFormat: 'd.m.yy'
      }]
    });

    $('#shipments').DataTable({
      lengthMenu: [[10, 50, -1], [10, 50, 'Tüm']],
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
      },
      "ajax": "shipments/api",
      dom: 'T<"clear">lfrtip',
      "scrollX": true,
      "columns": [
        {"data": "loading_date", defaultContent:""},
        {"data": "customs_entry_date", defaultContent:""},
        {"data": "customs_exit_date", defaultContent:""},
        {"data": "delivery_date", defaultContent:""},
        {"data": "company_name", defaultContent:""},
        {"data": "tractor_plate_number", defaultContent:""},
        {"data": "trailer_plate_number", defaultContent:""},
        {"data": "driver", defaultContent:""},
        {"data": "product", defaultContent:""},
        {"data": "loading_location", defaultContent:""},
        {"data": "delivery_location", defaultContent:""},
        {"data": "cmr_date", defaultContent:""},
        {"data": "cmr_number", defaultContent:""},
        {"data": "loading_weight", defaultContent:""},
        {"data": "customs_weight", defaultContent:""},
        {"data": "delivery_weight", defaultContent:""},
        {"data": "customs_allowed_loss_amount", defaultContent:""},
        {"data": "customs_loss", defaultContent:""},
        {"data": "customs_loss_unit_price", defaultContent:""},
        {"data": "customs_loss_price", defaultContent:""},
        {"data": "delivery_allowed_loss_amount", defaultContent:""},
        {"data": "delivery_loss", defaultContent:""},
        {"data": "delivery_loss_unit_price", defaultContent:""},
        {"data": "delivery_loss_price", defaultContent:""},
        {"data": "cmr_price", defaultContent:""}
      ],
      tableTools: {
        sRowSelect: "os",
        sSwfPath: "/swf/copy_csv_xls_pdf.swf",
        aButtons: [
          {sExtends: "editor_create", editor: loadingEditor},
          {sExtends: "editor_edit", editor: deliveryEditor},
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
