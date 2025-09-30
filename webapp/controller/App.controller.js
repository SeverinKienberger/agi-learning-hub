sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("ui5.agi_learning_hub.controller.App", {
      onInit: function () {
        this.oRouter = this.getOwnerComponent().getRouter();
      },

      onTabSelect: function (oEvent) {
        const sSelectedKey = oEvent.getParameter("selectedItem").getKey();
        this.oRouter.navTo(sSelectedKey);
      },

      onNavBack: function (oEvent) {
        const sPreviousHash =
          sap.ui.core.routing.History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.oRouter.navTo("browseCourses", {}, true);
        }
      },
    });
  }
);
