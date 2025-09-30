sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("ui5.agi_learning_hub.controller.App", {
      onInit: function () {},

      onTabSelect: function (oEvent) {
        const oSelectedTab = oEvent.getParameter("selectedItem");
        const sSelectedKey = oSelectedTab.getKey();

        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo(sSelectedKey);
      },

      onNavBack: function (oEvent) {
        const oHistory = sap.ui.core.routing.History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.getOwnerComponent().getRouter().navTo("browseCourses", {}, true);
        }
      },
    });
  }
);
