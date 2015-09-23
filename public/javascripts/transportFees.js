var editor;

$(document).ready(function () {
  $.getJSON('transport_fees/api/options', function(data) {
    editor = new $.fn.dataTable.Editor({
      i18n: {
        create: {
          button: "Yarat",
          title:  "Yeni Kayıt Yarat",
          submit: "Yarat"
        },
        edit: {
          button: "Değiştir",
          title:  "Kaydı Değiştir",
          submit: "Değiştir"
        },
        remove: {
          button: "Sil",
          title:  "Sil",
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
      ajax: "transport_fees/api",
      table: "#transport_fees",
      fields: [{
        label: "Ürün Cinsi:",
        name: "product",
        type: "select",
        options: data.productOptions,
        def: data.productDef
      }, {
        label: "Nereden:",
        name: "from",
        type: "select",
        options: data.locationOptions,
        def: data.locationDef
      }, {
        label: "Nereye:",
        name: "to",
        type: "select",
        options: data.locationOptions,
        def: data.locationDef
      }, {
        label: "Birim Fiyatı:",
        name: "unit_price"
      }]
    });

    $('#transport_fees').dataTable({
      lengthMenu: [[10, 50, -1], [10, 50, 'Tüm']],
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
      },
      dom: "T<'clear'>lfrtip",
      ajax: "transport_fees/api",
      columns: [
        {"data": "product"},
        {"data": "from"},
        {"data": "to"},
        {"data": "unit_price"}
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
