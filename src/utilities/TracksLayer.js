import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

export const trackLayer = new FeatureLayer({
  // URL to the service
  popupEnabled: true,
  url: "https://ws.lioservices.lrc.gov.on.ca/arcgis1071a/rest/services/LIO_OPEN_DATA/LIO_Open04/MapServer/18",
  outFields: ["*"],
});
