sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("ui5.agi_learning_hub.controller.Chapter", {
      onInit: function () {
        this.getOwnerComponent()
          .getRouter()
          .getRoute("chapter")
          .attachPatternMatched(this._onChapterMatched, this);
        this.oModel = this.getOwnerComponent().getModel();
      },

      onChapterPress: function (oEvent) {
        const oItem = oEvent.getParameter("item") || oEvent.getSource();
        const oContext = oItem.getBindingContext();

        this.byId("chapterDetails").bindElement({
          path: oContext.getPath(),
        });

        const sHtml = oContext.getProperty("content_html") || "";

        const oContainer = this.byId("chapterContainer");
        oContainer.removeAllItems();

        if (sHtml) {
          oContainer.addItem(new sap.ui.core.HTML({ content: [sHtml] }));
        } else {
          oContainer.addItem(this.createTest());
        }

        this.byId("toolPage")
          .getSideContent()
          .setSelectedKey(oContext.getProperty("id"));
      },

      _findCourseIndex(sCourseId) {
        const aCourses = this.oModel.getProperty("/master_data/courses") || [];
        return aCourses.findIndex((oCourse) => oCourse.id === sCourseId);
      },

      _findUnitIndex(iCourse, sUnitId) {
        const aUnits =
          this.oModel.getProperty(`/master_data/courses/${iCourse}/units`) ||
          [];
        return aUnits.findIndex((oUnit) => oUnit.id === sUnitId);
      },

      _findChapterIndex(iCourse, iUnit, sChapterId) {
        const aChapters =
          this.oModel.getProperty(
            `/master_data/courses/${iCourse}/units/${iUnit}/chapters`
          ) || [];
        return aChapters.findIndex((oChapter) => oChapter.id === sChapterId);
      },

      _onChapterMatched: function (oEvent) {
        const sCourseId = oEvent.getParameter("arguments").courseId;
        const sUnitId = oEvent.getParameter("arguments").unitId;
        const sChapterId = oEvent.getParameter("arguments").chapterId;

        const iCourse = this._findCourseIndex(sCourseId);
        const iUnit = this._findUnitIndex(iCourse, sUnitId);
        const iChapter = this._findChapterIndex(iCourse, iUnit, sChapterId);

        const oSideNav = this.byId("toolPage").getSideContent();
        oSideNav.setSelectedKey(sChapterId);

        this.getView().bindElement({
          path: `/master_data/courses/${iCourse}`,
        });

        this.byId("chapterDetails").bindElement({
          path: `/master_data/courses/${iCourse}/units/${iUnit}/chapters/${iChapter}`,
        });

        const sHtml = this.oModel.getProperty(
          `/master_data/courses/${iCourse}/units/${iUnit}/chapters/${iChapter}/content_html`
        );

        const oHtml = new sap.ui.core.HTML({ content: [sHtml] });

        const oContainer = this.byId("chapterContainer");
        oContainer.removeAllItems();

        if (sHtml) {
          oContainer.addItem(oHtml);
        } else {
          oContainer.addItem(this.createTest());
        }
      },
      createTest: function () {
        const oTestText = new sap.m.Text({ text: "Test" });
        return oTestText;
      },
    });
  }
);
