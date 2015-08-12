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
    ajax: "drivers/api",
    table: "#drivers",
    fields: [{
      label: "Adı:",
      name: "name"
    }, {
      label: "Soyadı:",
      name: "surname"
    }, {
      label: "TC Kimlik Numarası:",
      name: "id_number"
    }, {
      label: "Ana adı:",
      name: "mother_name"
    }, {
      label: "Baba adı:",
      name: "father_name"
    }, {
      label: "Doğum Yeri:",
      name: "birthplace"
    }, {
      label: "Doğum Tarihi:",
      name: "birth_date",
      type: "date",
      dateFormat: 'd.m.yy'
    }, {
      label: "Telefon Numarası:",
      name: "phone_number"
    }

    ]
  });

  $('#drivers').dataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
    },
    dom: "T<'clear'>lfrtip",
    ajax: "drivers/api",
    columns: [
      {"data": "name"},
      {"data": "surname"},
      {"data": "id_number"},
      {"data": "mother_name"},
      {"data": "father_name"},
      {"data": "birthplace"},
      {"data": "birth_date"},
      {"data": "phone_number"}
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
          sButtonText: "Save",
          sButtonClass: "save-collection",
          aButtons: ['copy', 'csv', 'pdf']
        },
        'print'
      ]
    }
  });
});
