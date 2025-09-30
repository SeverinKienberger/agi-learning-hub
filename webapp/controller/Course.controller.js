sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  (Controller, JSONModel, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("ui5.agi_learning_hub.controller.Course", {
      onInit: function () {
        this.oModel = this.getOwnerComponent().getModel();
        this.oRouter = this.getOwnerComponent().getRouter();
        this.oRouter
          .getRoute("course")
          .attachPatternMatched(this._onCourseMatched, this);
      },

      _onCourseMatched: function (oEvent) {
        const sId = oEvent.getParameter("arguments").id;
        const aCourses = this.oModel.getProperty("/master_data/courses") || [];
        const iCourse = aCourses.findIndex((oCourse) => oCourse.id === sId);

        this.getView().bindElement({
          path: `/master_data/courses/${iCourse}`,
        });
      },

      onChapterPress: function (oEvent) {
        const oContext = oEvent.getSource().getBindingContext();
        const sUnitPath = oContext.getPath().split("/chapters/")[0];
        const sUnitId = oContext.getModel().getProperty(sUnitPath + "/id");

        this.oRouter.navTo("chapter", {
          courseId: this.getView().getBindingContext().getProperty("id"),
          unitId: sUnitId,
          chapterId: oContext.getObject().id,
        });
      },
    });
  }
);
