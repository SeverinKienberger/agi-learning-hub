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
            progress: [
              { title: "inProgress", courses: this._getCourses("in_progress") },
              { title: "completed", courses: this._getCourses("completed") },
              { title: "notStarted", courses: this._getCourses("not_started") },
              { title: "overdue", courses: this._getCourses("overdue") },
            ],
          }),
          "uiControl"
        );
      },

      _getCourses: function (sStatus) {
        const aAllProgress = this.oModel.getProperty(
          "/transactional_data/user_course_progress"
        );
        const aCourseIds = aAllProgress
          .filter((o) => o.status == sStatus)
          .map((o) => o.course_id);
        const aAllCourses = this.oModel.getProperty("/master_data/courses");
        return aCourseIds.map((id) => aAllCourses.find((c) => c.id === id));
      },

      formatTitle: function (key) {
        const oI18n = this.getOwnerComponent().getModel("i18n");
        return oI18n.getResourceBundle().getText(key);
      },

      formatLevel: function (id) {
        const oMasterData = this.oModel.getProperty("/master_data");
        const oMatch = oMasterData.levels.find((o) => o.id === id);
        return oMatch ? oMatch.title : id;
      },
      onCoursePress: function (oEvent) {
        const oContext = oEvent
          .getParameter("listItem")
          .getBindingContext("uiControl");
        const sId = oContext.getObject().id;
        this.oRouter.navTo("course", { id: sId });
      },
    });
  }
);
