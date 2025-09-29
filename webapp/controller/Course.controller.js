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
            const oModel = this.getOwnerComponent().getModel("mockData");
            const aCourses   = oModel.getProperty("/master_data/courses") || [];
            const iCourse   = aCourses.findIndex(c => c.id === sId);

            this.getView().bindElement({
            model: "mockData",
            path: `/master_data/courses/${iCourse}`
            });
        },

        onChapterPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oChapter = oItem.getBindingContext("mockData").getObject();

            const sChapterId = oChapter.id;
            const sCourseId = this.getView().getBindingContext("mockData").getProperty("id");

            const oContext = oItem.getBindingContext("mockData");
            const sPath = oContext.getPath();
            const sUnitPath = sPath.split("/chapters/")[0];
            const sUnitId = oContext.getModel().getProperty(sUnitPath + "/id");

            this.getOwnerComponent().getRouter().navTo("chapter", { courseId: sCourseId, unitId: sUnitId, chapterId: sChapterId });
        }
    });
});