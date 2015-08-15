var editor;

$(document).ready(function () {
  $.getJSON('cmr_prices/api/options', function(data) {
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
      ajax: "cmr_prices/api",
      table: "#cmr_prices",
      fields: [{
        label: "Ürün Cinsi:",
        name: "product",
        type: "select",
        options: data.productOptions,
        def: data.productDef
      },
        {
          label: "Ücret:",
          name: "price"
        }, {
          label: "Geçerlilik Başlangıcı:",
          name: "start_date",
          type: "date",
          def: function () {
            return new Date();
          },
          dateFormat: 'd.m.yy'
        }, {
          label: "Geçerlilik Sonu:",
          name: "end_date",
          type: "date",
          def: function () {
            return new Date();
          },
          dateFormat: 'd.m.yy'
        }]
    });

    $('#cmr_prices').dataTable({
      lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Tüm"]],
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
      },
      dom: "T<'clear'>lfrtip",
      ajax: "cmr_prices/api",
      columns: [
        {"data": "product"},
        {"data": "price"},
        {"data": "start_date"},
        {"data": "end_date"}
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
