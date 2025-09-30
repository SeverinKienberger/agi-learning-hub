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
        const oContext = oItem?.getBindingContext?.();
        const sPath = oContext?.getPath?.();

        this.byId("chapterDetails").bindElement({
          path: sPath,
        });

        const oHtml = this.byId("chapterHtml");
        oHtml.setContent("");
        oHtml.setContent(oContext.getProperty("content_html") || "");
        this.byId("toolPage")
          .getSideContent()
          .setSelectedKey(oContext.getProperty("id"));
      },

      _findCourseIndex(sCourseId) {
        const aCourses = this.oModel.getProperty("/master_data/courses") || [];
        return aCourses.findIndex((c) => c.id === sCourseId);
      },

      _findUnitIndex(iCourse, sUnitId) {
        const aUnits =
          this.oModel.getProperty(`/master_data/courses/${iCourse}/units`) ||
          [];
        return aUnits.findIndex((u) => u.id === sUnitId);
      },

      _findChapterIndex(iCourse, iUnit, sChapterId) {
        const aChapters =
          this.oModel.getProperty(
            `/master_data/courses/${iCourse}/units/${iUnit}/chapters`
          ) || [];
        return aChapters.findIndex((ch) => ch.id === sChapterId);
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

        const oHtml = this.byId("chapterHtml");
        oHtml.setContent("");
        oHtml.setContent(
          this.oModel.getProperty(
            `/master_data/courses/${iCourse}/units/${iUnit}/chapters/${iChapter}/content_html`
          ) || ""
        );
      },
    });
  }
);
