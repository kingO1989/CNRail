import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js";
import PopupTemplate from "@arcgis/core/PopupTemplate.js";

let popup = new PopupTemplate({
  title: "CN Site",
  content: "<p>Name : {name}</p>" + "<p>Address : {address}</p>",
});

let cnLogoRenderer = {
  type: "simple", // autocasts as new SimpleRenderer()
  symbol: {
    type: "picture-marker", // autocasts as new PictureMarkerSymbol()
    url: process.env.PUBLIC_URL + "/CN-Logo-Red-144X144.png?v=19756",
    width: "32px",
    height: "32px",
  },
};
export const geojsonlayer = new GeoJSONLayer({
  url: "https://geojsonconverter-gamma.vercel.app/yardlocations",
  renderer: cnLogoRenderer,
  popupEnabled: true,
  popupTemplate: popup,

  outFields: ["*"],
});
