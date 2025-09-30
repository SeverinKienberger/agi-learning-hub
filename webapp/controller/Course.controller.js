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
        this.getOwnerComponent()
          .getRouter()
          .getRoute("course")
          .attachPatternMatched(this._onCourseMatched, this);

        this.oModel = this.getOwnerComponent().getModel();
        this.oRouter = this.getOwnerComponent().getRouter();
      },

      _onCourseMatched: function (oEvent) {
        const sId = oEvent.getParameter("arguments").id;
        const aCourses = this.oModel.getProperty("/master_data/courses") || [];
        const iCourse = aCourses.findIndex((c) => c.id === sId);

        this.getView().bindElement({
          path: `/master_data/courses/${iCourse}`,
        });
      },

      onChapterPress: function (oEvent) {
        const oItem = oEvent.getSource();
        const oChapter = oItem.getBindingContext().getObject();

        const sChapterId = oChapter.id;
        const sCourseId = this.getView().getBindingContext().getProperty("id");

        const oContext = oItem.getBindingContext();
        const sPath = oContext.getPath();
        const sUnitPath = sPath.split("/chapters/")[0];
        const sUnitId = oContext.getModel().getProperty(sUnitPath + "/id");

        this.oRouter.navTo("chapter", {
          courseId: sCourseId,
          unitId: sUnitId,
          chapterId: sChapterId,
        });
      },
    });
  }
);
