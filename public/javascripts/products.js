var editor;

$(document).ready(function () {
  editor = new $.fn.dataTable.Editor({
    ajax: "products/api",
    table: "#products",
    fields: [{
      label: "Ürün Cinsi:",
      name: "name"
    }]
  });

  $('#products').dataTable({
    dom: "T<'clear'>lfrtip",
    ajax: "products/api",
    columns: [
      {"data": "name"}
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
