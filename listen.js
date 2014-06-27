
// Indix API Client 
var API = {
  baseUrl: "https://api.indix.com/v1/",

  // Functions used for making API calls 

  searchProductsWithUrl:  function(url, success, error) { 
    var urlToFetch = API.baseUrl + "products?url=" + encodeURIComponent(url);
      API.sendRequest(urlToFetch, function(data) {
      console.log(data);
      success(data.response.products);
    });
  },

  getPriceHistory: function(pid,storeId,success,error) {
    var urlForPriceHistory = API.baseUrl + "products/" + pid + "/prices?storeId=" + storeId;
    API.sendRequest(urlForPriceHistory, function(data) {
      console.log(data);
      success(data.response.priceHistory);
    });
  },

  productDetails: function(pid,success,error) {

    var urlForProductDetails = API.baseUrl + "products/"  + pid + "?";
    API.sendRequest(urlForProductDetails,function(data) {
      console.log(data);
      success(data.response);
    });
  },

  sendRequest: function(urlToFetch, callback) {
    var app_id = "62c61a6c";
    var app_key = "d5817ba5a768a7672c7174a5badabc15";
    var finalUrlToFetch = urlToFetch + "&app_id=" + app_id + "&app_key=" + app_key;
    //console.log(finalUrlToFetch);
    $.getJSON(finalUrlToFetch, function(data) { 
      callback(data); 
    });
  }
};


window.addEventListener('load', function () {
  chrome.tabs.getSelected(null,function(tab){
    var currentActiveTabUrl = tab.url;
    initializePage(currentActiveTabUrl);
  });
});

function initializePage(currentActiveTabUrl) {
  
  console.log("Log from listen.js"); // Check for loading of page. 
  
  API.searchProductsWithUrl(currentActiveTabUrl, function(products) {
    console.log(products) // Display Products in console.
   
    if(products) {
      var productId = products[0].id; // Garb the Product ID to make the 2nd API Call later.
      
      API.productDetails(productId, function(similarProducts) {
        console.error(similarProducts); // Display Similar Products in console. 
        
        // Appending the data recieved from API calls to a table.
        $("#header").append("<p style = 'background-color: #E4E4E4;padding: 10px; border-radius: 10px;'>Product Matches Across Stores</p>");
        $("#similar-products").append("<tr id='listingProduct'><th style='text-align:left'>Product Link</th style='text-align:left'><th style='text-align:left'>Store Name</th><th id='price'>Price</th><th style='text-align:left;'>Availability</th> <th id = 'issueReport'>Report</th></tr>");
       
        // Adding the Export Data button to download table data as CSV       
        $("#exportCSV").append("<a href='#' class='export'>Export Data</a>")
         
         // Triggering an onclick event for download. 
        $(".export").on('click', function (event) {
          exportTableToCSV.apply(this, [$('#similar-products'), "exportLog."+productId+".csv"]);
        });
        
        // Redirect to the Report an Issue form on the click event
        $(".contactForm").on('click', function (event) {
          chrome.tabs.create({ url: form.html });
        });
        
        
        $("#loading").hide(); // Hide the AJAX loader once the page is rendered.


        //Displaying each of the matches (products) and appending as a table row.
        $.each(similarProducts.offers, function(index, similarProduct) {
          
          console.log("Found a similar product!"); // Regular console checks.
          console.log(similarProduct);

          // Table data which is appended in the popup. 
          $("#similar-products").append("<tr id= 'listingProduct'><td><a target='_blank' title='Last Updated On " + new Date(similarProduct.lastRecordedAt) + "' href='" + similarProduct.productUrl + "'>" + trimTitleToNChars(similarProduct.title,50) + "</a></td><td id='storeName'>" + similarProduct.storeName + "</td><td id='salePrice'>" + (similarProduct.price.salePrice).toFixed(2) + "</td> <td id = 'availability'>" + similarProduct.availability + "</td> <td id = 'issueTab'> <a href='form.html?id=" + similarProduct.id + "&name=" + similarProduct.title + "' class='round-button'></a> </td> </tr>");

          API.getPriceHistory(similarProduct.id,similarProduct.storeId)
                              
        });

        // Sorting the table based on the Sale Prices. 
        $(document).ready(function() {
          sortTableData(); 
        });
        
  
      }, function(error) {});
    } else {
        $("#loading").hide();
        $("#message").text("No Similar Products Found");
      }
  }, function(error) {});
}

// Function to Trim the title to first N characters.
function trimTitleToNChars(title,titleLength) {
  if(title.length > titleLength) {
    return title.substring(0, titleLength) + "...";
  } else return title;
}

// Function to export the Tabular Data in the Popup as a CSV file
function exportTableToCSV($table, filename) {

  //console.log(filename);
  var $rows = $table.find('tr:has(td)'),

      // Temporary delimiter characters unlikely to be typed by keyboard
      // This is to avoid accidentally splitting the actual contents
      tmpColDelim = String.fromCharCode(11), // vertical tab character
      tmpRowDelim = String.fromCharCode(0), // null character

      // actual delimiter characters for CSV format
      colDelim = '","',
      rowDelim = '"\r\n"',

      // Grab text from table into CSV formatted string
      csv = '"' + $rows.map(function (i, row) {
          var $row = $(row),
              $cols = $row.find('td');

          return $cols.map(function (j, col) {
              var $col = $(col),
                  text = $col.text();

              return text.replace('"', '""'); // escape double quotes

          }).get().join(tmpColDelim);

      }).get().join(tmpRowDelim)
          .split(tmpRowDelim).join(rowDelim)
          .split(tmpColDelim).join(colDelim) + '"',
      
      blob = new Blob([csv], { type: 'text/csv' }); 
      var csvUrl = URL.createObjectURL(blob);

      $(this)
      .attr({
          'download': filename,
          'href': csvUrl
      });

}

//Function to Sort the table 
function sortTableData(){

    var tbl = document.getElementById("similar-products").tBodies[0];
    var store = [];

    for(var i=0, len=tbl.rows.length; i<len; i++){
        var row = tbl.rows[i];
        var sortnr = parseFloat(row.cells[2].textContent || row.cells[2].innerText);
        if(!isNaN(sortnr)) store.push([sortnr, row]);
    }

    store.sort(function(x,y){
        return x[0] - y[0];
    });

    for(var i=0, len=store.length; i<len; i++){
        tbl.appendChild(store[i][1]);
    }

    store = null;
}

 function toLocalDate (inDate) {
    var date = new Date();
    date.setTime(inDate.valueOf() - 60000 * inDate.getTimezoneOffset());
    return date;
}

