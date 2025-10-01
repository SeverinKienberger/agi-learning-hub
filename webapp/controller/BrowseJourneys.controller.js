sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  (Controller, JSONModel, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("ui5.agi_learning_hub.controller.BrowseJourneys", {
      onInit: function () {
        this.oRouter = this.getOwnerComponent().getRouter();
        this.oModel = this.getOwnerComponent().getModel();
        this._sQuery = "";
      },

      onFilterJourneys: function (oEvent) {
        this._sQuery = oEvent.getParameter("query").trim();
        this.applyFilter();
      },

      applyFilter: function () {
        const aFilters = [];

        if (this._sQuery) {
          aFilters.push(
            new Filter("title", FilterOperator.Contains, this._sQuery)
          );
        }
        this.byId("journeyGridList").getBinding("items").filter(aFilters);
      },
    });
  }
);
