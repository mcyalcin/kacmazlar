var editor;

$(document).ready(function () {
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
    ajax: "firms/api",
    table: "#firms",
    fields: [{
      label: "Ad:",
      name: "name"
    }, {
      label: "Adres:",
      name: "address"
    }, {
      label: "Telefon:",
      name: "phone_number"
    }, {
      label: "C2 Sahibi?",
      name: "is_c2_holder",
      type:  "radio",
      options: [
        { label: "Evet", value: "Evet" },
        { label: "Hayır",  value: "Hayır" }
      ],
      "default": "Evet"
    }, {
      label: "Ruhsat Sahibi?",
      name: "is_license_holder",
      type:  "radio",
      options: [
        { label: "Evet", value: "Evet" },
        { label: "Hayır",  value: "Hayır" }
      ],
      "default": "Evet"
    }, {
      label: "Taşeron?",
      name: "is_subcontractor",
      type:  "radio",
      options: [
        { label: "Evet", value: "Evet" },
        { label: "Hayır",  value: "Hayır" }
      ],
      "default": "Evet"
    }]
  });

  $('#firms').dataTable({
    lengthMenu: [[10, 50, -1], [10, 50, 'Tüm']],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
    },
    dom: "T<'clear'>lfrtip",
    ajax: "firms/api",
    columns: [
      {"data": "name"},
      {"data": "address"},
      {"data": "phone_number"},
      {"data": "is_c2_holder"},
      {"data": "is_license_holder"},
      {"data": "is_subcontractor"}
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
