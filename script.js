$(document).ready(function () {
  getDataAndFillTable();
  setTableHeaderClickListener();
  setButtonListeners();
});

function shouldSwitchRows(row1data, row2data, sortDir) {
  if (sortDir == "asc") {
    return row1data.innerText.toLowerCase() > row2data.innerText.toLowerCase()
  } else {
    return row1data.innerText.toLowerCase() < row2data.innerText.toLowerCase()
  }
}

function setButtonListeners() {
  $('form').submit(function (event) {
    event.preventDefault();
    addEntryToDb();
  });

  $('#reset-db').click(function () {
    resetDb();
  });

  $('#update-db').click(() => {
    console.log("Update button clicked");
    if (formsAreEmpty()) {
      alert("Please fill in all input forms first!");
    } else {
      updateDbEntry();
    }
  });

  $('#delete-db').click(() => {
    if ($('input[name="id"').val().trim().length == 0) {
      alert("Please fill in ID field!");
    } else {
      deleteDbEntry();
    }
  });

  $('#retrieve-db').click(()=>{
    retrievePhone();
  });
}

function formsAreEmpty() {
  var isEmpty = false;
  $('input[type="text"]').each(function () {
    if ($(this).val().trim().length == 0) {
      isEmpty = true;
    }
  });
  return isEmpty
}

function setTableHeaderClickListener() {
  $('th').click(function () {
    var colClicked = $(this).parent().children().index($(this));
    if (colClicked > 0) {
      var tableId = $(this).closest('table').attr('id');
      sortTableColumn(colClicked, tableId);
    }
  });
}

function sortTableColumn(column, tableId) {
  // Following w3 sorting table example
  // https://www.w3schools.com/howto/howto_js_sort_table.asp
  var table = document.getElementById(tableId);
  var switching = true;
  var sortDir = "asc";
  var switchCount = 0;

  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    switching = false;
    let shouldSwitch = false;
    // Loop through all rows (except th row and last row)
    for (i = 1; i < (table.rows.length - 2); i++) {
      currtRowData = table.rows[i].getElementsByTagName("td")[column];
      nextRowData = table.rows[i + 1].getElementsByTagName("td")[column];
      // Check to see if they should switch based on asc/dsc
      shouldSwitch = shouldSwitchRows(currtRowData, nextRowData, sortDir);
      if (shouldSwitch) break;
    }
    if (shouldSwitch) {
      // Make the switch & mark switching = true
      table.rows[i].parentNode.insertBefore(table.rows[i + 1], table.rows[i]);
      switching = true;
      switchCount++;
    } else {
      /* If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again. */
      if (switchCount == 0 && sortDir == "asc") {
        sortDir = "desc";
        switching = true;
      }
    }
  }
}

function resetDb() {
  $.ajax({
    url: "/resetdb",
    method: "GET",
    dataType: "json",
    success: function (data, status, xhr) {
      console.log(data, status, xhr);
      alert(`Status: ${xhr.status}. ${xhr.responseJSON["success"]}`);
      getDataAndFillTable();
    },
    error: function (xhr, resp, text) {
      console.log(xhr, resp, text);
      alert(`Status: ${xhr.status}. ${xhr.responseJSON["error"]}`);
    }
  });
}

function deleteDbEntry() {
  let id = $('input[name="id"]').serialize();
  $.ajax({
    url: "/delete",
    method: "POST",
    dataType: "json",
    data: id,
    success: function (data, status, xhr) {
      console.log(data, status, xhr);
      alert(`Status: ${xhr.status}. ${xhr.responseJSON["success"]}`);
      getDataAndFillTable();
    },
    error: function (xhr, resp, text) {
      console.log(xhr, resp, text);
      alert(`Status: ${xhr.status}. ${xhr.responseJSON["error"]}`);
    }
  });
}

function retrievePhone() {
  let id = $('input[name="id"]').serialize();
  $.ajax({
    url: "/retrievephone",
    method: "POST",
    dataType: "json",
    data: id,
    success: function (data, status, xhr) {
      console.log(data, status, xhr);
      alert(`Status: ${xhr.status}.\nID: ${xhr.responseJSON.id}\nBrand: ${xhr.responseJSON.brand}\nModel: ${xhr.responseJSON.model}`);
      getDataAndFillTable();
    },
    error: function (xhr, resp, text) {
      console.log(xhr, resp, text);
      alert(`Status: ${xhr.status}. ${xhr.responseJSON["error"]}`);
    }
  });
}

function updateDbEntry() {
  var formData = $("form").serialize();

  $.ajax({
    url: "/update",
    method: "PUT",
    dataType: "json",
    data: formData,
    success: function (data, status, xhr) {
      console.log(data, status, xhr);
      alert(`Status: ${xhr.status}. ${xhr.responseJSON["success"]}`);
      getDataAndFillTable();
    },
    error: function (xhr, resp, text) {
      console.log(xhr, resp, text);
      alert(`Status: ${xhr.status}. ${xhr.responseJSON["error"]}`);
    }
  });
}
function addEntryToDb() {
  var formData = $("form").serialize();

  $.ajax({
    url: "/addphone",
    method: "POST",
    dataType: "json",
    data: formData,
    success: function (data, status, xhr) {
      console.log(data, status, xhr);
      alert(`Status: ${xhr.status}. ${xhr.responseJSON["success"]} Phone id: ${xhr.responseJSON["id"]}`);
      getDataAndFillTable();
    },
    error: function (xhr, resp, text) {
      console.log(xhr, resp, text);
      alert(`Status: ${xhr.status}. ${xhr.responseJSON["error"]}`);
    }
  });
}

function getDataAndFillTable() {
  $.ajax({
    url: "/getdata",
    method: "GET",
    dataType: "json",
    success: function (data, status, xhr) {
      console.log(data, status, xhr);
      clearTableRows();
      fillTable(data);
    },
    error: function (xhr, resp, text) {
      console.log(xhr, resp, text);
      alert(`Status: ${xhr.status}. ${xhr.responseJSON["error"]}`);
    }
  });
}

function clearTableRows() {
  $("#top-products").find("tr:not(:nth-child(0)):not(:nth-last-child(1))").remove();
}

function fillTable(phoneData) {
  phoneData.forEach(function (entry) {
    $("#top-products tbody").prepend($('<tr>')
      .append($('<td>').append($('<img>').attr('src', entry["url"]).attr('alt', 'Image of phone').attr('class', 'product-img')))
      .append($('<td>').append($('<strong>').text(entry["brand"])))
      .append($('<td>').append(entry["model"]))
      .append($('<td>').append(entry["screensize"]))
      .append($('<td>').append(entry["os"]))
      .append($('<td>').append(entry["id"]))
    );
  });
}
