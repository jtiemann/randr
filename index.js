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
    doRenderMarkers(resp)
    doRenderRantsAndRaves(resp)
    doAddeventListeners()
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

const doRenderMarkers = function(idata, single=false){
	if (single == true) {
		 var h = new Array()
		 var t =  h.slice.call(document.querySelectorAll('[data-iw]')).map(r=>parseInt(r.dataset.iw))
         var idx = Math.max(...t) + 1
	}
	    idata.data.map((data,i) => {
		    theMap.addMarker({
				  lat: single ? userLatLng.value.split(",")[0] : data[1].latlng[0] + i*.0003,
				  lng: single ? userLatLng.value.split(",")[1] : data[1].latlng[1] + i*.0003,
				  title: single ? textR.value :  data[1].text,
				  mouseout: function(e) { theMap.hideInfoWindows() },
				  mouseover: function(e){ this.infoWindow.open(this.map, this) },
				  infoWindow: {content: `<p>${single ? textR.value :  data[1].text}</p>`},
				  id: single ? idx : i
	        })
     	})
     	return idata
	}

const doRenderRantsAndRaves = function(idata, single=false) {
	if (single == true) {
		 var h = new Array()
         var idx = Math.max(... h.slice.call(document.querySelectorAll('[data-iw]')).map(r=>parseInt(r.dataset.iw))) + 1
    }
    idata.data.map((data,i) => {
		if (single  && document.querySelector('input[name="rantOrRave"]:checked').value == "imARant" || !single && data[1].r == "Rant") 
			document.querySelector('#rants').innerHTML = document.querySelector('#rants').innerHTML 
	    	+ `<div data-iw="${single ? idx : i}" class="rant"> 
	                <div class="rText">${single ? textR.value : data[1].text}</div> 
	                <div class="rName"> ${ single ? rOrRSignature.value : data[0].lname}</div> 
	                <div class="rDate">${single ? (new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString() : (new Date(data[1].timedate)).toLocaleDateString() + " " + (new Date(data[1].timedate)).toLocaleTimeString()   }</div>
	           </div>`

        else 
        	document.querySelector('#raves').innerHTML = document.querySelector('#raves').innerHTML 
	    	+ `<div data-iw="${single ? idx : i}" class="rave">
	                <div class="rText">${single ? textR.value : data[1].text }</div> 
	                <div class="rName"> ${  single ? rOrRSignature.value : data[0].lname}</div> 
	                <div class="rDate">${single ? (new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString() : (new Date(data[1].timedate)).toLocaleDateString() + " " + (new Date(data[1].timedate)).toLocaleTimeString()   }</div>
	           </div>`
     	})
     	return idata	
}
const doAddeventListeners = function(idata){
	var h = new Array()
    var openMarkerText = (e) => {
		 		theMap.hideInfoWindows()
		 		let jim = theMap.markers.filter(x=>x.id === parseInt(e.target.dataset.iw))[0]
		 		jim.infoWindow.open(theMap, jim)
		    }

    h.slice.call(document.querySelectorAll('[data-iw]'))
        .map(r=> { r.removeEventListener('mouseenter', openMarkerText); return r})
        .map(r=> { r.addEventListener('mouseenter', openMarkerText); return r})

        return idata
}

getLocation();

var modal = document.getElementById('myModal');
var btn = document.getElementById("addR");
var span = document.getElementsByClassName("close")[0];
btn.onclick = function() {
	document.querySelector("#userLatLng").value = myLatLng
    modal.style.display = "block";
}
span.onclick = function() {
    modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.getElementById('addRantOrRaveForm').addEventListener('submit',  evt => {
	evt.preventDefault()
	console.log(userLatLng.value.split(","), 
				document.querySelector('input[name="rantOrRave"]:checked').value, 
				textR.value, 
				rOrRSignature.value)

    apiCall('/postR')({type: document.querySelector('input[name="rantOrRave"]:checked').value == 'imARant' ? 'rant' : 'rave', text: textR.value, lname: rOrRSignature.value, latlng:userLatLng.value.split(",")})
    doRenderMarkers({data: ["empty"]}, true)
    doRenderRantsAndRaves({data: ["empty"]}, true)
    doAddeventListeners()

    modal.style.display = "none";
    
	return false
})