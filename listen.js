
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
  console.log("Log from inject.js");
  // var documentUrl = chrome.extension.getBackgroundPage().currentActiveTabUrl;
  API.searchProductsWithUrl(currentActiveTabUrl, function(products) {
    console.log(products)
    if(products) {
      var productId = products[0].id;
      
      API.productDetails(productId, function(similarProducts) {
        console.error(similarProducts);
        //sending request through chrome extension
        $("#header").append("Similar Products Across Different Online Market Stores");
        $("#similar-products").append("<tr id='listingProduct'><th style='text-align:left'>Product Link</th style='text-align:left'><th style='text-align:left'>Store Name</th><th>Sale Price</th></tr>");
        $("#loading").hide();
        $.each(similarProducts.offers, function(index, similarProduct) {
          console.log("Found a similar product!");
          console.log(similarProduct);
          $("#similar-products").append("<tr id= 'listingProduct'><td><a target='_blank' href='" + similarProduct.productUrl + "'>" + similarProduct.title + "</a></td><td id='storeName'>" + similarProduct.storeName + "</td><td id='salePrice'>$" + similarProduct.price.salePrice + "</td> </tr>");
                                             
                                             
                                        
        });
      }, function(error) {
      });
    } else {
      $("#loading").hide();
      $("#message").text("No Similar Products Found");
    }
  }, function(error) {

  });  
}
