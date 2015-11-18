/* global $, jQuery */
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
  $.getJSON('/shipments/api/options', function (data) {
    var editor = new $.fn.dataTable.Editor({
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
      ajax: "/shipments/api",
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
        label: 'Gümrüğe Giriş Tarihi:',
        name: 'customs_entry_date',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Gümrükten Çıkış Tarihi:',
        name: 'customs_exit_date',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Boşaltma Tarihi:',
        name: 'delivery_date',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Çekici Plakası:',
        name: 'tractor_plate_number',
        type: 'select',
        options: data.tractorPlateOptions
      }, {
        label: 'Dorse Plakası:',
        name: 'trailer_plate_number',
        type: 'select',
        options: data.trailerPlateOptions
      }, {
        label: 'Şöför:',
        name: 'driver',
        type: 'select',
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
      }, {
        label: 'Gümrük Tonajı',
        name: 'customs_weight'
      }, {
        label: 'Bosaltım Tonajı',
        name: 'delivery_weight'
      }, {
        label: 'Hakediş Tarihi:',
        name: 'payment_date',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Navlun Hakediş Tarihi:',
        name: 'transportation_payment_date',
        type: 'date',
        dateFormat: 'd.m.yy'
      }, {
        label: 'Firma Adı:',
        name: 'company_name',
        type: 'hidden'
      }]
    });

    // TODO: Consider adding inline editing.
    //$('#shipments').on('click', 'tbody td:not(:first-child)', function (e) {
    //  editor.inline(this);
    //});
    //$.fn.dataTable.moment('D\.M\.YYYY');
    $('#shipments').DataTable({
      lengthMenu: [[10, 50, -1], [10, 50, 'Tüm']],
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
      },
      "ajax": "/shipments/api/ongoing",
      dom: 'T<"clear">lfrtip',
      "scrollX": true,
      "columnDefs": [
        { type: 'date-eu', targets: [0,1,2,3,11,28,31] }
      ],
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
        {"data": "cmr_price", defaultContent:""},
        {"data": "shipping_unit_price", defaultContent:""},
        {"data": "shipping_price", defaultContent:""},
        {"data": "net_price", defaultContent:""},
        {"data": "payment_date", defaultContent:""},
        {"data": "transportation_unit_price", defaultContent:""},
        {"data": "transportation_price", defaultContent:""},
        {"data": "transportation_payment_date", defaultContent:""}
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
