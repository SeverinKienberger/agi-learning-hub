sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  (Controller, JSONModel, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("ui5.agi_learning_hub.controller.Journey", {
      onInit: function () {
        this.oModel = this.getOwnerComponent().getModel();
        this.oRouter = this.getOwnerComponent().getRouter();
        this.oRouter
          .getRoute("journey")
          .attachPatternMatched(this._onJourneyMatched, this);
      },

      _onJourneyMatched: function (oEvent) {
        const sId = oEvent.getParameter("arguments").id;
        const aJourneys =
          this.oModel.getProperty("/master_data/journeys") || [];
        const iJourney = aJourneys.findIndex((oJourney) => oJourney.id === sId);

        this.getView().bindElement({
          path: `/master_data/journeys/${iJourney}`,
        });
      },

      onCoursePress: function (oEvent) {
        const oContext = oEvent.getSource().getBindingContext();
        const sUnitPath = oContext.getPath().split("/chapters/")[0];
        const sUnitId = oContext.getModel().getProperty(sUnitPath + "/id");

        this.oRouter.navTo("course", {
          courseId: this.getView().getBindingContext().getProperty("id"),
          unitId: sUnitId,
          chapterId: oContext.getObject().id,
        });
      },

      createCourseList: function (sId, oContext) {
        console.log(oContext.getObject());

        const aCourses = this.oModel.getProperty("/master_data/courses") || [];
        const iCourse = aCourses.findIndex(
          (oCourse) => oCourse.id === oContext.getObject()
        );

        const oCourse = aCourses[iCourse];

        const oTitle = new sap.m.Title({ text: oCourse.title });
        const oDescription = new sap.m.Text({ text: oCourse.description });

        const oAgiListNumberBig = new sap.m.HBox({});
        oAgiListNumberBig.addStyleClass("AgiListNumberBig");

        const oVBox = new sap.m.VBox({ items: [oTitle, oDescription] });

        const oAgiListLineBig = new sap.m.HBox({
          items: [oAgiListNumberBig, oVBox],
        });

        oAgiListLineBig.addStyleClass("AgiListLineBig");

        return oAgiListLineBig;
      },
    });
  }
);
