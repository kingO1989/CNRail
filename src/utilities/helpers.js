import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import { myGraphicLayer } from "./GraphicLayer";
import PopupTemplate from "@arcgis/core/PopupTemplate.js";

export function getLocation(navigator, view) {
  let lat;
  let long;
  navigator.geolocation.getCurrentPosition((position) => {
    lat = position.coords.latitude;
    long = position.coords.longitude;

    const point = new Point({
      latitude: lat,
      longitude: long,
    });

    const simpleMarkerSymbol = {
      type: "simple-marker",
      color: [226, 119, 40], // Orange
      outline: {
        color: [255, 255, 255], // White
        width: 1,
      },
    };

    const pointGraphic = new Graphic({
      geometry: point,
      symbol: simpleMarkerSymbol,
    });
    view.goTo({
      center: [long, lat],
    });

    addToGraphicLayer(pointGraphic);
  });
}

function addToGraphicLayer(point) {
  myGraphicLayer.add(point);
}
