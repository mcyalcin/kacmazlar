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
        label: 'Yukleme Yeri',
        name: 'loading_location',
        type: 'select',
        options: data.locationOptions
      }, {
        label: 'Bosaltma Yeri',
        name: 'delivery_location',
        type: 'select',
        options: data.locationOptions
      }, {
        label: 'Urun Cinsi:',
        name: 'product',
        type: 'select',
        options: data.productOptions
      }, {
        label: 'Yukleme Tonaji',
        name: 'loading_weight'
      }, {
        label: 'Gumruk Tonaji',
        name: 'customs_weight'
      }, {
        label: 'Bosaltim Tonaji',
        name: 'delivery_weight'
      }, {
        label: 'Hakedis Tarihi:',
        name: 'payment_date',
        type: 'date',
        dateFormat: 'd.m.yy'
      }]
    });

    // TODO: Consider adding inline editing.
    //$('#shipments').on('click', 'tbody td:not(:first-child)', function (e) {
    //  editor.inline(this);
    //});

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
        {"data": "cmr_price", defaultContent:""},
        {"data": "shipping_unit_price", defaultContent:""},
        {"data": "shipping_price", defaultContent:""},
        {"data": "net_price", defaultContent:""},
        {"data": "payment_date", defaultContent:""},
        {"data": "transportation_unit_price", defaultContent:""},
        {"data": "transportation_price", defaultContent:""}
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