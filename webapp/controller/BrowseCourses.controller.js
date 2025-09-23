sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], (Controller, JSONModel, Filter, FilterOperator) => {
   "use strict";

   return Controller.extend("ui5.agi_learning_hub.controller.BrowseCourses", {
      filterLevel(id) {          
      const oModel = this.getOwnerComponent().getModel("mockData")          
      const oMasteData = oModel.getProperty("/master_data")        
      const oLevels = oMasteData.levels          
      const oFilter = oLevels.filter(l => { return l.id === id})          
      const LevelTitle = oFilter[0].title          
      return LevelTitle       
      },

      onFilterCourses: function (oEvent) {
         this._sQuery = oEvent.getParameter("query").trim();
         this.applyFilter();
      },

      onFilterLevel: function (oEvent) {
         this._aLevelKeys = oEvent.getSource().getSelectedKeys();
         this.applyFilter();
      },

      applyFilter: function () {
         const aFilters = [];
         
         if (this._sQuery) {
            aFilters.push(
               new Filter("title", FilterOperator.Contains, this._sQuery)
            );
         }
         
         if (this._aLevelKeys.length > 0) { //Fehlerbehebung, damit, wenn man die Filter entfernt wieder alle Daten Kommen
            const aLevelFilters = this._aLevelKeys.map(k =>
               new Filter("level_id", FilterOperator.EQ, k)
            );
            aFilters.push(new Filter({ filters: aLevelFilters, and: false }));
         }
         this.byId("gridList").getBinding("items").filter(aFilters);
      },

      onCoursePress: function (oEvent) {
         const oItem = oEvent.getParameter("listItem");
         const sPath = oItem.getBindingContext("mockData").getPath();
         const oCourse = oItem.getBindingContext("mockData").getObject();
         const sId = oCourse.id;
         this.getOwnerComponent().getRouter().navTo("course", { id: sId });
      }
   });
});