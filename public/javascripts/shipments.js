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
        name: 'dorse_plakasi',
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
        name: 'bosaltma_yeri',
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
        {"data": "loading_date"},
        {"data": "delivery_date"},
        {"data": "company_name"},
        {"data": "tractor_plate_number"},
        {"data": "trailer_plate_number"},
        {"data": "driver"},
        {"data": "loading_location"},
        {"data": "delivery_location"},
        {"data": "cmr_date"},
        {"data": "cmr_number"},
        {"data": "product"},
        {"data": "loading_weight"},
        {"data": "customs_weight"},
        {"data": "delivery_weight"},
        {"data": "allowed_loss_rate"},
        //{"data": "customs_allowed_loss_amount"},
        {"data": "customs_loss"},
        {"data": "delivery_loss"},
        {"data": "customs_loss_unit_price"},
        {"data": "delivery_loss_unit_price"},
        {"data": "customs_loss_price"},
        {"data": "delivery_loss_price"},
        {"data": "cmr_price"},
        {"data": "shipping_unit_price"},
        {"data": "shipping_price"},
        {"data": "net_price"},
        {"data": "payment_date"}
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