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
        this.getView().setModel(new JSONModel({ questions: [] }), "uiControl");
        this.oModel = this.getOwnerComponent().getModel();
      },

      onChapterPress: function (oEvent) {
        const oItem = oEvent.getParameter("item") || oEvent.getSource();
        const oContext = oItem.getBindingContext();

        this.byId("chapterDetails").bindElement({
          path: oContext.getPath(),
        });

        const oChapter = oContext.getObject();

        const sHtml = oChapter.content_html || "";

        const oHtml = new sap.ui.core.HTML({ content: [sHtml] });

        const oWrapper = new sap.m.VBox({ items: oHtml }).addStyleClass(
          "sapUiMediumMargin"
        );

        const oContainer = this.byId("chapterContainer");
        oContainer.removeAllItems();

        if (sHtml) {
          oContainer.addItem(oWrapper);
        } else {
          oContainer.addItem(this.createTest(oChapter));
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

        const oChapter = this.oModel.getProperty(
          `/master_data/courses/${iCourse}/units/${iUnit}/chapters/${iChapter}`
        );

        const sHtml = oChapter.content_html;

        const oHtml = new sap.ui.core.HTML({ content: [sHtml] });

        const oWrapper = new sap.m.VBox({ items: oHtml }).addStyleClass(
          "sapUiMediumMargin"
        );

        const oContainer = this.byId("chapterContainer");
        oContainer.removeAllItems();

        if (sHtml) {
          oContainer.addItem(oWrapper);
        } else {
          oContainer.addItem(this.createTest(oChapter));
        }
      },

      createTest: function (oTest) {
        const oModel = new sap.ui.model.json.JSONModel(oTest);
        this.getView().setModel(oModel, "test");

        const oTitle = new sap.m.Title({ text: oTest.title }).addStyleClass(
          "AgiHeader2 sapUiSmallMarginBegin"
        );

        const oHeaderSpace = new sap.m.VBox({
          items: [oTitle],
          width: "100%",
          height: "5rem",
          alignItems: "Start",
          justifyContent: "Center",
          backgroundDesign: "Solid",
        });

        const oQuestionContainer = new sap.m.VBox({
          items: {
            path: "test>/questions",
            factory: this.createQuestion.bind(this),
          },

          width: "calc(100% - 12rem)",
          gap: "2.5rem",
        });

        const oButton = new sap.m.Button({
          text: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("evaluateAnswers"),
          press: () => this._onEvaluateAnswers(oTest),
        });

        const oTestContainer = new sap.m.VBox({
          items: [oHeaderSpace, oQuestionContainer, oButton],
          alignItems: "Center",
          gap: "2.5rem",
        });
        return oTestContainer;
      },

      createQuestion: function (sId, oContext) {
        const aPathParts = oContext.getPath().split("/");
        const iQuestion = aPathParts[aPathParts.length - 1];
        const sQuestion = oContext.getProperty("question");
        const aAnswers = oContext.getProperty("answers");

        const uiControl = this.getView().getModel("uiControl");
        uiControl.setProperty(`/questions/${iQuestion}`, {
          question: sQuestion,
          answers: aAnswers.map((oAnswer) => ({
            text: oAnswer,
            selected: false,
          })),
        });

        const oTitle = new sap.m.Title({ text: sQuestion });
        oTitle.addStyleClass("AgiHeader2 sapUiMediumMarginTopBottom");

        const oAnswerContainer = new sap.m.VBox({ gap: "1rem" });

        oAnswerContainer.bindAggregation("items", {
          path: `uiControl>/questions/${iQuestion}/answers`,
          templateShareable: false,
          template: new sap.m.Panel({
            content: [
              new sap.m.CheckBox({
                text: "{uiControl>text}",
                selected: "{uiControl>selected}",
              }),
            ],
            width: "calc(100% - 1rem)",
          }).addStyleClass("sapMTile"),
        });

        return new sap.m.Panel({
          content: [oTitle, oAnswerContainer],
          width: "100%",
          backgroundDesign: "Solid",
        });
      },

      _onEvaluateAnswers: function (oTest) {
        const oUiControl = this.getView().getModel("uiControl");
        const oData = oUiControl.getData();

        console.warn(oUiControl);

        const aQuestions = oTest.questions;

        const oCorrectedModel = {
          questions: oTest.questions.map((oQuestion) => ({
            correct: oQuestion.answers.map(() => false),
          })),
        };

        oTest.questions.forEach((oQuestion, iQuestion) => {
          oQuestion.answers.forEach((oAnswer, iAnswer) => {
            if (aQuestions[iQuestion].correct.includes(iAnswer)) {
              if (oData.questions[iQuestion].answers[iAnswer].selected) {
                oCorrectedModel.questions[iQuestion].correct[iAnswer] = true;
              }
            } else {
              if (!oData.questions[iQuestion].answers[iAnswer].selected) {
                oCorrectedModel.questions[iQuestion].correct[iAnswer] = true;
              }
            }
          });
        });

        console.log(oCorrectedModel);
      },
    });
  }
);
