require('gmaps')
const axios = require('axios');
const R = require('ramda')
const throttle = require('lodash.throttle');
var myLatLng=[0,0],  theMap, mymap // Globals!!


const apiCall = urlStr => dataObj => {
	return axios({
	  method: 'post',
	  url: urlStr,
	  data: dataObj
	});}

const theThen = prom => prom.then(resp => {
    doClearMap()
    doRenderMarkers(resp)
    doRenderRantsAndRaves(resp)
    doAddeventListeners()
  	console.log(resp)
  })

const doClearMap = function(){
	document.querySelector('#raves').innerHTML=""
  	document.querySelector('#rants').innerHTML=""
    theMap.removeMarkers()
}
const preprocessGroupedData = function(data) {
        if (data.length > 1) {
        	data = data.reduce((sum, unit)=>{
                 sum.length == 0 ? sum = unit : sum[1].text = sum[1].text + "; " + unit[1].text
                 	//sum = R.assocPath([1,'text'], R.path([1,'text'], sum) + "; " + R.path([1,'text'], unit)) (sum)
                 return sum
            }, [])
        }
        else {
        	data = R.flatten(data)
        }	
        return data
}
const doRenderMarkers = function(idata, single=false){

	if (single == true) {
		 var h = new Array()
		 var t =  h.slice.call(document.querySelectorAll('[data-iw]')).map(r=>parseInt(r.dataset.iw))
         var idx = Math.max(...t) + 1
	}
	const s = R.sortWith([R.ascend(R.compose(R.toLower, R.path([2, "where"]))), R.ascend(R.path([1,'r'])), R.descend(R.path([1, "timedate"]))])
	const g = R.groupWith((a,b) => R.path([1, 'r'], a) == R.path([1, 'r'], b) && R.path([2, 'where'], a) == R.path([2, 'where'], b), R.clone(s(idata.data)))
	console.log('grouped: ', g)
	    g.map((data,i) => {
            data = preprocessGroupedData(data)	
		    	//Leaflet-MapBox Map, display only, no events yet.
	            //L.marker([single ? userLatLng.value.split(",")[0] : data[1].latlng[0], single ? userLatLng.value.split(",")[1] : data[1].latlng[1]  ]).addTo(mymap).bindPopup(single ? textR.value :  data[1].text)
	
            //gmap Map
		    theMap.addMarker({
				  lat: single ? userLatLng.value.split(",")[0] : data[1].latlng[0] ,
				  lng: single ? userLatLng.value.split(",")[1] : data[1].latlng[1] ,
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

	const s = R.sortWith([R.ascend(R.compose(R.toLower, R.path([2, "where"]))), R.ascend(R.path([1,'r'])), R.descend(R.path([1, "timedate"]))])
	const g = R.groupWith((a,b) => R.path([1, 'r'], a) == R.path([1, 'r'], b) && R.path([2, 'where'], a) == R.path([2, 'where'], b), R.clone(s(idata.data)))
	console.log('grouped: ', g)
	    g.map((data,i) => {
            data = preprocessGroupedData(data)	

        // render a rant or rave
		if (single  && document.querySelector('input[name="rantOrRave"]:checked').value == "imARant" || !single && data[1].r == "Rant") 
			document.querySelector('#rants').innerHTML = document.querySelector('#rants').innerHTML 
	    	+ `<div data-iw="${single ? idx : i}" class="rant"> 
	    		    <div class="where">${single ? where.value : data[2].where}</div> 
	                <div class="rText">${single ? textR.value : data[1].text}</div> 
	                <div> 
	                  <span class="rName"> ${ single ? rOrRSignature.value : data[0].lname} </span>
	                  <span class="rDate">${single ? (new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString() : (new Date(data[1].timedate)).toLocaleDateString() + " " + (new Date(data[1].timedate)).toLocaleTimeString()   }</span>
	                </div>
	           </div>`

        else 
        	document.querySelector('#raves').innerHTML = document.querySelector('#raves').innerHTML 
	    	+ `<div data-iw="${single ? idx : i}" class="rave">
	    		    <div class="where">${single ? where.value : data[2].where}</div> 
	                <div class="rText">${single ? textR.value : data[1].text }</div> 
	                <div> 
	                  <span class="rName"> ${ single ? rOrRSignature.value : data[0].lname} </span>
	                  <span class="rDate">${single ? (new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString() : (new Date(data[1].timedate)).toLocaleDateString() + " " + (new Date(data[1].timedate)).toLocaleTimeString()   }</span>
	                </div>
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

const getData = map => {
	return {
	    nelat: map.getBounds().getNorthEast().lat(),
	  	nelng: map.getBounds().getNorthEast().lng(),
	  	swlat: map.getBounds().getSouthWest().lat(),
	  	swlng: map.getBounds().getSouthWest().lng()
		}}

const drawMap = position => {
    myLatLng = [position.coords.latitude, position.coords.longitude]
	/*     //Leaflet-MapBox Map
    mymap = L.map('mapid').setView(myLatLng, 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoianRpZW1hbm4iLCJhIjoiY2owMGRxNjByMDIxejMzbXlzeDFxNnBkdyJ9.h6F_Md4FOBrOB7yRE_KoLA', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'your.mapbox.project.id',
	    accessToken: 'pk.eyJ1IjoianRpZW1hbm4iLCJhIjoiY2owMGRxNjByMDIxejMzbXlzeDFxNnBkdyJ9.h6F_Md4FOBrOB7yRE_KoLA'
    }).addTo(mymap);*/
    //GMap map
	theMap = new GMaps({
	el: '#map',
	lat: position.coords.latitude,
	lng: position.coords.longitude,
	bounds_changed: throttle(R.compose(theThen, apiCall('/getDataByCoords'), getData), 1000)
	})}

var x = document.getElementById("map");
const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(R.compose(drawMap));
    } 
    else x.innerHTML = "Geolocation is not supported by this browser."}

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
				where.value,
				textR.value, 
				rOrRSignature.value)

    apiCall('/postR')({type: document.querySelector('input[name="rantOrRave"]:checked').value == 'imARant' ? 'rant' : 'rave', 
    	               where: where.value, 
    	               text: textR.value, 
    	               lname: rOrRSignature.value, 
    	               latlng:userLatLng.value.split(",")})
    doRenderMarkers({data: ["empty"]}, true)
    doRenderRantsAndRaves({data: ["empty"]}, true)
    doAddeventListeners()

    modal.style.display = "none";
    
	return false
})


