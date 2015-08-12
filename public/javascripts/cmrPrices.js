var editor;

$(document).ready(function () {
  editor = new $.fn.dataTable.Editor({
    ajax: "cmr_prices/api",
    table: "#cmr_prices",
    fields: [{
      label: "Ücret:",
      name: "price"
    }, {
      label: "Geçerlilik Başlangıcı:",
      name: "start_date",
      type:  "date",
      def: function() { return new Date(); },
      dateFormat: 'd.m.yy'
    }, {
      label: "Geçerlilik Sonu:",
      name: "end_date",
      type:  "date",
      def: function() { return new Date(); },
      dateFormat: 'd.m.yy'
    }]
  });

  $('#cmr_prices').dataTable({
    dom: "T<'clear'>lfrtip",
    ajax: "cmr_prices/api",
    columns: [
      {"data": "price"},
      {"data": "start_date"},
      {"data": "end_date"}
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
