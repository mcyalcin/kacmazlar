/* global $ */
$(document).ready(function () {
  editor = new $.fn.dataTable.Editor({
    i18n: {
      edit: {
        button: "Değiştir",
        title: "Kaydı Değiştir",
        submit: "Değiştir"
      },
      error: {
        system: "Bir hata oluştu, sistem yöneticisine başvurun."
      }
    },
    ajax: "shipments/api",
    table: "#shipments",
    fields: [{
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
      {"data": "loading_date", defaultContent: ""},
      {"data": "customs_entry_date", defaultContent: ""},
      {"data": "customs_exit_date", defaultContent: ""},
      {"data": "delivery_date", defaultContent: ""},
      {"data": "company_name", defaultContent: ""},
      {"data": "tractor_plate_number", defaultContent: ""},
      {"data": "trailer_plate_number", defaultContent: ""},
      {"data": "driver", defaultContent: ""},
      {"data": "product", defaultContent: ""},
      {"data": "loading_location", defaultContent: ""},
      {"data": "delivery_location", defaultContent: ""},
      {"data": "cmr_date", defaultContent: ""},
      {"data": "cmr_number", defaultContent: ""},
      {"data": "loading_weight", defaultContent: ""},
      {"data": "customs_weight", defaultContent: ""},
      {"data": "delivery_weight", defaultContent: ""},
      {"data": "customs_allowed_loss_amount", defaultContent: ""},
      {"data": "customs_loss", defaultContent: ""},
      {"data": "customs_loss_unit_price", defaultContent: ""},
      {"data": "customs_loss_price", defaultContent: ""},
      {"data": "delivery_allowed_loss_amount", defaultContent: ""},
      {"data": "delivery_loss", defaultContent: ""},
      {"data": "delivery_loss_unit_price", defaultContent: ""},
      {"data": "delivery_loss_price", defaultContent: ""},
      {"data": "cmr_price", defaultContent: ""}
    ],
    tableTools: {
      sRowSelect: "os",
      sSwfPath: "/swf/copy_csv_xls_pdf.swf",
      aButtons: [
        {sExtends: "editor_edit", editor: editor},
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
