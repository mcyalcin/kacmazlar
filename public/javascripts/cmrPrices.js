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
      def: function() { return new Date(); }
    }, {
      label: "Geçerlilik Sonu:",
      name: "end_date",
      type:  "date",
      def: function() { return new Date(); }
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
      aButtons: [
        {sExtends: "editor_create", editor: editor},
        {sExtends: "editor_edit", editor: editor},
        {sExtends: "editor_remove", editor: editor}
      ]
    }
  });
});
