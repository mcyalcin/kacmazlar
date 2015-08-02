var editor;

$(document).ready(function () {
  editor = new $.fn.dataTable.Editor({
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
      label: "Telefon Numarası:",
      name: "phone_number"
    }
      //,  {
      //  label: "Doğum Tarihi:",
      //  name: "birth_date",
      //  type: "date"
      //}
    ]
  });

  $('#drivers').dataTable({
    dom: "T<'clear'>lfrtip",
    ajax: "drivers/api",
    columns: [
      {"data": "name"},
      {"data": "surname"},
      {"data": "id_number"},
      {"data": "mother_name"},
      {"data": "father_name"},
      {"data": "birthplace"},
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
          aButtons: [ 'copy', 'csv', 'pdf' ]
        },
        'print'
      ]
    }
  });
});
