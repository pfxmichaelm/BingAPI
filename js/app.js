$(document).ready( function() {

    var map = null;
    var directionsManager = null;
    var from = "";
    var to = "";
    var geoLocationProvider = null;
    var point = "";
    var loc = "";

    $('form').submit( function(event) {
      from = $(this).find("input[name='from']").val();
      to = $(this).find("input[name='to']").val();
      directionsModuleLoaded(from, to);
      clearRouteDirections();
    });    

    GetMap(); 
    //weather(loc);   

});

  function clearRouteDirections() {
        $("input[name='to'], input[name='from']").on("input", function() {
            directionsManager.clearDisplay();
            directionsManager.resetDirections();
        });
  };

    function GetMap() {
        // Initialize the map
        //map = new Microsoft.Maps.Map(document.getElementById("mapDiv"),{credentials:"AjAy6KaXrp60YctWqivsjNNd9i63nGKCrJuqR7VrBHRRJ8viGq2PH8uCmAm1hLi4"});
        //Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: directionsModuleLoaded });
        var options = {credentials: "AjAy6KaXrp60YctWqivsjNNd9i63nGKCrJuqR7VrBHRRJ8viGq2PH8uCmAm1hLi4", center: new Microsoft.Maps.Location(45.5, -115.7), zoom: 6, customizeOverlays: true}
        map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), options);
        //Microsoft.Maps.loadModule('Microsoft.Maps.Themes.BingTheme');
        Microsoft.Maps.loadModule('Microsoft.Maps.Directions');
        Microsoft.Maps.loadModule('Microsoft.Maps.Overlays.Style');
        Microsoft.Maps.Events.addHandler(map, 'click', displayEventInfo);

        // Initialize the location provider
        //geoLocationProvider = new Microsoft.Maps.GeoLocationProvider(map);        
        //geoLocation();

        //http://api.wunderground.com/api/15855692ccbbd2e6/animatedradar/q/ID/Boise.gif?newmaps=0&timelabel=1&timelabel.y=10&num=5&delay=50;
    };

    function displayEventInfo(e) {
        if (e.targetType == "map") {
            point = new Microsoft.Maps.Point(e.getX(), e.getY());
            loc = e.target.tryPixelToLocation(point);
            //document.getElementById("textBox").value = loc.latitude + ", " + loc.longitude;
            weather(loc);
        };
    };

    function capitalize(str) {
        strVal = '';
        str = str.split(' ');
        for (var chr = 0; chr < str.length; chr++) {
            strVal += str[chr].substring(0, 1).toUpperCase() + str[chr].substring(1, str[chr].length) + ' '
        }
        return strVal
    };    

  function weather(loc) {
    lat = loc.latitude.toFixed(5);
    lon = loc.longitude.toFixed(5);
    position = lat + "," + lon;
    console.log(position);
    $.ajax({
      //url : "http://api.wunderground.com/api/15855692ccbbd2e6/forecast/q/ID/Boise.json",
      url : "http://api.aerisapi.com/observations/closest?p=" + lat + "," + lon + "&client_id=Qx5JEdETofhBL8kjLqmxY&client_secret=2TMjswWFZD1f1bDU0xgBQAcCWbuaZZcdOBdaKspa",
      dataType : "jsonp",
      success : function(parsed_json) {
      //var location = parsed_json['location']['city'];
      console.log(parsed_json);
      var html = "";
      var weather = parsed_json['response'][0]['ob']['weather'];
      var tempF = parsed_json['response'][0]['ob']['tempF'];
      var place = parsed_json['response'][0]['place']['name'];
      place = capitalize(place);
      console.log("Nearest Weather Station: " + place + " - Current Temp & Conditions: " + tempF + "F and " + weather);
      html += 'Station: ' + place + ' Condition: ' + tempF + 'F & ' + weather;
      console.log(html);
      $('#modal').html(html);
      $('#weatherModal').click();
      $('#weatherModal').removeClass('weather-off').addClass('weather-on');      
      }
    });     
  };

/*    $('#openModal').on(function(event) {
      event.preventDefault();
      console.log(html);
      //$.get(this.p, function(html) {
        $(html).appendTo('p').modalDialog();
      //});
    });*/

    function directionsModuleLoaded(from, to) {
        console.log('From: ' + from + ' To: ' + to);

        // Initialize the DirectionsManager
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);


        // Create start and end waypoints
        //var startWaypoint = new Microsoft.Maps.Directions.Waypoint({address:"Hidden Spings, ID"}); 
        //var endWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: "Austin, TX" } );
        var startWaypoint = new Microsoft.Maps.Directions.Waypoint({address: from });
        //var viaWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: "1 Microsoft Way, Redmond, WA" , isViapoint: true }); 
        var endWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: to });

        directionsManager.addWaypoint(startWaypoint);
        directionsManager.addWaypoint(endWaypoint);

        // Set request options
        //directionsManager.setRequestOptions({ avoidTraffic: traffic, routeOptimization: Microsoft.Maps.Directions.RouteOptimization.rtOpt});

        // Set the id of the div to use to display the directions
        directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('directionsDiv') });

        // Specify a handler for when an error occurs
        Microsoft.Maps.Events.addHandler(directionsManager, 'directionsError', displayError);

        // Calculate directions, which displays a route on the map
        directionsManager.calculateDirections();

    }; 

    function displayError(e) {
        // Display the error message
        alert(e.message);

        // If the error is a disambiguation error, display the results.
        if (e.responseCode == Microsoft.Maps.Directions.RouteResponseCode.waypointDisambiguation)
        {
           SelectFirstDisambiguationResult();
        }

    };

     
    function SelectFirstDisambiguationResult() {
        var results = "";

        var waypoints = directionsManager.getAllWaypoints();

        var recalculate = false;

        var i = 0;
        for (i=0; i<waypoints.length; i++)
        {

           var disambigResult = waypoints[i].getDisambiguationResult();

           if (disambigResult != null)
           {
              // Reset the address to the first business or location suggestion
              var firstAddress = disambigResult.businessSuggestions.length > 0 ? disambigResult.businessSuggestions[0].address : disambigResult.locationSuggestions[0].suggestion;
              waypoints[i].setOptions({ address: firstAddress });

              // Set the recalculate flag since the waypoint address was changed
              recalculate = true;
           }
        }

        if (recalculate)
        {
           directionsManager.calculateDirections();
        }
    };