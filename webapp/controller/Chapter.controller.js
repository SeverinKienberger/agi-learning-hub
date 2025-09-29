sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
   "use strict";

   return Controller.extend("ui5.agi_learning_hub.controller.Chapter", {
      onInit: function () {
            this.getOwnerComponent().getRouter()
            .getRoute("chapter")
            .attachPatternMatched(this._onChapterMatched, this);
      },

      _onChapterMatched: function (oEvent) {
         const sCourseId = oEvent.getParameter("arguments").courseId;
         const sUnitId = oEvent.getParameter("arguments").unitId;
         const sChapterId = oEvent.getParameter("arguments").chapterId;

         const oModel = this.getOwnerComponent().getModel("mockData");

         const aCourses   = oModel.getProperty("/master_data/courses") || [];
         const iCourse   = aCourses.findIndex(c => c.id === sCourseId);

         const aUnits   = oModel.getProperty(`/master_data/courses/${iCourse}/units`) || [];
         const iUnit   =  aUnits.findIndex(c => c.id === sUnitId);

         const aChapters   = oModel.getProperty(`/master_data/courses/${iCourse}/units/${iUnit}/chapters`) || [];
         const iChapter   =  aChapters.findIndex(c => c.id === sChapterId);

         const oSideNav = this.byId("toolPage").getSideContent();
         oSideNav.setSelectedKey(sChapterId);

         this.getView().bindElement({
         model: "mockData",
         path: `/master_data/courses/${iCourse}`
         });

         this.byId("chapterDetails").bindElement({
         model: "mockData",
         path: `/master_data/courses/${iCourse}/units/${iUnit}/chapters/${iChapter}`
         });

         const oHtml = this.byId("chapterHtml");
         oHtml.setContent("");
         oHtml.setContent(
         oModel.getProperty(`/master_data/courses/${iCourse}/units/${iUnit}/chapters/${iChapter}/content_html`) || ""
         );
      },

      onChapterPress: function (oEvent) {       
         const oItem = oEvent.getParameter("item") || oEvent.getSource();
         const oContext  = oItem?.getBindingContext?.("mockData");
         const sPath = oContext?.getPath?.();

         this.byId("chapterDetails").bindElement({
            model: "mockData",
            path: sPath
         })

         const oHtml = this.byId("chapterHtml");
         oHtml.setContent("");  
         oHtml.setContent(oContext.getProperty("content_html") || "");
         this.byId("toolPage").getSideContent().setSelectedKey(oContext.getProperty("id"));
      }
   });
});