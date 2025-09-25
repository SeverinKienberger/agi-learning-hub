sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
   "use strict";

   return Controller.extend("ui5.agi_learning_hub.controller.Chapter", {
      onInit: function () {
            this.getOwnerComponent().getRouter()
            .getRoute("chapter")
            .attachPatternMatched(this._onCourseMatched, this);
      },

      _onCourseMatched: function (oEvent) {
         const sCourseId = oEvent.getParameter("arguments").courseId;
         const sChapterId = oEvent.getParameter("arguments").chapterId;
         const oMD = this.getOwnerComponent().getModel("mockData");
         const a   = oMD.getProperty("/master_data/courses") || [];
         const i   = a.findIndex(c => c.id === sCourseId);

         this.getView().bindElement({
         model: "mockData",
         path: `/master_data/courses/${i}`
         });
      },

      onChapterPress: function (oEvent) {
         const oModel = this.getView().getModel("mockData")             
         const oItem = oEvent.getParameter("item") || oEvent.getSource();
         const oCtx  = oItem?.getBindingContext?.("mockData");
         const sPath = oCtx?.getPath?.();

         this.byId("chapterDetails").bindElement({
            model: "mockData",
            path: sPath
         })
      }
   });
});