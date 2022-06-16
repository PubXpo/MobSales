<h1>Widget Sales</h1>

Widget Sales is a **free and open-source** stock ordering platform for the Android mobile OS. It gets clients and stock data from a remote server, generates orders and invoices and visualises delivery distances on a map. 

## Features

### Real-Time Location

When users launch the app, they see an interface and their current map position. Users must enter their ID, Password and client ID to interact with the widget and order features.

### Begin order 

When clicking on Begin Order to start an empty order, displaying the orders along the day’s journey with markers, where the location of clients’ addresses are used to place the markers.

After successfully beginning an order the user and client detail form gets disabled to prevent users from accidentally changing order details while in an order. The application then updates the map and informs the user of the total order for today’s journey for the client they are working on.

### Navigate

Navigating the widgets catalogue (with Previous and Next buttons) and display of widget images, in addition to the description and asking price.

A user can interact with the Prev Widget and Next Widget buttons. This would update the image and product details and price.

### Add to Order

Adding the currently displayed widget to the order items, including the amount and the agreed price. The order is saved to the web service. 

Each time widget items are added to the order, the item is saved to web service then appended to the order list. So entries that is shown in the order list confirms that it was saved.

### Displaying the sum of ordered items including VAT at a rate of 20%.

Scrolling down the order list will show the calculations of VAT and totals for that Order ID. It also contains the client details at the end of the list.

### End the order

Clicking on end order, clears the order and returns the layout to begin order stage.

## Deployment

### Tech stack:

- **Cordova** powers the REST API and mobile features
- **AJAX** and JavaScript are used for the dynamic parts of the interface
- **Node.js** powers the streaming API

### Requirements:

- **Openstack**
- **HERE Map API Key**
- **Node.js** 14+

The Sales App implements REST APIs to make calls to a remote server. To ensure that the information in transit is not incorrectly encrypted, the app must install the Cordova plug in:
 	
    cordova-plugin-enable-cleartext-traffic

This is attained by calling the following codes from the terminal:
 
    cordova plugin add cordova-plugin-enable-cleartext-traffic
    cordova prepare

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.