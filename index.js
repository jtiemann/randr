require('gmaps')
const axios = require('axios');
const R = require('ramda')
const throttle = require('lodash.throttle');

const apiCall = coords => {
	return axios({
	  method: 'post',
	  url: '/getDataByCoords',
	  data: coords
	});};

const theThen = prom => prom.then(resp => {
  	document.querySelector('#raves').innerHTML=""
  	document.querySelector('#rants').innerHTML=""

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

const drawMap = (position) => {
	theMap = new GMaps({
	el: '#map',
	lat: position.coords.latitude,
	lng: position.coords.longitude,
	bounds_changed: throttle(R.compose(theThen, apiCall, getData), 1000)
	});}

var x = document.getElementById("map");
const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(R.compose(drawMap));
    } 
    else x.innerHTML = "Geolocation is not supported by this browser."}

getLocation();
