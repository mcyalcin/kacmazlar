$(document).ready(function() {
  $('#drivers').dataTable( {
    "ajax": "drivers/api",
    "columns": [
      { "data": "name" },
      { "data": "surname" },
      { "data": "id_number" },
      { "data": "mother_name" },
      { "data": "father_name" },
      { "data": "birthplace" },
      { "data": "phone_number" }
    ]
  } );
});
