sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("ui5.agi_learning_hub.controller.MyLearning", {
      onInit: function () {
        this.oRouter = this.getOwnerComponent().getRouter();
        this.oModel = this.getOwnerComponent().getModel();
        this.getView().setModel(
          new JSONModel({
            courseIds: [],
          }),
          "uiControl"
        );
        this.oUiControl = this.getView().getModel("uiControl");
        console.log(this._getCourses("in_progress"));
      },

      _getCourses: function (sStatus) {
        const aAllProgress = this.oModel.getProperty(
          "/transactional_data/user_course_progress"
        );

        const aCourseIds = [];
        aAllProgress.forEach((oProgress) => {
          if (oProgress.status == sStatus) {
            aCourseIds.push(oProgress.course_id);
          }
        });

        const aAllCourses = this.oModel.getProperty("/master_data/courses");

        const aSpecificCourses = [];

        aAllCourses.forEach((oCourse) => {
          if (aCourseIds.includes(oCourse.id)) {
            aSpecificCourses.push(oCourse);
          }
        });

        return aSpecificCourses;
      },
    });
  }
);
