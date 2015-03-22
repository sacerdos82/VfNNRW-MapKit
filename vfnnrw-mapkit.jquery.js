$.fn.vfnnrw_mapkit = function( options ) {

	// Optionen setzen
    options = $.extend( {

        community: 0,
        latitude:0,
        longitude: 0,
        zoom: 1

    }, options );
    

	// HTML anpassen
	this.css( 'position', 'relative' );
	
	this.html(	
	
				'<div id="popup"></div>' +
				'<div id="geolocate"><i class="fa fa-location-arrow"></i></div>'
				
	);

    
    // Quellen laden
	var sourceNodes = 			new ol.source.GeoJSON({
            						projection: 'EPSG:3857',
									url: 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/community/'+ options.community + '/format/geojson'
        						});
        						
    var sourceMeshlinks =		new ol.source.GeoJSON({
            						projection: 'EPSG:3857',
									url: 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/community/'+ options.community + '/active/meshlinks/format/geojson'
        						});
        						
        						
    // Knotenlayer
	var nodesLayer = new ol.layer.Vector({
		
        title: 'Nodes',
        source: sourceNodes,
        style: function( feature ) {

			if( feature.get('active') == true ) { 
				
				if( feature.get( 'vpnActive' ) == true ) { var pointColor = 'rgba(128, 255, 0, 1)'; }
				else if( feature.get( 'gatewayQuality' ) > 200 ) { var pointColor = 'rgba(153, 204, 0, 1)'; }
				else if( feature.get( 'gatewayQuality' ) > 100 ) { var pointColor = 'rgba(255, 215, 0, 1)'; }
				else { var pointColor = 'rgba(210, 105, 30, 1)'; }
				
				var pointStrokeColor = 'rgba(0, 0, 0, 1)'; var pointStrokeWidth = 1;
			
			} else { 
				
				var pointColor = 'rgba(255, 128, 0, 0.3)'; 
				var pointStrokeColor = 'rgba(50, 50, 50, 0.8)';
				
			}
			
			style = [
				
	            new ol.style.Style({
    	        		image: 	new ol.style.Circle({
        	        				radius: 6,
									fill: new ol.style.Fill({ color: pointColor }),
									stroke: new ol.style.Stroke({ color: pointStrokeColor, width: pointStrokeWidth })
              					})
            	})
            	
            ];
            
            return style;

          }
      
    });
    
    
    // Mesklinklayer
    var meshlinkLayer = new ol.layer.Vector({
	    
        title: 'Meshlinks',
        source: sourceMeshlinks,
        style: function( feature ) {
	        
	        if( feature.get('linkQuality') < 1.2 ) { var linkColor = 'rgba(128, 255, 0, 0.9)'; } 
	        else if( feature.get('linkQuality') < 1.4 ) { var linkColor = 'rgba(178, 255, 102, 0.8)'; }
            else if( feature.get('linkQuality') < 1.8 ) { var linkColor = 'rgba(255, 255, 0, 0.7)'; }
            else if( feature.get('linkQuality') < 2.5 ) { var linkColor = 'rgba(255, 255, 102, 0.6)'; }
            else if( feature.get('linkQuality') < 3.0 ) { var linkColor = 'rgba(255, 128, 0, 0.5)'; }
            else if( feature.get('linkQuality') < 5.0 ) { var linkColor = 'rgba(255, 178, 102, 0.4)'; }
            else { var linkColor = 'rgba(255, 0, 0, 0.3)'; }
                   
            style = [
	            
            	new ol.style.Style({
                		stroke: 	new ol.style.Stroke({
	                         				color: linkColor,
							 				width: 2
                      				})
                })
            
            ];
            
            return style;
                  
        },
        maxResolution: 3
        
    });
    
    
    // Tiles
	var tilesOSM = new ol.layer.Tile({ source: new ol.source.OSM() });

	
	// Karte zeichnen
	var map = new ol.Map({
	    
	    target: this[0].id,
	    layers: [
	    	tilesOSM,
	    	meshlinkLayer,
	        nodesLayer
		],
	    view: new ol.View({
	    	center: ol.proj.transform( [options.latitude, options.longitude], 'EPSG:4326', 'EPSG:3857' ),
	        zoom: options.zoom
	    })
	   
	});
	
	
	
	// === ZUSATZFUNKTIONEN ===
	
	// Popup
	var element = document.getElementById( 'popup' );

	var popup = new ol.Overlay({
		
		element: element,
		positioning: 'bottom-center',
		stopEvent: false

	});
	map.addOverlay(popup);

	map.on( 'singleclick', function( event ) {
	
		$(element).popover( 'destroy' );
	
		var feature = map.forEachFeatureAtPixel( event.pixel, function(feature, layer) { 
			
			if( layer.j.title == 'Dimmer' ) { return false; }
			return feature; 
			
		});

		if (feature) {
			
			if( feature.get( 'linkQuality' ) != undefined ) {
								
				var coord = event.coordinate;
				var transCoord = ol.proj.transform(coord, "EPSG:900913", "EPSG:3857");
				
				if( feature.get('linkQuality') < 1.9 ) { var linkQualityFactor = ((( feature.get('linkQuality') * 100 ) - 100 ) / 2 ); } 
				else if( feature.get('linkQuality') < 2.9 ) { var linkQualityFactor = ((( feature.get('linkQuality') * 100 ) - 200 ) / 4 ) + 50; }
				else if( feature.get('linkQuality') < 3.9 ) { var linkQualityFactor = ((( feature.get('linkQuality') * 100 ) - 300 ) / 8 ) + 75; }
				else if( feature.get('linkQuality') < 4.9 ) { var linkQualityFactor = ((( feature.get('linkQuality') * 100 ) - 400 ) / 16 ) + 87.5; }
				else { var linkQualityFactor = 100; }
				
				var linkQuality = 100 - Math.round( linkQualityFactor );
				
				popup.setPosition( transCoord );
				$( element ).popover({
					
					'placement': 'top',
					'html': true,
					'title': 'Linkqualität: ' + linkQuality + '%' ,
					'content': 	'<p>Linkqualität (RAW): ' + feature.get( 'linkQuality' ) +
								'<p>Von: ' + feature.get ( 'FromName' ) + ' (' + feature.get ( 'FromID' ) + ')</p>' +
								'<p>Zu: ' + feature.get ( 'ToName' ) + ' (' + feature.get ( 'ToID' ) + ')</p>' +
								'<p>Länge: ' + feature.get ( 'lengthInMeters' ) + ' Meter</p>',
	
				});
	
				$( element ).popover( 'show' );
				
			} else {
			
				var geometry = feature.getGeometry();
				var coord = geometry.getCoordinates();
				
				if( feature.get('active') == true ) { 
					
					if( feature.get( 'vpnActive' ) == true ) { var gatewayQuality = Math.round( ( parseInt( feature.get( 'gatewayQuality' ) ) * 100 ) / 255 ); }
					else { var gatewayQuality = Math.round( ( ( parseInt( feature.get( 'gatewayQuality' ) ) + 15 ) * 100 ) / 255 ); }
					
				} else { var gatewayQuality = 0; }
				
				if( feature.get( 'vpnActive' ) == true && feature.get('active') == true ) { var uplink = ' / Uplink aktiv'; } else { var uplink = ''; }
				
				popup.setPosition( coord );
				$( element ).popover({
					
					'placement': 'top',
					'html': true,
					'title': feature.get( 'name' ) + ' (' + feature.get ( 'id' ) + ')',
					'content': 	'<p><b>Clients:</b> ' + feature.get ( 'clients' ) + '</p>' +
								'<p><b>Verbindungsqualit&auml;t:</b> ' + gatewayQuality + ' %' + uplink + '</p>' +
								'<p><b>Letzter Gatewaykontakt:</b> ' + feature.get ( 'lastSeen' ) + '</p>' +
								'<p>vor ' + feature.get ( 'lastSeenDifference' ) + '</p>' +
								'<p><b>Firmware:</b> ' + feature.get ( 'firmwareBuild' ) + '</p>'
	
				});
	
				$( element ).popover( 'show' );
			
			}
		
		} else {
			
			$( element ).popover( 'destroy' );
	
		}
	
	});
	
	var target = map.getTarget();
	var jTarget = typeof target === 'string' ? $( '#' + target ) : $( target );
	
	map.on('pointermove', function( e ) {
		
		if( e.dragging ) {
		
			$( element ).popover( 'destroy' );
			return;
		
		}
		
		var mouseCoordInMapPixels = [e.originalEvent.offsetX, e.originalEvent.offsetY];
	    var hit = map.forEachFeatureAtPixel( mouseCoordInMapPixels, function ( feature, layer ) { 
		
		    if( layer.j.title == 'Dimmer' ) { return false; }
		    return true; 
		    
		});

	    if (hit) { jTarget.css( 'cursor', 'pointer' ); } 
	    else { jTarget.css( 'cursor', '' ); }
	
	});
	
	
	// Position ermitteln
	var geolocation = new ol.Geolocation();
	geolocation.bindTo('projection', map.getView());
	
	$( '#geolocate' ).click(function() { 
	
		if( geolocation.getTracking() == false ) { geolocation.setTracking( true );	}
		if( geolocation.getPosition() != undefined ) { map.getView().setCenter( geolocation.getPosition()); map.getView().setZoom(18); } 
		
	});

}