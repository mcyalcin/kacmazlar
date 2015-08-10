var editor;

$(document).ready(function () {
  $.getJSON('vehicles/api/options', function(data) {

    editor = new $.fn.dataTable.Editor({
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
      }]
    });

    $('#vehicles').dataTable({
      dom: "T<'clear'>lfrtip",
      ajax: "vehicles/api",
      columns: [
        {"data": "type"},
        {"data": "license_plate"},
        {"data": "subcontractor"},
        {"data": "license_holder"},
        {"data": "c2_holder"}
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
});
