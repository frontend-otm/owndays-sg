/**
* @license
* Copyright 2019 Google LLC. All Rights Reserved.
* SPDX-License-Identifier: Apache-2.0
*/
// Initialize and add the map
let map;
async function initMap() {
    // Check if map element exists
    const mapElement = document.getElementById("map");
    if (!mapElement) {
        console.warn("Map element not found");
        return;
    }

    // The location of Uluru
    const position = { lat: parseFloat(mapElement.dataset.lat), lng: parseFloat(mapElement.dataset.lng) };
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    // The map, centered at Uluru
    map = new Map(mapElement, {
        zoom: 17,
        center: position,
        mapId: "ROADMAP",
        mapTypeControl: false,
        streetViewControl: false,
    });
    // The marker, positioned at Uluru
    const img = document.createElement("img");
    img.src = "https://static.lenskart.com/media/owndays/img/pin.svg";

    const marker = new AdvancedMarkerElement({
        map: map,
        position: position,
        title: mapElement.dataset.title,
        content: img,
    });
}
initMap();