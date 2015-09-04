$(document).ready(function () {
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