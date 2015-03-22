# VfN NRW | Map Kit JQuery Plugin

## Installation

Orientiert euch an der example.html. Für die Verwendung sind die Einbindung von OpenLayers 3 (http://openlayers.org), Bootstrap (http://getbootstrap.com), Font Awesome (http://fortawesome.github.io/Font-Awesome/) und JQuery ab Version 2.1.x (https://jquery.com) notwendig.

Definiert ein DIV mit der entsprechenden Postion, Größe und einer _id_ eurer Wahl (eine Klasse wird nicht funktionieren) und wendet das Plugin darauf an.

		$( document ).ready( function() {
			
			$( '#id_deines_divs' ).vfnnrw_mapkit({ 
				
				community: *id_deiner_community*,
				latitude: *breitengrad_auf_den_die_Karte_zentriert_werden_soll*,
				longitude: *längengrad_auf_den_die_Karte_zentriert_werden_soll*,
				zoom: *zoomstufe_in_ganzen_zahlen*
				
			});
			
		});

## Hinweis

Das ist Alphasoftware. Keine Garantien :)
