$(document).ready( function() {

    var map = null;
    var directionsManager = null;
    var from = "";
    var to = "";

    $('form').submit( function(event) {
    	from = $(this).find("input[name='from']").val();
    	to = $(this).find("input[name='to']").val();
    	loadDirMod(from, to);
    });

    GetMap();

});

    function GetMap() {
        // Initialize the map
        //map = new Microsoft.Maps.Map(document.getElementById("mapDiv"),{credentials:"AjAy6KaXrp60YctWqivsjNNd9i63nGKCrJuqR7VrBHRRJ8viGq2PH8uCmAm1hLi4"});
        //Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: directionsModuleLoaded });
        map = new Microsoft.Maps.Map(document.getElementById("mapDiv"),{credentials:"AjAy6KaXrp60YctWqivsjNNd9i63nGKCrJuqR7VrBHRRJ8viGq2PH8uCmAm1hLi4"});
    };

    function loadDirMod(from, to) {
    	console.log('From: ' + from + ' To: ' + to);
        Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: directionsModuleLoaded });
    };

    function directionsModuleLoaded(from, to) {

        // Initialize the DirectionsManager
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);

        // Create start and end waypoints
        console.log('From: ' + from + 'To: ' + to);
        //var startWaypoint = new Microsoft.Maps.Directions.Waypoint({address:"Hidden Spings, ID"}); 
        //var endWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: "Austin, TX" } );

        directionsManager.addWaypoint(startWaypoint);
        directionsManager.addWaypoint(endWaypoint);

        // Set the id of the div to use to display the directions
        directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('itineraryDiv') });

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
