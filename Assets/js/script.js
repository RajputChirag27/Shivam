let categoryTable;
let categoryArray = [];
let currentCategory = {};
let countItems = 1;
$(document).ready(function () {
  categoryTable = $("#resultTable").DataTable();

  const todayDate = new Date();
  const dateStr = todayDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
  $('#launchDate').attr('max', dateStr);
  

  //   Function for Adding Row in a Modal
  function addItems(row) {
    $("#formTableBody").append(
      `
            <tr class="additionalItems">
            <td> <label for="itemName0" class="form-label">Item Name</label>
                <input type="text" id="itemName0" name="itemName0" class="form-control"
                    pattern="[a-zA-Z\s]+" required>
            </td>
            <td>
                <label for="itemDescription0" class="form-label">Item Description</label>
                <input id="itemDescription0" name="itemDescription0" type="text" class="form-control"
                    pattern="[a-zA-Z0-9\.\s]+" required>
            </td>
            <td>
                <label for="foodType0">Food Type</label>
                <select name="foodType0" id="foodType0" class="form-control mt-3"
                    required>
                    <option value="Veg" selected>Veg</option>
                    <option value="Dairy Food" selected>Dairy Food</option>
                    <option value="Sea Food" selected>Sea Food</option> 
                    <option value="Vegan" selected>Vegan</option>

                </select>
            </td>

            <td>
                <label for="price0">Price</label>
                <input type="number" name="price0" id="price0" class="form-control" min="1" required>
            </td>
            <td>
                <label for="discount0">Discount</label>
                <input type="number" name="discount0" id="discount0" class="form-control" min="0" max="15" required>
            </td>

            <td>
                <label for="GST0">GST</label>
                <input type="number" name="GST0" id="GST0" class="form-control" min="0" required>
            </td>

            <td>
                <label for="itemActive0${row}">isActive</label>
                <input type="radio" name="itemActive0${row}" id="itemActive0" value="true"
                    checked>
                <label for="itemActive0${row}">isNotActive</label>
                <input type="radio" name="itemActive0${row}" id="itemActive0" value="false">
            </td>
            <td>
                <button class="btn btn-danger" type="button" id="removeRowT">-</button>
            </td>

        </tr>
            `
    );
    row++;
  }

  // Adding Row in Modal
  $("#addRowBtn").click(function () {
    if (countItems < 10) {
      addItems(countItems);
      countItems++;
    } else {
      alert("Can't Add More than 10 items");
    }

    $("#formTableBody")
      .off("click", "#removeRowT")
      .on("click", "#removeRowT", function () {
        $(this).closest("tr").remove();
        countItems--;
      });
  });

  $("#addCategory").click(reset);
  // Fetching Data
  $("#foodForm").submit(function (e) {
    e.preventDefault();
    let itemArray = [];
    let itemObj;
    $("#formTableBody tr").each(function () {
      console.log($(this).find("#itemName0").val());
      itemObj = {
        iName: $(this).find("#itemName0").val(),
        iDesc: $(this).find("#itemDescription0").val(),
        iPrice: parseFloat($(this).find("#price0").val()),
        iDiscount: parseFloat($(this).find("#discount0").val()),
        iFoodType: $(this).find("#foodType0").val(),
        iGst: parseFloat($(this).find("#GST0").val()),
        iActive: $(this).find('[name="itemActive0"]:checked').val() == "true",
      };
      itemArray.push(itemObj);
    });
    console.log(itemObj);

    let CategoryObj = {
      id: $("#categoryName").val().toLowerCase() + "-" + Date.now(),
      cName: $("#categoryName").val(),
      cDesc: $("#categoryDescription").val(),
      cActive: $("#categoryActive:checked").val(),
      launchDate: $("#launchDate").val(),
      items: itemArray,
    };
    console.log(CategoryObj);
    
    let dataArrIndex = categoryArray.findIndex((item)=> item.id === currentCategory.id);
    
    if(dataArrIndex === -1){
      categoryArray.push(CategoryObj);
      display(categoryArray);
    } else{
      categoryArray[dataArrIndex] = CategoryObj;
      display(categoryArray);
    }

  });

  // Delete Function
  $("#resultTable tbody").on("click", "#deleteRowBtn", function () {
    let tr = $(this).closest("tr");
    let dataArrIndex = categoryArray.findIndex(
      (item) => item.id === tr.attr("id")
    );
    // console.log(dataArrIndex);
    if (dataArrIndex != -1) {
      categoryArray.splice(dataArrIndex, 1);
      display(categoryArray);
      console.log(categoryArray);
    }
  });

  // Edit Function
  $("#resultTable tbody").on("click", "#editRowBtn", function () {
    reset();
    let tr = $(this).closest("tr");
    let dataArrIndex = categoryArray.findIndex(
      (item) => item.id === tr.attr("id")
    );
    currentCategory = categoryArray[dataArrIndex];
    $("#modalId").modal("show");
    $("#categoryName").val(currentCategory.cName);
    $("#categoryDescription").val(currentCategory.cDesc);
    $("#launchDate").val(currentCategory.launchDate);

    for (i = 1; i < currentCategory.items.length; i++) {
      addItems();
    }
    $('#formTableBody tr').each((index, element) => {
      $(element)
      .find('input[name="itemName0"]')
      .val(currentCategory.items[index].iName); 
      $(element)
      .find('input[name="itemDescription0"]')
      .val(currentCategory.items[index].iDesc); 
      $(element)
      .find('input[name="foodType0"]')
      .val(currentCategory.items[index].iFoodType); 
      $(element)
      .find('input[name="price0"]')
      .val(currentCategory.items[index].iPrice); 
      $(element)
      .find('input[name="discount0"]')
      .val(currentCategory.items[index].iDiscount); 
      $(element)
      .find('input[name="GST0"]')
      .val(currentCategory.items[index].iGst); 
    })
  });

  // ChildRow Function

  $("#resultTable tbody").on("click", "#addRowBtn", function () {
    let tr = $(this).closest("tr");
    let row = categoryTable.row(tr);

    if (row.child.isShown()) {
      row.child.hide();
      tr.removeClass('shown')
    } else {
      let rowId = tr.attr("id");
      row.child(format(rowId)).show();
      tr.addClass('shown')
    }
  });
});
//  Document Ready Ends Here

// Display Table Function
function display(arrayCategory) {
  categoryTable.clear().draw();
  $.each(arrayCategory, function (index, element) {
    let isActiveDate = isActive(arrayCategory[index].launchDate);
    let ref = categoryTable.row
      .add([
        `
            <button type="button" class="btn btn-primary" id="addRowBtn">+</button>
            `,
        arrayCategory[index].cName,
        arrayCategory[index].cDesc,
        arrayCategory[index].cActive,
        isActiveDate,
        `
            <button type="button" class="btn btn-primary" id="editRowBtn">Edit</button>
            <button type="button" class="btn btn-danger" id="deleteRowBtn">Delete</button>
            `,
      ])
      .draw()
      .node();
    ref.setAttribute("id", arrayCategory[index].id);
  });
  console.log(arrayCategory);
  $("#modalId").modal("hide");
}

// Function for Checking the item
function isActive(launchDate) {
  let launchDateObj = new Date(launchDate);
  const newDate = new Date(Date.now());
  return (newDate - launchDateObj) / (24 * 7 * 60 * 60 * 1000) >= 1
    ? "Old"
    : "New";
}

// Format Child Rows  
function format(rowIds) {
  let discountedPrice = 0;
  let totalPrice = 0;
  let totalDiscountedPrice = 0;
  let dataArrIndex = categoryArray.findIndex((item) => item.id === rowIds);
  console.log(dataArrIndex);
  let html = `<div class='table-responsive'>
    <h2 class='text-center'>Items</h2>
    <table class='table'>
    <thead>
                    <th>Number</th>
                    <th>Item name</th>
                    <th>Food Type</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Discounted Price</th>
                </thead>
                <tbody>`;
  $.each(categoryArray[dataArrIndex].items, function (index, element) {
    discountedPrice =
      element.iPrice - element.iPrice * (element.iDiscount / 100);
    totalPrice += element.iPrice;
    totalDiscountedPrice += discountedPrice;
    html += `
    <tr>
    <td>${index + 1}</td>
    <td>${element.iName}</td>
    <td>${element.iFoodType}</td>
    <td>Rs. ${element.iPrice}</td>
    <td>${element.iDiscount}%</td>
    <td>Rs. ${discountedPrice}</td>
    </tr>
    `;
  });

  html += `<tr >
  <th class="border-0">Total
  </th>
  <th colspan="2" class="border-0"></th>
  <th class="border-0">Rs. ${totalPrice}
  </th>
  <th class="border-0"></th>
  <th class="border-0">Rs. ${totalDiscountedPrice}
  </th>
  <th colspan="2" class="border-0"></th>
  </tr>
  </tbody>
</table>
</div>`;

  return html;
}

// Reset Function
function reset() {
  countItems = 1;
  $("#foodForm")[0].reset();
  currentCategory = {};
  $(".additionalItems").remove();
}
