var editor;

$(document).ready(function () {
  editor = new $.fn.dataTable.Editor({
    ajax: "vehicles/api",
    table: "#vehicles",
    fields: [{
      label: "Araç Türü:",
      name: "type",
      type: "select",
      options: ["Çekici", "Dorse", "Tanker"],
      def: "Çekici"
    }, {
      label: "Plaka:",
      name: "license_plate"
    }, {
      label: "Taşeron:",
      name: "subcontractor"
    }, {
      label: "Ruhsat Sahibi:",
      name: "license_holder"
    }, {
      label: "C2 Sahibi:",
      name: "c2_holder"
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
