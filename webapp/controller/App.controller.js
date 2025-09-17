sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
   "use strict";

   return Controller.extend("ui5.agi_learning_hub.controller.App", {
         onTabSelect: function (oEvent) {
         var oSelectedTab = oEvent.getParameter("selectedItem");
         var sSelectedKey = oSelectedTab.getKey();

         var oRouter = this.getOwnerComponent().getRouter();
         oRouter.navTo(sSelectedKey);
      }
   });
});