var editor;

$(document).ready(function () {
  $.getJSON('vehicles/api/options', function(data) {
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
      ajax: "vehicles/api",
      table: "#vehicles",
      fields: [{
        label: "Araç Türü:",
        name: "type",
        type: "select",
        options: data.typeOptions,
        def: "Çekici"
      }, {
        label: "Plaka:",
        name: "license_plate"
      }, {
        label: "Taşeron:",
        name: "subcontractor",
        type: "select",
        options: data.subcontractorOptions,
        def: data.subcontractorDef
      }, {
        label: "Ruhsat Sahibi:",
        name: "license_holder",
        type: "select",
        options: data.licenseHolderOptions,
        def: data.licenseHolderDef
      }, {
        label: "C2 Sahibi:",
        name: "c2_holder",
        type: "select",
        options: data.c2HolderOptions,
        def: data.c2HolderDef
      }, {
        label: "Gümrük izni?",
        name: "permission_status",
        type: "select",
        options: data.permissionOptions,
        def: data.permissionDef
      }, {
        name: "DT_RowId",
        type: "hidden"
      }]
    });

    function validateLicensePlate(value) {
      var f1 = /^[0-9]{2}[a-zA-Z][0-9]{4}$/;
      var f2 = /^[0-9]{2}[a-zA-Z]{2}[0-9]{3}$/;
      var f3 = /^[0-9]{2}[a-zA-Z]{2}[0-9]{4}$/;
      var f4 = /^[0-9]{2}[a-zA-Z]{3}[0-9]{2}$/;
      var s = value.toString().replace(/ /g, '');
      return f1.test(s) || f2.test(s) || f3.test(s) || f4.test(s);
    }

    editor.on('preSubmit', function(e, o, action) {
      var noError = true;
      if (action != 'remove') {
        var licensePlate = editor.field('license_plate');
        if (!validateLicensePlate(licensePlate.val())) {
          licensePlate.error('Geçersiz plaka.');
          noError = false;
        }
        var data = $('#vehicles').dataTable().fnGetData();
        for (var i = 0; i < data.length; i++) {
          var row = data[i];
          // TODO: improve this check - use dtrowid, upper lhs
          if (row.license_plate.replace(/\s/g, '') == licensePlate.val().replace(/\s/g, '').toUpperCase() && row.id != o.id) {
            licensePlate.error('Mükerrer plaka.');
            noError = false;
          }
        }
      }
      o.DT_RowId = o.id;
      return noError;
    });

    $('#vehicles').dataTable({
      lengthMenu: [[-1, 50, 10], ["Tüm", 50, 10]],
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
      },
      dom: "T<'clear'>lfrtip",
      ajax: "vehicles/api",
      columns: [
        {"data": "DT_RowId"},
        {"data": "type"},
        {"data": "license_plate"},
        {"data": "subcontractor"},
        {"data": "license_holder"},
        {"data": "c2_holder"},
        {"data": "permission_status"}
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
