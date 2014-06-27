



// Fetching the form parameters to be passed in the Google Spreadsheet 
$(document).ready(function() {
    var params = window.location.search.slice(1);
    params = params.split('&');
    var obj = {};
    params.forEach(function(val){
        val = val.split('=');
        obj[val[0]] = val[1];
    });
  // Sending Data to Google Spreadsheet 
  $("#send").click(function(){
    postDataToGoogle(obj);
  });

  //Display Reported Product Information on the form.
  displayProductDataOnForm(obj);

});

function displayProductDataOnForm(params) {
    console.log(params);
    var reportedProductTitle = decodeURIComponent(params.name);
    console.log(reportedProductTitle);
    console.log("Reported Product is "+reportedProductTitle);
    $("#reportedProduct").append("You are reporting for : <div id='productDescTitle'>" + reportedProductTitle + "<br><br>");
}

//Function to report the IP Address of the end user
$.getJSON("http://jsonip.com?callback=?", function (data) {
    console.log(data.ip);
});

// Function to transfer data directly to Google Spreadsheet 
function postDataToGoogle(params) {

    console.log(params)
    //params.id
    //params.name

	var name = $('#Name').val();
	console.log(name);
    var message = $('#Message').val();
    console.log(message);
    var pid = params.id;
    $.ajax({
        url: "https://docs.google.com/a/indix.com/forms/d/1XPLRRcUs2GdiRYVhVobRINKFBqOYU4mikjmvFSzlIaA/formResponse",
        data: { 
            "entry.2054576694": name, 
            "entry.1381512905": message,
            "entry.938557947": pid
        },
        type: "POST",
        success: function(data) {
            console.log("form submitted");
            window.location.replace("thankYou.html");

        }   
     });
}

