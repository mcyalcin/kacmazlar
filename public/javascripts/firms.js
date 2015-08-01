var editor;

$(document).ready(function () {
  editor = new $.fn.dataTable.Editor({
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
    dom: "Tlfrtip",
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
          sButtonText: "Save",
          sButtonClass: "save-collection",
          aButtons: [ 'copy', 'csv', 'pdf' ]
        },
        'print'
      ]
    }
  });
});
