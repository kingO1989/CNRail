/* eslint-disable import/first */
import { useRef, useState, useEffect } from "react";
import { setAssetPath } from "@esri/calcite-components/dist/components";
import esriConfig from "@arcgis/core/config";
setAssetPath("https://unpkg.com/@esri/calcite-components/dist/calcite/assets");
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import LayerList from "@arcgis/core/widgets/LayerList";
import { geojsonlayer } from "./utilities/GeoJsonLayer";
import { myGraphicLayer } from "./utilities/GraphicLayer";
import { getLocation } from "./utilities/helpers";
import { trackLayer } from "./utilities/TracksLayer";
import {
  CalciteShell,
  CalciteShellPanel,
  CalciteActionBar,
  CalciteAction,
  CalcitePanel,
} from "@esri/calcite-components-react";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-action";
import "@esri/calcite-components/dist/components/calcite-action-bar";
import "@esri/calcite-components/dist/components/calcite-panel";

import "@esri/calcite-components/dist/calcite/calcite.css";

import Popup from "@arcgis/core/widgets/Popup.js";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
esriConfig.apiKey = process.env.REACT_APP_ESRI_KEY;
function App() {
  const mapRef = useRef();

  const map = new Map({
    basemap: "streets-vector",
    layers: [myGraphicLayer, geojsonlayer, trackLayer],
  });

  const layerContainer = useRef();

  useEffect(() => {
    const view = new MapView({
      container: mapRef.current,
      map,
      zoom: 7,
      popupEnabled: true,
      popup: {
        dockEnabled: true,
        dockOptions: {
          //  position: "top-left",
          breakpoint: false,
        },
      },
    });
    const layerList = new LayerList({
      view,
      selectionEnabled: true,
      container: layerContainer.current,
    });

    if (navigator.geolocation) {
      getLocation(navigator, view);
    }

    view.on("click", (event) => {});
    view.when(() => {
      let activeWidget;
      const handleActionBarClick = async ({ target }) => {
        if (target.tagName !== "CALCITE-ACTION") {
          return;
        }

        if (activeWidget) {
          document.querySelector(
            `[data-action-id=${activeWidget}]`
          ).active = false;
          document.querySelector(
            `[data-panel-id=${activeWidget}]`
          ).hidden = true;
        }

        const nextWidget = target.dataset.actionId;
        if (nextWidget !== activeWidget) {
          document.querySelector(
            `[data-action-id=${nextWidget}]`
          ).active = true;
          document.querySelector(
            `[data-panel-id=${nextWidget}]`
          ).hidden = false;
          activeWidget = nextWidget;
        } else {
          activeWidget = null;
        }
      };

      document
        .querySelector("calcite-action-bar")
        .addEventListener("click", handleActionBarClick);
    });
    return () => {
      // document.querySelector("calcite-action-bar").removeEventListener("click", handleActionBarClick);
      view.removeHandles("click");
      if (view) {
        // destroy the map view
        //view.destroy()
      }
    };
  }, []);

  const mapStyle = {
    width: "100%",
    height: "100%",
    padding: 0,
    margin: 0,
    position: "absolute",
    right: 0,
  };

  return (
    <>
      <CalciteShell content-behind>
        <h2 id="header-title" slot="header"></h2>

        <CalciteShellPanel slot="panel-start" display-mode="float">
          <CalciteActionBar slot="action-bar">
            <CalciteAction
              data-action-id="layers"
              icon="layers"
              text="Layers"
            ></CalciteAction>
          </CalciteActionBar>

          <CalcitePanel
            heading="Layers"
            height-scale="l"
            data-panel-id="layers"
            hidden
          >
            <div ref={layerContainer}></div>
          </CalcitePanel>
        </CalciteShellPanel>
        <div className="map-container" ref={mapRef} style={mapStyle} />
      </CalciteShell>
    </>
  );
}

export default App;
