document.addEventListener('deviceready', onDeviceReady);

/*inicializamos variables globales*/
let latitude = 0;
let longitude = 0;
let inicializado = 0;
let asignado = 0;
let latitudef = 0;
let longitudef = 0;
let marker;
let cursor;
let cursor_creado = 0;
let vibracion = 1;
const map = L.map('the_map')
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
			maxZoom: 18,
	}).addTo(map);




function onDeviceReady(){
	console.log(navigator.vibrate);
	console.log(navigator.geolocation);

	const watchId = navigator.geolocation.watchPosition(geolocationSuccess,geolocationError);//obtiene posicion

	map.on('click', onMapClick); /*obtiene click en el mapa*/
	
}


function geolocationSuccess(position){
	/*otenemos coordenadas actuales*/
	latitude = position.coords.latitude;
	longitude= position.coords.longitude;
	/*si el mapa no se ha inicilizado con la posicion actual lo hacemos*/
	if(inicializado==0){
		map.setView([latitude,longitude], 13);
		inicializado=1;
	}
	/*si el cursor esta creado lo borramos*/
	if(cursor_creado == 1) map.removeLayer(cursor);
	/*creamos cursor con la posición actual, servirá para saber donde estamos*/
	cursor = L.marker([latitude, longitude]).addTo(map);
	cursor_creado=1;
	cursor.bindPopup("<b>Pos Actual</b>").openPopup();

	/*si hemos asigando destino y la vibracion está activada*/
	if (asignado==1 ){
		/*obtengo distancia*/
		let distancia = getKilometros(latitude,longitude,latitudef,longitudef);
		/*agragamos distancia al html*/
		strdistancia("Distancia: "+distancia+" Km");
    	/*si la distancia es menor a 1km el movil vibrará por un segundo
    	para parar vibración hay que eliminar el destino */
		if(distancia<1){
			vibrar(distancia);
		}
	}

}

function geolocationError(err){
	console.log(err);
}

/*escribe en el div distancia el string pasado por parámetro*/
function strdistancia(stringd){
	const container = document.querySelector("#distancia");
  	container.innerHTML = "";
  	let element = document.createElement('p');
    element.innerHTML = stringd;
    container.appendChild(element);
}

/*vibra durante 4 segundos*/
function vibrar(distancia){
    strdistancia("Distancia: "+distancia+" Km - Vas a llegar! Para la vibracion eliminando el destino!");
	navigator.vibrate(4000);
	console.log("vibrar");
}


/*funciona llamada al detectar un click sobre el mapa*/
function onMapClick(e) {
	/*sin no hemos asignado ningún destindo se asigna*/
	if(asignado==0){
		asignado=1;
    	
    	/*obtenemos coordeandas finales*/
		latitudef = e.latlng.lat;
		longitudef = e.latlng.lng;
		/*escibrimos la información en el html*/
    	const container = document.querySelector("#ubi");
  		container.innerHTML = "";
  		let element = document.createElement('p');
    	element.innerHTML = "Destino: "+e.latlng + "<button class='bremove'> Eliminar Destino </button>"; /*creamos boton para borrar destino*/
    	container.appendChild(element);
    	marker = L.marker([latitudef, longitudef]).addTo(map);/*marcador posición final*/
    	marker.bindPopup("<b>Pos Final</b>").openPopup();
    	let distancia = getKilometros(latitude,longitude,latitudef,longitudef);
    	strdistancia("Distancia: "+distancia+" Km");
    	/*si la distancia es menor a 1km llamamos a la función vibrar*/
    	if(distancia<1){
    		vibrar(distancia);
		}
    	
    	var bremove = document.querySelectorAll('.bremove'); /*obtenemos botones remove*/
  		for(var i = 0; i < bremove.length; i++) {
   			bremove[i].addEventListener('click', remove);/*capturamos el evento click*/
  		}
  		
	}    
}
/*se ejecuta al pulsar el boton borrar destino
borrar el destino el marcador y el texto*/
function remove(){
	latitudef = 0;
	longitudef = 0;
	asignado=0;
	const container = document.querySelector("#ubi");
  	container.innerHTML = "";
  	let element = document.createElement('p');
    element.innerHTML = "Selecciona destino";
    container.appendChild(element);
    const container2 = document.querySelector("#distancia");
  	container2.innerHTML = "";
    map.removeLayer(marker);
}

/*obtiene la distancia en km entre la posición inicial y final*/
getKilometros = function(lat1,lon1,lat2,lon2){
	rad = function(x) {return x*Math.PI/180;}
	var R = 6378.137; /*Radio de la tierra en km*/
	var dLat = rad( lat2 - lat1 );
	var dLong = rad( lon2 - lon1 );
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;
	return d.toFixed(3); /*Retorna tres decimales*/
}

