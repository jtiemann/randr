require('gmaps')
const axios = require('axios');
const R = require('ramda')
const throttle = require('lodash.throttle');
var myLatLng=[0,0]
const apiCall = urlStr => dataObj => {
	return axios({
	  method: 'post',
	  url: urlStr,
	  data: dataObj
	});}

const theThen = prom => prom.then(resp => {
  	document.querySelector('#raves').innerHTML=""
  	document.querySelector('#rants').innerHTML=""
    theMap.removeMarkers()

    resp.data.map((data,i) => {
	    theMap.addMarker({
			  lat: data[1].latlng[0] + i*.0003,
			  lng: data[1].latlng[1] + i*.0003,
			  title: data[1].text,
			  mouseout: function(e) { theMap.hideInfoWindows() },
			  mouseover: function(e){ this.infoWindow.open(this.map, this) },
			  infoWindow: {content: `<p>${data[1].text}</p>`},
			  id: i
        })
    // render randr's
    if (data[1].r == "Rant") document.querySelector('#rants').innerHTML = document.querySelector('#rants').innerHTML 
    	+ `<div data-iw="${i}" class="rant">
                <div class="rText">${data[1].text}</div> <div class="rName"> ${data[0].fname + " " + data[0].lname}</div> <div class="rDate">${(new Date(data[1].timedate)).toLocaleDateString() + " " + (new Date(data[1].timedate)).toLocaleTimeString()}</div>
           </div>`
    else document.querySelector('#raves').innerHTML = document.querySelector('#raves').innerHTML 
    	+ `<div data-iw="${i}" class="rave">
                <div class="rText">${data[1].text}</div> <div class="rName"> ${data[0].fname + " " + data[0].lname}</div> <div class="rDate">${(new Date(data[1].timedate)).toLocaleDateString() + " " + (new Date(data[1].timedate)).toLocaleTimeString()}</div>
           </div>`
    });
    // add events on text randrs to open infoWindow
    [].slice.call(document.querySelectorAll('[data-iw]'))
        .map(r=>r.addEventListener('mouseenter', 
		 	(e) => {
		 		theMap.hideInfoWindows()
		 		let jim = theMap.markers.filter(x=>x.id === parseInt(e.target.dataset.iw))[0]
		 		jim.infoWindow.open(theMap, jim)
		    }))
  	console.log(resp)
  })

const getData = map => {
	return {
	    nelat: map.getBounds().getNorthEast().lat(),
	  	nelng: map.getBounds().getNorthEast().lng(),
	  	swlat: map.getBounds().getSouthWest().lat(),
	  	swlng: map.getBounds().getSouthWest().lng()
		}}

const drawMap = position => {
    myLatLng = [position.coords.latitude, position.coords.longitude]
	theMap = new GMaps({
	el: '#map',
	lat: position.coords.latitude,
	lng: position.coords.longitude,
	bounds_changed: throttle(R.compose(theThen, apiCall('/getDataByCoords'), getData), 1000)
	});}

var x = document.getElementById("map");
const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(R.compose(drawMap));
    } 
    else x.innerHTML = "Geolocation is not supported by this browser."}

getLocation();

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("addR");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
	document.querySelector("#userLatLng").value = myLatLng
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.getElementById('addRantOrRaveForm').addEventListener('submit',  evt => {
	evt.preventDefault()
    console.log(evt)
	console.log(userLatLng.value.split(","), 
				document.querySelector('input[name="rantOrRave"]:checked').value, 
				textR.value, 
				rOrRSignature.value)

    

	    theMap.addMarker({
			  lat: userLatLng.value.split(",")[0],
			  lng: userLatLng.value.split(",")[1],
			  title: textR.value,
			  mouseout: function(e) { theMap.hideInfoWindows() },
			  mouseover: function(e){ this.infoWindow.open(this.map, this) },
			  infoWindow: {content: `<p>${textR.value}</p>`},
			  id:1000
        })
    // render randr's
    if (document.querySelector('input[name="rantOrRave"]:checked').value == "imARant") document.querySelector('#rants').innerHTML = document.querySelector('#rants').innerHTML 
    	+ `<div data-iw="1000" class="rant"> 
                <div class="rText">${textR.value}</div> <div class="rName"> ${ rOrRSignature.value}</div> <div class="rDate">${(new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString()}</div>
           </div>`
    else document.querySelector('#raves').innerHTML = document.querySelector('#raves').innerHTML 
    	+ `<div data-iw="1000" class="rave">
                <div class="rText">${textR.value}</div> <div class="rName"> ${ rOrRSignature.value}</div> <div class="rDate">${(new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString()}</div>
           </div>`

    // add events on text randrs to open infoWindow
    var h = new Array()
    h.slice.call(document.querySelectorAll('[data-iw]'))
        .map(r=>r.addEventListener('mouseenter', 
		 	(e) => {
		 		theMap.hideInfoWindows()
		 		let jim = theMap.markers.filter(x=>x.id === parseInt(e.target.dataset.iw))[0]
		 		jim.infoWindow.open(theMap, jim)
		    }))
  	console.log('hi')

    modal.style.display = "none";
    
	return false
})