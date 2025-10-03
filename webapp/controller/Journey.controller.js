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
        const iCourseIndex = aCourses.findIndex(
          (oCourse) => oCourse.id === oContext.getObject()
        );

        const aParts = oContext.getPath().split("/");

        const iCourseListNumber = parseInt(aParts[aParts.length - 1]) + 1;

        console.log(iCourseListNumber);

        const oCourse = aCourses[iCourseIndex];

        const oTitle = new sap.m.Title({
          text: oCourse.title,
        });
        oTitle.addStyleClass("AgiHeader3 sapUiSmallMarginBottom");
        const oDescription = new sap.m.Text({
          text: oCourse.description,
        });

        const oCourseNumber = new sap.m.Text({ text: iCourseListNumber });
        oCourseNumber.addStyleClass("AgiTextWhiteCenter");

        const oVBox = new sap.m.VBox({
          items: [oTitle, oDescription],
        });

        const oPanel = new sap.m.Panel({
          content: oVBox,
        });

        const oWrapper = new sap.m.VBox({
          width: "100%",
          items: oPanel,
        });

        // ---

        const iOrientation = iCourseIndex % 2;
        const oSpacer = new sap.m.VBox({
          width: "50%",
        });

        switch (iOrientation) {
          case 0:
            const oAgiListNumberBigLeft = new sap.m.VBox({
              items: [oCourseNumber],
            });
            oAgiListNumberBigLeft.addStyleClass("AgiListNumberBigLeft");

            const oAgiListLineBigLeft = new sap.m.HBox({
              width: "50%",
              items: [oAgiListNumberBigLeft, oWrapper],
            });
            oAgiListLineBigLeft.addStyleClass("AgiListLineBigLeft");

            return new sap.m.HBox({
              items: [oSpacer, oAgiListLineBigLeft],
            });
            break;

          case 1:
            const oAgiListNumberBigRight = new sap.m.VBox({
              items: [oCourseNumber],
            });
            oAgiListNumberBigRight.addStyleClass("AgiListNumberBigRight");

            const oAgiListLineBigRight = new sap.m.HBox({
              width: "50%",
              items: [oWrapper, oAgiListNumberBigRight],
            });
            oAgiListLineBigRight.addStyleClass("AgiListLineBigRight");

            return new sap.m.HBox({
              items: [oAgiListLineBigRight, oSpacer],
            });
            break;
        }

        // ---

        const oTimelineWrapper = new sap.m.HBox({
          items: [oAgiListLineBigLeft, oAgiListLineBigRight],
        });

        return oTimelineWrapper;
      },
    });
  }
);
