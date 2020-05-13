const apikey = '85c36847b0824547b09be916bb261e75';
const main = document.querySelector('#main');
const mainHtml = main.innerHTML;

const wellStatus = document.querySelector('#well');
const suppliesStatus = document.querySelector('#supplies');
const medicalStatus  = document.querySelector('#medical');
const viewMap = document.querySelector('#viewmap');
const homeButton = document.querySelector('#home');

var reportStatus;

function getCookie(cname) {
    /**
     * Function to get cookie
     * @param {string} cname Cookie name.
     */
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

function setCookie(cname, cvalue, exdays) {
    /**
     * Function to set cookie
     * @param {string} cname Cookie name.
     * @param cvalue Cooke value
     * @param exdays Expiry days
     */
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function setHomeEventListener() {
    /**
     * Set event listener to home
     */

    wellStatus.addEventListener('click', e => {
        statusClicked(getCookie('healthyStatusId'));
    });

    suppliesStatus.addEventListener('click', e => {
        statusClicked(getCookie('suppliesStatusId'));
    });

    medicalStatus.addEventListener('click', e => {
        statusClicked(getCookie('medicalStatusId'));
    });

    viewMap.addEventListener('click', e => {
        map();
    });

    homeButton.addEventListener('click', e => {
        window.location.replace('index.html');
    });
}

window.addEventListener('load', async e => {
    /**
     * Set event listener on load
     */
    setHomeEventListener()
});

async function statusClicked(status) {
    /**
     * Function to be run after a status is clicked
     * @param {Report object} status Report object containing latest user status
     */

    reportStatus = status;

    await report(status)
        .then(
            data => {
                console.log(data);
                const view = `
                <div class="container">
                        <div class="row" id="main">
                            <div class="col-sm-12">
                                <div class="tr-section">
                                    <div class="post-content">
                                        <p tabindex="0">Status updated</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="tr-section">
                                    <a id="viewmap" class="btn btn-lg btn-secondary col-sm-12" href="#" role="button">View Map</a>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="tr-section">
                                    <div class="post-content">
                                        <p tabindex="0">Status has been updated click above </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- /.row -->
                    </div>`

                main.innerHTML = view;
                
                // Add event listener to view map
                const viewMap = document.querySelector('#viewmap');
                viewMap.addEventListener('click', e => {
                    map();
                });

            }
        );

}

function setAttributes(elem, attrs) {
    /**
     * Set multiple attribute to object using JSON
     */
    for(var key in attrs) {
        elem.setAttribute(key, attrs[key]);
    }
}

function getStyle(gridGeoJson) {
    /**
     * Get correct style for certain Grid Score
     * @param gridGeoJson GeoJson feature of Grid Score
     */

    let score = parseInt(gridGeoJson.properties.total_score);
    switch (score) {
        case 0: 
            color = "green"; 
            break;
        case 2:
            color = "yellow"; 
            break;
        case 3:
            color = "red"; 
            break;
    }

    let style = {
        color: color,
        weight: 1,
        fillOpacity: 0.5   
    };

    return style;
}

function renderGrid(value) {
    /**
     * Render Grid Score to map.
     */
    let coords = value.geometry.coordinates[0];

    /*
     Leaflet uses Lat Lng instead of Lng Lat so
     we will reverse it manually
     */
     
    coords = [
        [coords[0][1],coords[0][0]],
        [coords[1][1],coords[1][0]],
        [coords[2][1],coords[2][0]],
        [coords[3][1],coords[3][0]],
        [coords[4][1],coords[4][0]]
    ]
    
    // Add grid to layer. The layer is already added to the map
    gridLayer.addLayer(L.polygon(coords, getStyle(value)));
}

async function getGrid(bounds) {
    /**
     * Retrieve grid score from API using BBox and 
     * call function to add it to map
     * @param bounds bounds object from Leaflet getBounds()
     */

    // Clear all element in gridLayer
    gridLayer.clearLayers();

    /*
    Fetch grid score using BBbox
    BBox is transformed to match the API format
    */
    customFetch(
        'http://localhost:8000/api/v1/grid-score/?in_bbox=' + transformBBox(bounds)
    ).then(
        data => {
            data.features.forEach(renderGrid);
            return data;
        }
    )
}

function transformBBox(leafletBounds) {
    /**
     * Transform Leaflet Bounds to BBox
     * Format: Left, Top, Right, Bottom
     * @param bounds bounds object from Leaflet getBounds()
     */

    let bound = leafletBounds.getWest() + ',' + leafletBounds.getNorth() + ',' +
                leafletBounds.getEast() + ',' + leafletBounds.getSouth();
    return bound
}

async function map() {
    /**
     * Render map to page
     */
    const view = `
    <div class="container">
        <div class="row" id="main">
            <div id="map" style="height:80vh;width:100vw">
            </div>
        </div>
        <!-- /.row -->
    </div>`

    main.innerHTML = view;

    // Set default layer (OSM)
    window.baseLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors,'+
            ' <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '+
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiemFtdXpha2tpIiwiYSI6ImNrOXp1NzIxYzA1eW4zZ2xsNDVkamIyaHEifQ.NilvKOQdAclqr3X1JU-MwQ'
    })

    // Add new layer for grid score
    window.gridLayer = new L.FeatureGroup();

    // Instantiate new Map with and add previously created layer
    window.reportMap = L.map('map',{
        center: [-33.92210531996986, 18.40417142576775],
        worldCopyJump: true, 
        zoom: 13,
        layers: [baseLayer, gridLayer]
    });

    // Base layer for layer control
    var baseMaps = {
        "Maps": window.baseLayer,
    };

    // Grid layer for layer control
    var overlayMaps = {
        "Grids": gridLayer
    };

    // Add to layer control, then add to Map
    L.control.layers(baseMaps, overlayMaps).addTo(reportMap);

    // Load initial grid
    getGrid(reportMap.getBounds());

    // As we pan and zoom, load associated grid
    reportMap.on('moveend', function(event) {   
        var bounds = event.target.getBounds();
        /* 
        To ease the API because of the number of grid,
        we only load grid when zoom level is more than 10
        */
        if(event.target.getZoom() >= 10){
            getGrid(bounds);
        }
    });

}

function showPosition(position) {
    /**
     * Get user location and
     * set to cookies
     */
    let location = {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude
    }

    setCookie('location', JSON.stringify(location), 3)
    return location;
}

async function getLocation() {
    /**
     * Get user location from browser popup
     */
    if(getCookie('location')==""){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getLocation_success, getLocation_error);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }
}

function getLocation_success(pos){
    /**
     * Calback function if getLocation() success
     */
    showPosition(pos);
}

function getLocation_error(err){
    /**
     * Callback function if getLocation() error
     */
    console.warn('ERROR(' + err.code + '): ' + err.message);
}

async function report(status) {
    /**
     * Post report to API
     */

     // Get location cookie
    let location = JSON.parse(getCookie('location'));


    var payload = {
        user: getCookie('userId'),
        status: status,
        location: {
            type: "Point",
            coordinates: [
                location.longitude,
                location.latitude
            ]
        }
    };

    // Post report, then add last report to cookie
    customFetch('http://0.0.0.0:51202/api/v1/report/', 'POST', payload)
        .then(
            data => setCookie('lastReport', JSON.stringify(data), 3)
        )
}

async function customFetch(url = '', method = 'GET', payload = {}) {
    /**
     * Custom function to fetch URL
     * @param url URL to fetch
     * @param method Request method
     * @param payload Data to be sent in the Request body
     */

    /* 
    Default options are marked with *
    No body by default
    */
    let props = {
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }

    // If method is not GET or HEAD, use body
    if (!(['GET', 'HEAD'].includes(method))) {
        props.body = JSON.stringify(payload); // body data type must match "Content-Type" header
    }

    let response = await fetch(url, props);
    let data = await response.json();
    return data;
}

function saveUserId() {
    /**
     * Check if User ID data is already saved in cookies.
     * If not, then get it from the API and save it.
     */

    if(getCookie('userId')==""){
        customFetch('http://0.0.0.0:51202/api/v1/user/', 'POST')
            .then(data => 
                setCookie('userId', data.id, 30)
            );
    }
}

function getStatusId() {
    /**
     * Get status ID and save to cookies.
     * Saved ID will be used for creating report
     */
    
    //  Get status for 'All Well Here'
    if(getCookie('healthyStatusId')=="") {
        customFetch('http://0.0.0.0:51202/api/v1/status/?name_contains=well')
            .then(data => {
                if (data.count == 1) {
                    setCookie('healthyStatusId', data.results[0].id, 30)
                }
            });
    }

    //  Get status for 'Need Food or Supplies'
    if(getCookie('suppliesStatusId')=="") {
        customFetch('http://0.0.0.0:51202/api/v1/status/?name_contains=supplies')
            .then(data => {
                if (data.count == 1) {
                    setCookie('suppliesStatusId', data.results[0].id, 30)
                }
            });
    }
    
    //  Get status for 'Need Medical Help'
    if(getCookie('medicalStatusId')=="") {
        customFetch('http://0.0.0.0:51202/api/v1/status/?name_contains=medical')
            .then(data => {
                if (data.count == 1) {
                    setCookie('medicalStatusId', data.results[0].id, 30)
                }
            });
    }
}


$(document).ready(function() {
    /*============================================
    Scroll To Top
    ==============================================*/

    // Save user ID to local Storage
    saveUserId();

    // Get all status ID
    getStatusId();

    // Get User lcoation
    getLocation();

    //When distance from top = 250px fade button in/out
    $(window).scroll(function() {
        if ($(this).scrollTop() > 250) {
            $('#scrollup').fadeIn(300);
        } else {
            $('#scrollup').fadeOut(300);
        }
    });

    //On click scroll to top of page t = 1000ms
    $('#scrollup').click(function() {
        $("html, body").animate({ scrollTop: 0 }, 1000);
        return false;
    });

});
