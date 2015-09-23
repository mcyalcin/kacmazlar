$(document).ready(function () {
  $('#drivers').dataTable({
    lengthMenu: [[10, 50, -1], [10, 50, 'Tüm']],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.10.7/i18n/Turkish.json'
    },
    dom: "T<'clear'>lfrtip",
    ajax: "drivers/api",
    columns: [
      {"data": "DT_RowId"},
      {"data": "name"},
      {"data": "surname"},
      {"data": "id_number"},
      {"data": "mother_name"},
      {"data": "father_name"},
      {"data": "birthplace"},
      {"data": "birth_date"},
      {"data": "phone_number"},
      {"data": "permission_status"},
      {"data": "has_license_scan"},
      {"data": "license_scan_uploaded"}
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
        },
        {
          sExtends: 'text',
          sButtonText: 'Resim İndir',
          fnClick: function () {
            var oTable = $('#drivers').dataTable();
            var row = oTable._('tr.selected');
            if (row.length != 1) {
              alert('Bir ve yalnız bir satır seçiniz.');
            } else {
              var xmlhttp = new XMLHttpRequest();
              xmlhttp.open("POST","drivers/api/licenseDownload",true);
              xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
              xmlhttp.send("id=" + row[0].DT_RowId);
              window.open(row[0].DT_RowId + ".jpg");
            }
          }
        }
      ]
    }
  });
});
