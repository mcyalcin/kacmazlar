$(document).ready(function () {
  $('#firms').dataTable({
    lengthMenu: [[10, 50, -1], [10, 50, 'Tüm']],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
    },
    dom: "T<'clear'>lfrtip",
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
