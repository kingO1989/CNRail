/* eslint-disable import/first */
import { useRef, useState, useEffect } from "react";
import { setAssetPath } from "@esri/calcite-components/dist/components";
import esriConfig from "@arcgis/core/config";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic.js";
import LayerList from "@arcgis/core/widgets/LayerList";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import Circle from "@arcgis/core/geometry/Circle.js";
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
import PopupTemplate from "@arcgis/core/PopupTemplate";

setAssetPath("https://unpkg.com/@esri/calcite-components/dist/calcite/assets");

esriConfig.apiKey = process.env.REACT_APP_ESRI_KEY;
function App() {
  const mapRef = useRef();
  const layerContainer = useRef();
  const selectedUnit = useRef();
  const userDistance = useRef();
  userDistance.current = 1;

  const map = new Map({
    basemap: "streets-vector",
    layers: [myGraphicLayer, geojsonlayer, trackLayer],
  });

  const availableUnits = [
    "Choose a Metric unit",
    "yards",
    "meters",
    "feet",
    "miles",
    "kilometers",
  ];
  /**
   *
   * @param {*} point the point on the view the user clicked
   * @param {*} selectedUnit the selected units
   * @description  create a circle at the point the user clicked
   */
  const createCircle = async (point, selectedUnit) => {
    console.log(selectedUnit);
    const circle = new Circle({
      center: point,
      geodesic: true,
      numberOfPoints: 100,
      radius: userDistance.current,
      radiusUnit: selectedUnit,
    });

    return circle;
  };

  /**
   *
   * @param {*} userGeometry the geometry created
   * @description  adds the created geometry to the views graphic layer
   */

  const addGeometryToGraphic = async (userGeometry) => {
    let gp = new Graphic({
      geometry: userGeometry, // point,
      symbol: {
        type: "simple-fill",
        style: "none",
        color: [100, 220, 90],
        outline: {
          width: 3,
          color: "red",
        },
      },
    });

    return gp;
  };

  /**
   *
   * @description  create metric unit widget
   */

  const createMetricUnitWidget = () => {
    selectedUnit.current = availableUnits[2];

    const widgetContainer = document.createElement("div");
    const h4element = document.createElement("h4");
    const inputNumber = document.createElement("input");
    h4element.innerText = "Select unit for measurement";
    inputNumber.type = "number";
    inputNumber.placeholder = "Enter distance";
    const select = document.createElement("select");
    select.setAttribute("class", "esri-select");
    widgetContainer.setAttribute("class", "esri-widget");
    widgetContainer.setAttribute(
      "style",
      "width: 300px; font-family: 'Avenir Next'; font-size: 1em"
    );

    widgetContainer.appendChild(h4element);
    widgetContainer.appendChild(select);
    widgetContainer.appendChild(inputNumber);
    availableUnits.forEach(function (query) {
      let option = document.createElement("option");
      option.innerHTML = query;
      option.value = query;
      select.appendChild(option);
    });
    //create event listeners
    inputNumber.addEventListener("change", (event) => {
      userDistance.current = event.target.value;
      console.log(userDistance);
    });
    select.selectedIndex = 2;
    select.addEventListener("change", (event) => {
      selectedUnit.current = event.target.value;
    });

    return widgetContainer;
  };
  useEffect(() => {
    const view = new MapView({
      container: mapRef.current,
      map,
      zoom: 7,
      center: [-79.347015, 43.65107],
      popupEnabled: true,
      popup: {
        dockEnabled: true,
        dockOptions: {
          //  position: "top-left",
          breakpoint: false,
        },
      },
    });

    const metricWidget = createMetricUnitWidget();

    view.ui.add(metricWidget, "top-right");
    const layerList = new LayerList({
      view,
      selectionEnabled: true,
      container: layerContainer.current,
    });

    if (navigator.geolocation) {
      getLocation(navigator, view);
    }

    view.on("click", (event) => {
      layerclick(event);
    });
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
    let highlightSelect;
    /**
     *
     * @param {*} screenPoint a user click event
     * @description creates a graphic point on the view
     */

    const layerclick = async (screenPoint) => {
      const point = view.toMap(screenPoint);
      point.spatialReference = view.spatialReference;

      const circleGeometry = await createCircle(point, selectedUnit.current);

      let gp = await addGeometryToGraphic(circleGeometry);

      let sym = new SimpleMarkerSymbol();
      sym.size = 5;
      sym.color = [226, 119, 78];

      let userPoint = new Graphic({
        geometry: point,
        symbol: sym,
      });

      view.graphics.removeAll();
      view.graphics.add(gp);
      view.graphics.add(userPoint);

      //query geojson layer

      console.log(selectedUnit.current);
      const query = geojsonlayer.createQuery();
      query.geometry = point;
      query.distance = userDistance.current;
      query.units = selectedUnit.current;
      const statsQuery = query.clone();
      view.popup = null;
      view.popup = new Popup();
      geojsonlayer.queryFeatures(statsQuery).then(
        function (response) {
          console.log(response.features);
          if (highlightSelect) {
            highlightSelect.remove();
          }

          // the feature to be highlighted
          const feature = response.features[0];

          // use the objectID to highlight the feature
          view
            .whenLayerView(geojsonlayer)
            .then(async (layerView) => {
              highlightSelect = layerView.highlight(response.features);

              if (response.features.length === 0) return null;

              console.log(screenPoint.mapPoint);
              var feature = response.features[0];
              feature.popupTemplate = {
                title: "CN Site",
                content: "<p>Name : {name}</p>" + "<p>Address : {address}</p>",
              };

              console.log(screenPoint);

              return response.features;
            })
            .then(async (f) => {
              if (f === null) return; //
              console.log(f);
              view.openPopup({
                title: "CN Site",
                content: "<p></p>",
                location: f[0].geometry,

                fetchFeatures: true,
                features: f,
              });
            });

          console.log("no error");
        },
        function (e) {
          console.error(e);
        }
      );
    };

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

/*

      let sym = new SimpleMarkerSymbol();
      sym.size = 5;
      sym.color = [226, 119, 78];
*/

/*   new Circle({
        center: point,
        geodesic: true,
        numberOfPoints: 100,
        radius: userDistance.current,
        radiusUnit: selectedUnit,
      }); */
