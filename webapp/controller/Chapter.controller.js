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
        const aQuestions = oTest.questions || [];

        const oAnswerModel = new JSONModel({
          answers: aQuestions.map(() => ({ selected: [] })),
        });
        this.getView().setModel(oAnswerModel, "answers");

        const oTitle = new sap.m.Title({ text: oTest.title });
        oTitle.addStyleClass("AgiHeader2");

        const oHeaderSpace = new sap.m.VBox({
          items: [oTitle],
          width: "100%",
          alignItems: "Start",
          backgroundDesign: "Solid",
        });

        oHeaderSpace.addStyleClass("AgiHeaderSpace sapUiLargeMarginBottom");

        const aQuestionControls = aQuestions.map((oQuestion, iQuestion) => {
          const oQuestionTitle = new sap.m.Title({ text: oQuestion.question });
          oQuestionTitle.addStyleClass("AgiHeader2 sapUiMediumMarginTopBottom");

          const aAnswers = oQuestion.answers.map((oAnswer, iAnswer) => {
            const oAnswerText = new sap.m.Text({ text: oAnswer });

            const oCheckBox = new sap.m.CheckBox({
              select: (oEvent) =>
                this._onAnswerSelect(oEvent, iQuestion, iAnswer),
            });

            const oAnswerAligned = new sap.m.HBox({
              items: [oCheckBox, oAnswerText],
              alignItems: "Center",
            });
            return new sap.m.Panel({
              content: [oAnswerAligned],
              width: "calc(100% - 1rem)",
            }).addStyleClass("sapMTile");
          });

          const oAnswerWrapper = new sap.m.Panel({
            content: [oQuestionTitle, aAnswers],
            width: "100%",
            backgroundDesign: "Solid",
          });

          return oAnswerWrapper;
        });

        const oQuestionWrapper = new sap.m.VBox({
          items: aQuestionControls,
          width: "calc(100% - 30rem)",
          gap: "3.5rem",
        });

        const oButton = new sap.m.Button({
          text: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("evaluateAnswers"),
          press: () => this._onEvaluateAnswers(oTest),
        });

        return new sap.m.VBox({
          items: [oHeaderSpace, oQuestionWrapper, oButton],
          alignItems: "Center",
        });
      },

      _onAnswerSelect: function (oEvent, iQuestion, iAnswer) {
        const oModel = this.getView().getModel("answers");
        const aAnswers = oModel.getProperty("/answers");
        const bSelected = oEvent.getParameter("selected");

        if (bSelected) {
          if (!aAnswers[iQuestion].selected.includes(iAnswer)) {
            aAnswers[iQuestion].selected.push(iAnswer);
          }
        } else {
          const iIndex = aAnswers[iQuestion].selected.indexOf(iAnswer);
          if (iIndex > -1) {
            aAnswers[iQuestion].selected.splice(iIndex, 1);
          }
        }

        oModel.refresh(true);
        console.warn(oModel.getData());
      },

      _onEvaluateAnswers: function (oTest) {
        const oAnswerModel = this.getView().getModel("answers").getData();
        const aQuestions = oTest.questions;

        const oCorrectedModel = {
          questions: oTest.questions.map((oQuestion) => ({
            correct: oQuestion.answers.map(() => false),
          })),
        };

        oTest.questions.forEach((oQuestion, iQuestion) => {
          oQuestion.answers.forEach((oAnswer, iAnswer) => {
            if (aQuestions[iQuestion].correct.includes(iAnswer)) {
              if (oAnswerModel.answers[iQuestion].selected.includes(iAnswer)) {
                oCorrectedModel.questions[iQuestion].correct[iAnswer] = true;
              }
            } else {
              if (!oAnswerModel.answers[iQuestion].selected.includes(iAnswer)) {
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
