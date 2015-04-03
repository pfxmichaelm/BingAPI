$(document).ready( function() {

    var map = null;
    var directionsManager = null;
    var from = "";
    var to = "";

    $('form').submit( function(event) {
    	from = $(this).find("input[name='from']").val();
    	to = $(this).find("input[name='to']").val();
    	directionsModuleLoaded(from, to);
    	clearRouteDirections();
    });

    GetMap();

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
    };

    //function loadDirMod() {
    //    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: directionsModuleLoaded });
        //Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function() { directionsModuleLoaded(from, to);
        //});
    //};

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
