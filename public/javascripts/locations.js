var editor;

$(document).ready(function () {
  editor = new $.fn.dataTable.Editor({
    ajax: "locations/api",
    table: "#locations",
    fields: [{
      label: "Ad:",
      name: "name"
    }, {
      label: "Ülke:",
      name: "country",
      type:  "select",
      options: [
        { label: "Türkiye", value: "Türkiye" },
        { label: "Irak", value: "Irak" }
      ],
      def: "Türkiye"
    }]
  });

  $('#locations').dataTable({
    dom: "T<'clear'>lfrtip",
    ajax: "locations/api",
    columns: [
      {"data": "name"},
      {"data": "country"}
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