// main source: mauros from http://stackoverflow.com/questions/36866239/clickable-countries-using-google-maps-api

  // the map
  var map;
  
  // the country data
  var country_data = [];
  
  var country_names = [];
  
  function initialize() {
    var myOptions = {
      zoom: 2,
      center: new google.maps.LatLng(10, 0),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // initialize the map
    map = new google.maps.Map(document.getElementById('map-canvas'),
        myOptions);

    // these are the map styles
    var styles = [
        {
          stylers: [
            { hue: "#00ffe6" },
            { saturation: -20 }
          ]
        },
        {
          featureType: "landscape",
          stylers: [
            { hue: "#ffff66" },
            { saturation: 100 }
          ]
        },{
          featureType: "road",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "administrative.land_parcel",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "administrative.locality",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "administrative.neighborhood",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "administrative.province",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "landscape.man_made",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "landscape.natural",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "poi",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "transit",
          stylers: [
            { visibility: "off" }
          ]
        }
      ];

    map.setOptions({styles: styles});
    
    /*//create element & make it hidden
    var info_element = document.getElementById(info_table);
    info_element.style.display = 'none';*/

    // Initialize JSONP request
    var script = document.createElement('script');
    var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
    url.push('sql=');
    var query = 'SELECT name, kml_4326 FROM ' +
        '1foc3xO9DyfSIF6ofvN0kp2bxSfSeKog5FbdWdQ';
    var encodedQuery = encodeURIComponent(query);
    url.push(encodedQuery);
    url.push('&callback=drawMap');
    url.push('&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ');
    script.src = url.join('');
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(script);
  }
  
  /*function looking(array) {
    return array["name"] == this.name;
  };*/
  
  function drawMap(data) {
    var rows = data['rows'];
    var url = 'quote.php';
    
    $.ajax({
      url: url,
      async: false,
      dataType: 'json',
      success: function(data_new) {
        
        for (var i in rows) {
          var country_name = rows[i][0];
          if (country_name != 'Antarctica') {
            var newCoordinates = [];
            var geometries = rows[i][1]['geometries'];
            if (geometries) {
              for (var j in geometries) {
                newCoordinates.push(constructNewCoordinates(geometries[j]));
              }
            } else {
              newCoordinates = constructNewCoordinates(rows[i][1]['geometry']);
            };
            
            //build search algorithm that looks up country_name in data_new array to get the appropriate evaluation value
            var search_output = search(country_name,data_new);
            
            var country = new google.maps.Polygon({
              paths: newCoordinates,
              strokeColor: '#ff9900',
              strokeOpacity: 1,
              strokeWeight: 0.3,
              fillColor: evaluate(search_output["evaluation"]),
              fillOpacity: 0.4,
              name: country_name
            });
            
            country_names.push(country_name);
            
            if (search_output != 0) {
              country_data.push({
                "Name": country_name,
                "Currency code": search_output["symbol"].substring(0,3),
                "Benchmark code": search_output["symbol"].substring(4),
                "Latest price": search_output["latest_price"],
                "Year high": search_output["highest_price"],
                "Year low": search_output["lowest_price"],
                "Evaluation": search_output["evaluation"]
              });
            };
            
            google.maps.event.addListener(country, 'mouseover', function() {
              this.setOptions({fillOpacity: 0.1});
            });
            google.maps.event.addListener(country, 'mouseout', function() {
              this.setOptions({fillOpacity: 0.4});
            });
            google.maps.event.addListener(country, 'click', function(event) {
              create_modal(this.name,country_data);
            });

            country.setMap(map);
          }
        }  
      }
    });
    
    //configure typeahead
    
    var countries= new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: country_names
    });
    $("#q").typeahead(null, {
      name: 'Countries',
      source: countries,
      templates: {
          empty: "<div id = \"testing\" >Country not found.</div>",
          suggestion:  function(data){
            return '<p id = \"testing\"><strong>' + data + '</strong> </p>';
          }
      }
    });
    
    //Respond to typeahead suggestion click by opening window
    $('#q').bind('typeahead:selected', function(obj, datum, name) {      
        create_modal(datum, country_data); // contains datum value, tokens and custom fields
    });
    
    
  }

  function constructNewCoordinates(polygon) {
    var newCoordinates = [];
    var coordinates = polygon['coordinates'][0];
    for (var i in coordinates) {
      newCoordinates.push(
          new google.maps.LatLng(coordinates[i][1], coordinates[i][0]));
    }
    return newCoordinates;
  }
  


