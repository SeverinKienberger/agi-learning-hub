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
        this._aCategoryKeys = [];
      },

      onFilterJourneys: function (oEvent) {
        this._sQuery = oEvent.getParameter("query").trim();
        this.applyFilter();
      },

      onFilterCategory: function (oEvent) {
        this._aCategoryKeys = oEvent.getSource().getSelectedKeys();
        this.applyFilter();
      },

      applyFilter: function () {
        const aFilters = [];

        if (this._sQuery) {
          aFilters.push(
            new Filter("title", FilterOperator.Contains, this._sQuery)
          );
        }

        if (this._aCategoryKeys.length > 0) {
          const aCategoryFilters = this._aCategoryKeys.map(
            (sKey) =>
              new Filter({
                path: "category_ids",
                test: (aIds) => {
                  return this._aCategoryKeys.every((sKey) =>
                    aIds.includes(sKey)
                  );
                },
              })
          );
          console.log(aCategoryFilters[0]);
          aFilters.push(new Filter({ filters: aCategoryFilters, and: false }));
        }
        this.byId("journeyGridList").getBinding("items").filter(aFilters);
      },

      onJourneyPress: function (oEvent) {
        const oContext = oEvent.getParameter("listItem").getBindingContext();
        const sId = oContext.getObject().id;
        this.oRouter.navTo("journey", { id: sId });
      },
    });
  }
);
