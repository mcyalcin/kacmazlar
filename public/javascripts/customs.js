var editor;

$(document).ready(function () {
  $.getJSON('customs/api/options', function (data) {
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
      ajax: "customs/api",
      table: "#customs",
      fields: [{
        label: "Ürün Cinsi:",
        name: "product",
        type: "select",
        options: data.productOptions,
        def: data.productDef
      }, {
        label: "Kabul Edilir Fire Miktarı:",
        name: "allowed"
      }, {
        label: "Fire Cezası Birim Fiyatı:",
        name: "unit_cost"
      }, {
        label: "Geçerlilik Başlangıç Tarihi:",
        name: "start_date",
        type: "date",
        dateFormat: 'd.m.yy'
      }, {
        label: "Geçerlilik Bitiş Tarihi:",
        name: "end_date",
        type: "date",
        dateFormat: 'd.m.yy'
      }]
    });

    $('#customs').dataTable({
      lengthMenu: [[-1, 50, 10], ["Tüm", 50, 10]],
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
      },
      dom: "T<'clear'>lfrtip",
      ajax: "customs/api",
      columns: [
        {"data": "product"},
        {"data": "allowed"},
        {"data": "unit_cost"},
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
