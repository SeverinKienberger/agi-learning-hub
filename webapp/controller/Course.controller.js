sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], (Controller, JSONModel, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("ui5.agi_learning_hub.controller.Course", {
        onInit: function () {
            this.getOwnerComponent().getRouter()
            .getRoute("course")
            .attachPatternMatched(this._onCourseMatched, this);
        },

        _onCourseMatched: function (oEvent) {
            const sId = oEvent.getParameter("arguments").id;
            const oMD = this.getOwnerComponent().getModel("mockData");
            const a   = oMD.getProperty("/master_data/courses") || [];
            const i   = a.findIndex(c => c.id === sId);
            if (i > -1) {
                this.getView().bindElement({
                model: "mockData",
                path: `/master_data/courses/${i}`
                });
            }
        },
    });
});