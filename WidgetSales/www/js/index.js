/**
 * Please install the cleartext plugin:
 *
 * cordova plugin add cordova-plugin-enable-cleartext-traffic
 * cordova prepare
 * 
 */

// Execute in strict mode to prevent some common mistakes
"use strict";

// Declare a WidgetSales object for use by the HTML view
var controller;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);
    // Create the WidgetSales object for use by the HTML view
    controller = new WidgetSales();
}
// JavaScript "class" containing the model, providing controller "methods" for the HTML view
function WidgetSales() {
    console.log("Creating controller/model");

    // PRIVATE VARIABLES AND FUNCTIONS - available only to code inside the controller/model
    // configure database access URL
    var BASE_GET_URL = "[enter database URL here]";
    var BASE_URL = BASE_GET_URL;

    // initialise student openstack OUCU and password 
    var oucu;
    var password;

    // initialise client data variables to be collected from API database
    var client;
    var client_name;
    var client_address;
    var client_lon;
    var client_lat;
    var client_phone;
    var client_email;

    // initialise widget and order data variables to be collected from API database
    var widget_id;
    var order_id;
    var order_date;
    var total_cost;
    var widget_description;    
    var get_widget_item = 0;

    // hardcode and get credentials for testing only.
    function set_hard_code_cred(){
        oucu = getInputValue("oucu", "[enter username]");
        password = getInputValue("password", "[enter password]");
    }
    set_hard_code_cred();
    function get_credentials(){    
        oucu = getInputValue("oucu", "");
        password = getInputValue("password", "");
    }
    get_credentials();
  

    // ----------------------------------------//
    // FR1 - Validate orders

    // FR1.1 Validate the OUCU starts with a letter and ends with a number
    // use preconfigured method from helper file
    // set input blank so it reads data input directly from form 
    // return true if oucu is valid, otherwise false
    function oucu_isValid() {
        return getInputValue("oucu", "") != "";
    }

    // FR1.2 Navigating the widgets catalogue (with Previous and Next buttons) 
    // and display of widget images, in addition to the description and asking price.
    // add a function that calls the widget image and data from the remote database
    // initialise a document image variable collects the current image and updates the html element 
    var doc_image = document.getElementById("widget_image");
    // initialise an image counter that checks the amount of items in the element
    var count;
    function update_widget() {
        function onSuccess(obj) {
            if (obj.status == "success") {
                count = obj.data.length - 1;
                // update the widget id
                widget_id = obj.data[get_widget_item].id;
                // update the widget description
                widget_description = obj.data[get_widget_item].description;
                // update the html image
                doc_image.src = obj.data[get_widget_item].url;
                // update the html alternative description
                doc_image.alt = widget_description;
                // update the widget caption
                document.getElementById("widget_caption").innerHTML = widget_description + " @ £" + (obj.data[get_widget_item].pence_price / 100).toFixed(2);
                //  show item id in log
                console.log("now on widget_id= " + widget_id);
                // if there is an error, show a message
            } else if (obj.message) {
                alert(obj.message);
            } else {
                alert("Error: Please check the details and try again");
            }
        }
        // Get all the  widget images and data
        var widgetUrl = BASE_URL + "widgets?OUCU=" + oucu + "&password=" + password;
        console.log("updating widget: Sending GET to " + widgetUrl);
        $.ajax(widgetUrl, { type: "GET", data: {}, success: onSuccess });
    }

    // add function to call the previous widget details
    function prev_widget() {
        if ((get_widget_item <= count) && (get_widget_item >= 0)) {
            get_widget_item--;
        }
        else {
            get_widget_item = count;
            console.log("reset from item: " + get_widget_item);
        }
        update_widget();
    }

    // add function to call the next widget details
    function next_widget() {
        if ((get_widget_item <= count) && (get_widget_item >= 0)) {
            get_widget_item++;
        }
        else {
            get_widget_item = 0;
            console.log("reset from item: " + get_widget_item);
        }
        update_widget();
    }

    // add function that responds when user clicks add to order button
    // initialise a get subtotal variable as an integer.
    var getSubtotal = 0;
    function add_to_order(number, agreed_price, widget_id, order_id) {
        // FR1.3 Adding the currently displayed widget to the order items,
        // including the amount and the agreed price.
        function update_orders() {
            var ele = document.createElement('p');
            var order = widget_description + "(" + number + ") @ £" + parseFloat(agreed_price).toFixed(2);
            var new_order = document.createTextNode(order);
            // display a log in console
            console.log("New item added to order:");
            console.log(ele);
            // take current item and append it to order element
            ele.appendChild(new_order);
            document.getElementById("order_description").appendChild(ele);
        }

        // FR1.4 Displaying the sum of ordered items 
        // including VAT at a rate of 20%.
        // initialise variable for order and totals display
        var order_price = agreed_price * number;
        getSubtotal += order_price;
        var getVAT = getSubtotal * .20;
        total_cost = (getSubtotal + getVAT).toFixed(2);

        // add function that updates html elements with calculated bill and order details.
        // require function be completed before posting to database
        async function display_bill() {
            // update html order details elements
            // update current item 
            update_orders();
            // update subtotal at 2 decimal places
            document.getElementById("subtotal").innerHTML = "<br><b>Subtotal:</b> &pound" + getSubtotal.toFixed(2);
            // update VAT at 2 decimal places
            document.getElementById("vat").innerHTML = "<b>VAT:</b> &pound" + getVAT.toFixed(2);
            // update total at 2 decimal places
            document.getElementById("total").innerHTML = "<b>Total is:</b> &pound" + total_cost;
            // update Order ID caption
            document.getElementById("order_details").innerHTML = "<b>Order ID: " + order_id  + " ON: "+ order_date +"</b>" 
            // update client details
            document.getElementById("client_details").innerHTML = "<br><b>" + client_name + "</b><p>" + client_address + "</p><p>" + client_phone + "</p><p>" + client_email + "</p>";
        }

        // FR1.5 The order is saved to the web service. 
        // add function that posts to the database when a widget is added to order
        // require function be completer after display bill is finished.
        async function post_bill(widget, order) {
            widget = widget_id;
            order = order_id;
            await display_bill();
            function onSuccess(obj) {
                // log result
                if (obj.status == "success") {
                    console.log("posted item");
                    // inform user
                    alert("new item saved to order")
                } else if (obj.message) {
                    alert(obj.message);
                } else {
                    console.log("Error: Please check the details and try again");
                }
            }
            // post the order to the order items API
            var order_item_url = BASE_URL + "order_items";
            console.log("posting order: Sending POST to " + order_item_url);
            $.ajax(order_item_url, {
                type: "POST",
                data: {
                    OUCU: oucu,
                    password: password,
                    order_id: order,
                    widget_id: widget,
                    number: number,
                    pence_price: (order_price * 100),
                },
                success: onSuccess,
            });
        }
        post_bill();
    }

    // ----------------------------------------//
    // FR2 - For the salesperson to review their performance

    // FR2.1 Displaying a Map for the area around the current location 
    // of the salesperson when placing or viewing an order.

    // initialise HERE Map canvas
    var platform = new H.service.Platform({
        // add unique api key obtained from HERE Maps
        apikey: "[enter API key here]",
    });

    // Obtain the default map types from the platform object:
    var defaultLayers = platform.createDefaultLayers();

    // Instantiate (and display) a map object:
    var map = new H.Map(
        document.getElementById("mapContainer"),
        defaultLayers.vector.normal.map,
        {
            zoom: 12,
            center: { lat: 52.5, lng: 13.4 },
        }
    );

    // Create the default UI:
    var ui = H.ui.UI.createDefault(map, defaultLayers);
    var mapSettings = ui.getControl("mapsettings");
    var zoom = ui.getControl("zoom");
    var scalebar = ui.getControl("scalebar");
    mapSettings.setAlignment("top-left");
    zoom.setAlignment("top-left");
    scalebar.setAlignment("top-left");
    // Enable the event system on the map instance:
    var mapEvents = new H.mapevents.MapEvents(map);
    // Instantiate the default behavior, providing the mapEvents object:
    new H.mapevents.Behavior(mapEvents);

    var markers = []; // array of markers that have been added to the map

    // Obtain the device location and centre the map
    function centreMap() {
        function onSuccess(position) {
            console.log("Obtained position", position);
            var point = {
                lng: position.coords.longitude,
                lat: position.coords.latitude,
            };
            map.setCenter(point);
        }
        function onError(error) {
            console.error("Error calling getCurrentPosition", error);

            // Inform the user that an error occurred
            alert("Error obtaining location, please try again.");
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
        });
    }

    // Clear any markers added to the map (if added to the markers array)
    function clearMarkersFromMap() {
        // This is implemented for you and no further work is needed on it
        markers.forEach(function (marker) {
            if (marker) {
                map.removeObject(marker);
            }
        });
        markers = [];
    }

    // Look up the addresses and add a marker to the map that address position
    function addMarkerToMap() {

        // add marker point to map interface
        var marker = new H.map.DomMarker({ lat: client_lat, lng: client_lon });
        map.addObject(marker);

        // add marker to markers array
        markers.push(marker)

        // center map to marker points
        map.setCenter({ lat: client_lat, lng: client_lon });

        // show marker entry in console
        console.log("New marker entry: address= " + client_address + "; latitude= " + client_lat + "; longitude= " + client_lon);
    }

    //  Update the map with addresses and markers for orders
    function updateMap() {
        // clear the existing markers
        clearMarkersFromMap();
        // add the new markers
        addMarkerToMap();
    }

    // FR2.2 When clicking on Begin Order to start an empty order, 
    // displaying the orders along the day’s journey with markers, 
    // where the location of clients’ addresses are used to place the markers.

    // add function that updates html elements when user clicks begin order button.
    // require function be completed after getting client data from API
    async function begin_order(client, client_lat, client_lon) {
        await get_client_data(client);
        function onSuccess(obj) {
            if (obj.status == "success") {
                order_id = obj.data[0].id;
                order_date = obj.data[0].date;
                // show log of item
                console.log("client = " + client_name);
                console.log("order_id: " + order_id);
                console.log("lat: " + client_lat + "\nlon: " + client_lon);
                // disable the user details form to prevent accidentally changing orders
                disable_form(true);
                // enable order area to allow new details to be added to current order 
                disable_order_area(false);
                // update map with current day's order
                updateMap();
                // check and inform user of current day's order
                check_orders();
                // check an inform of errors
            } else if (obj.message) {
                alert(obj.message);
            } else {
                console.log("Error: Please check the details and try again");
            }
        }
        // post the to the orders API
        var orders_url = BASE_URL + "orders";
        console.log("posting order: Sending POST to " + orders_url);
        $.ajax(orders_url, {
            type: "POST",
            data: {
                OUCU: oucu,
                password: password,
                client_id: client,
                latitude: client_lat,
                longitude: client_lon,
            },
            success: onSuccess,
        });
    }

    // add a function that takes the current input of client entry from form
    //  then updates the variables with that clients details.
    async function get_client_data(client) {
        client = getInputValue("client", "");
        function onSuccess(obj) {
            if (obj.status == "success") {
                client_name = obj.data[0].name;
                client_phone = obj.data[0].phone;
                client_email = obj.data[0].email;
                client_address = obj.data[0].address;
                get_addressData(client_address);
            } else if (obj.message) {
                alert(obj.message);
            } else {
                console.log("Error: Please check the details and try again");
            }
        }
        // Get all the client data
        var clientUrl = BASE_URL + "clients/" + client + "?OUCU=" + oucu + "&password=" + password;
        console.log("client data: Sending GET to " + clientUrl);
        $.ajax(clientUrl, { type: "GET", data: {}, success: onSuccess });

        // add a function that uses the helper function nominatim.get 
        // to return the coordinates from the OpenStreetMap REST API 
        function get_addressData(client_address) {
            if (client_address) {
                var onSuccess = function (data) {
                    // get lat and lon from nominatim result
                    client_lat = data[0].lat;
                    client_lon = data[0].lon;
                }
                nominatim.get(client_address, onSuccess);
            }
        }
    }

    // add a function the checks the current date and returns the total current orders for today 
    async function check_orders() {
        var total_orders = 0;
        var today = new Date().toLocaleDateString();
        function onSuccess(obj) {
            if (obj.status == "success") {
                for (var i = 0; i < obj.data.length; i++) {
                    var order_date = new Date(obj.data[i].date).toLocaleDateString();
                    if ((today == order_date) && (obj.data[i].client_id == client)) {
                        total_orders++;
                        // log item in console
                        console.log(obj.data[i]);
                    }
                }
                // change field heading to client to inform the user
                document.getElementById("user_info").innerHTML = "<b>client: " + client_name + "</b>";
                // inform the user
                var inform = " Today's journey includes "+ total_orders + " order(s) for "+ client_name ;
                alert(inform);
                console.log(inform);
            } else if (obj.message) {
                alert(obj.message);
            } else {
                alert("Error: Please check the details and try again");
            }
        }
        // Get all the  widget images and data
        var ordersUrl = BASE_URL + "orders?OUCU=" + oucu + "&password=" + password;
        console.log("checking orders: Sending GET to " + ordersUrl);
        $.ajax(ordersUrl, { type: "GET", data: {}, success: onSuccess });
    }

    // ----------------------------------------//
    // entry validations and display control

    // add a function that must validate the entries when user clicks add to order button
    // return an error if entry is blank
    function entryChecker(oucu, user_password, client, number, agreed_price) {
        var oucu = document.getElementById("oucu").value;
        var user_password = password;
        var client = document.getElementById("client").value;
        var number = document.getElementById("number").value;
        var agreed_price = document.querySelector(".agreed_price").value;

        if ((oucu == null) || (user_password == "") || (client == "") ||
            (number == "") || (agreed_price == "")) {
            alert("an entry is missing");
            return false;
        } if (!document.getElementById("begin_order").elements[0].disabled) {
            alert("please begin order first");
            return false;
        } else {
            return true;
        }
    }

    // add a function that must validate the entries when user clicks begin order button
    // return an error if entry is blank
    function entryChecker2(oucu, user_password, client) {
        var oucu = document.getElementById("oucu").value;
        var user_password = document.getElementById("password").value;
        var client = document.getElementById("client").value;

        if ((oucu == null) || (user_password == "") || (client == "")) {
            alert("an entry is missing");
            return false;
        } else {
            return true;
        }
    }

    // add a function that disables and enables the user entry form
    // this will prevent accidentally changing details during orders
    function disable_form(n) {
        var user_area = document.getElementById("begin_order");
        for (var i = 0, l = user_area.elements.length; i < l; ++i) {
            user_area.elements[i].disabled = n;
        }
    }

    // add a function that disables and enables the order details form
    // this will require user begin an order before being able to add orders
    function disable_order_area(n) {
        var order_area = document.getElementById("order_area").getElementsByTagName('*');
        for (var i = 0; i < order_area.length; ++i) {
            order_area[i].disabled = n;
        }
    }

    // add a function that cleans the html display
    function reset_display() {
        get_widget_item = 0;
        update_widget();
        get_client_data(client);
        document.getElementById("user_info").innerHTML = "<b>Enter Details first!</b>";
        document.getElementById("order_details").innerHTML = "<b>Order Details</b>";
        document.getElementById("number").value = "";
        document.querySelector(".agreed_price").value = "";
        document.getElementById("client").value = "";
        document.getElementById("client_details").innerHTML = "";
        document.getElementById("order_description").innerHTML = "";
        document.getElementById("subtotal").innerHTML = "";
        document.getElementById("vat").innerHTML = "";
        document.getElementById("total").innerHTML = "";
        disable_order_area(true);
        centreMap();
    }
    reset_display();

    // ----------------------------------------//
    // PUBLIC FUNCTIONS - available to the view
    // Controller function for user to request previous widget
    this.prev_widget = function () {
        prev_widget();
    }
    
    // Controller function for user to request next widget
    this.next_widget = function () {
        next_widget();
    }

    // Controller function for user to add widget to order
    this.add_to_order = function () {
        // validate that entries are not blank
        if (entryChecker()) {
            // get current number entry from form
            var number = getInputValue("number", "");
            // get current agreed price entry from form
            var agreed_price = document.querySelector('.agreed_price').value;

            // Call the model using values from the view and collected values from the API
            add_to_order(number, agreed_price, widget_id, order_id);
        }
    }

    // Controller function for user to begin an order
    this.begin_order = function () {
        // only run if entries are not blank
        if (entryChecker2()) {
            // validate oucu
            // only run if the oucu is in correct format 
            if (oucu_isValid()) {
                // get current client entry from form
                client = getInputValue("client", "");

                // Call the model using values from the view and collected values from the API
                begin_order(client, client_lat, client_lon);
            }
        }
    }

    // Controller function for user to end an order
    this.end_order = function () {
        // enable user entry form
        disable_form(false);
        reset_display();
    }
}
