var editor;

$(document).ready(function () {
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
    }, {
      label: "Gümrük İzni?",
      name: "permission_status",
      type: "select",
      options: ["YOK", "VAR", "İPTAL"],
      def: "YOK"
    }, {
      label: "Ehliyet?",
      name: "has_license_scan",
      type: "select",
      options: ["YOK", "VAR"],
      def: "YOK"
    }
    ]
  });

  function validateTckn(value) {
    var n = value.split('');
    var i, sum1 = 0, sum2 = 0, sum3 = parseInt(n[0]);
    for (i = 0; i < 10; i++) {
      sum1 = sum1 + parseInt(n[i]);
    }
    for (i = 1; i < 9; i = i + 2) {
      sum2 = sum2 + parseInt(n[i]);
      sum3 = sum3 + parseInt(n[i + 1]);
    }
    return !(!/^[1-9][0-9]{10}$/.test(value) || (sum1 % 10 != n[10]) || (sum3 * 7 - sum2) % 10 != n[9]);
  }

  function validatePhoneNumber(value) {
    return !value || value.toString().replace(/ /g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '').length === 10;
  }

  editor.on('preSubmit', function (e, o, action) {
    var noError = true;
    if (action !== 'remove') {
      var idNumber = editor.field('id_number');
      if (!validateTckn(idNumber.val())) {
        idNumber.error('Geçersiz TCKN.');
        noError = false;
      }
      var phoneNumber = editor.field('phone_number');
      if (!validatePhoneNumber(phoneNumber.val())) {
        phoneNumber.error('Geçersiz telefon numarası: Lütfen on rakamlı bir numara giriniz.');
        noError = false;
      }
      var data = $('#drivers').dataTable().fnGetData();
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        if (row.id_number == idNumber.val() && row.id != o.id) {
          idNumber.error('Mükerrer TCKN.');
          noError = false;
        }
      }
    }
    return noError;
  });

  $('#drivers').dataTable({
    paging: false,
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
    },
    dom: "T<'clear'>lfrtip",
    ajax: "drivers/api",
    columns: [
      {"data": "DT_RowId"},
      {"data": "name"},
      {"data": "surname"},
      {"data": "id_number"},
      {"data": "mother_name"},
      {"data": "father_name"},
      {"data": "birthplace"},
      {"data": "birth_date"},
      {"data": "phone_number"},
      {"data": "permission_status"},
      {"data": "has_license_scan"}
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
