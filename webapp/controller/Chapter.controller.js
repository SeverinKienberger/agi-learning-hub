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
        this.oRouter = this.getOwnerComponent().getRouter();
        this.getView().setModel(
          new JSONModel({
            questions: [],
            rating: {
              percentage: 0,
              correctQuestions: 0,
              questionAmount: 0,
              result: null,
            },
            showFeedback: false,
            eResult: {
              GOOD: "Good",
              CRITICAL: "Critical",
              ERROR: "Error",
            },
          }),
          "uiControl"
        );
        this.oUiControl = this.getView().getModel("uiControl");
        this.oModel = this.getOwnerComponent().getModel();
      },

      onChapterPress: function (oEvent) {
        const oItem = oEvent.getParameter("item") || oEvent.getSource();
        const oContext = oItem.getBindingContext();

        const sChapterId = oContext.getObject().id;
        const sUnitId = oEvent.getSource().getParent().getProperty("key");

        this.byId("toolPage")
          .getSideContent()
          .setSelectedKey(oContext.getProperty("id"));
        this.oRouter.navTo("chapter", {
          courseId: this.sCourseId,
          unitId: sUnitId,
          chapterId: sChapterId,
        });
      },

      _findCourseIndex: function () {
        const aCourses = this.oModel.getProperty("/master_data/courses") || [];
        return aCourses.findIndex((oCourse) => oCourse.id === this.sCourseId);
      },

      _findUnitIndex: function (iCourse) {
        const aUnits =
          this.oModel.getProperty(`/master_data/courses/${iCourse}/units`) ||
          [];
        return aUnits.findIndex((oUnit) => oUnit.id === this.sUnitId);
      },

      _findChapterIndex(iCourse, iUnit) {
        const aChapters =
          this.oModel.getProperty(
            `/master_data/courses/${iCourse}/units/${iUnit}/chapters`
          ) || [];
        return aChapters.findIndex(
          (oChapter) => oChapter.id === this.sChapterId
        );
      },

      _onChapterMatched: function (oEvent) {
        this.sCourseId = oEvent.getParameter("arguments").courseId;
        this.sUnitId = oEvent.getParameter("arguments").unitId;
        this.sChapterId = oEvent.getParameter("arguments").chapterId;

        const iCourse = this._findCourseIndex(this.sCourseId);
        const iUnit = this._findUnitIndex(iCourse);
        const iChapter = this._findChapterIndex(iCourse, iUnit);

        const oSideNav = this.byId("toolPage").getSideContent();
        oSideNav.setSelectedKey(this.sChapterId);

        this.getView().bindElement({
          path: `/master_data/courses/${iCourse}`,
        });

        this.byId("chapterDetails").bindElement({
          path: `/master_data/courses/${iCourse}/units/${iUnit}/chapters/${iChapter}`,
        });

        this.oChapter = this.oModel.getProperty(
          `/master_data/courses/${iCourse}/units/${iUnit}/chapters/${iChapter}`
        );

        this._createChapterContent();
      },

      _createChapterContent: function () {
        const sHtml = this.oChapter.content_html || "";

        const oHtml = new sap.ui.core.HTML({ content: [sHtml] });

        const oWrapper = new sap.m.VBox({ items: oHtml }).addStyleClass(
          "sapUiMediumMargin"
        );

        const oContainer = this.byId("chapterContainer");
        oContainer.removeAllItems();

        if (this.oChapter.type == "chapter") {
          oContainer.addItem(oWrapper);
        } else {
          if (this.byId("testContainer")) {
            this.removeAllItems();
          }
          this.createTest();
        }
      },

      createTest: function () {
        sap.ui.core.Fragment.load({
          name: "ui5.agi_learning_hub.view.fragment.Test",
          type: "XML",
          controller: this,
        }).then(
          function (oFragment) {
            oFragment.placeAt(this.byId("chapterDetails"));
          }.bind(this)
        );
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
            correct: null,
            valueState: "None",
          })),
          questionCorrect: false,
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
                valueState: "{uiControl>valueState}",
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

      _onEvaluateAnswers: function (oEvent) {
        const aUiQuestions = this.oUiControl.getProperty("/questions");
        const iCourse = this._findCourseIndex();
        const iUnit = this._findUnitIndex(iCourse);
        const iChapter = this._findChapterIndex(iCourse, iUnit);
        const oTest = this.oModel.getProperty(
          `/master_data/courses/${iCourse}/units/${iUnit}/chapters/${iChapter}`
        );

        oTest.questions.forEach((oQuestion, iQuestion) => {
          oQuestion.answers.forEach((oAnswer, iAnswer) => {
            if (oQuestion.correct.includes(iAnswer)) {
              if (aUiQuestions[iQuestion].answers[iAnswer].selected) {
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/correct`,
                  true
                );
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/valueState`,
                  "Success"
                );
              } else {
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/correct`,
                  false
                );
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/valueState`,
                  "Error"
                );
              }
            } else {
              if (!aUiQuestions[iQuestion].answers[iAnswer].selected) {
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/correct`,
                  true
                );
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/valueState`,
                  "None"
                );
              } else {
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/correct`,
                  false
                );
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/valueState`,
                  "Error"
                );
              }
            }
          });
        });

        this.oUiControl
          .getProperty(`/questions`)
          .forEach((oQuestion, iQuestion) => {
            const correct = oQuestion.answers.every(
              (oAnswer) => oAnswer.correct
            );
            if (correct) {
              this.oUiControl.setProperty(
                `/questions/${iQuestion}/questionCorrect`,
                true
              );
            } else {
              this.oUiControl.setProperty(
                `/questions/${iQuestion}/questionCorrect`,
                false
              );
            }
          });

        this._calculateCorrectQuestions();
        this._setPercentage();
        this._setRating();

        this.oUiControl.setProperty("/showFeedback", true);
      },

      _calculateCorrectQuestions: function () {
        const aCorrectQuestions = [];
        this.oUiControl.getProperty("/questions").forEach((oQuestion) => {
          if (oQuestion.questionCorrect) {
            aCorrectQuestions.push(oQuestion.question);
          }
        });
        this.oUiControl.setProperty(
          "/rating/correctQuestions",
          aCorrectQuestions.length
        );

        const iQuestionAmount =
          this.oUiControl.getProperty(`/questions`).length;

        this.oUiControl.setProperty("/rating/questionAmount", iQuestionAmount);
      },

      _setPercentage: function () {
        const iCorrectQuestions = this.oUiControl.getProperty(
          "/rating/correctQuestions"
        );
        const iQuestionAmount =
          this.oUiControl.getProperty(`/questions`).length;
        const fPercentage = (iCorrectQuestions / iQuestionAmount) * 100;
        this.oUiControl.setProperty("/rating/percentage", fPercentage);
      },

      _setRating: function () {
        const fpercentage = this.oUiControl.getProperty("/rating/percentage");
        const iErrorThreshhold = 30;
        const iNeutralThreshhold = 70;
        const oEnum = this.oUiControl.getProperty("/eResult");

        if (fpercentage < iErrorThreshhold) {
          this.oUiControl.setProperty("/rating/result", oEnum.ERROR);
        } else if (fpercentage < iNeutralThreshhold) {
          this.oUiControl.setProperty("/rating/result", oEnum.CRITICAL);
        } else {
          this.oUiControl.setProperty("/rating/result", oEnum.GOOD);
        }
      },

      resetQuiz: function () {
        this.oUiControl
          .getProperty("/questions")
          .forEach((oQuestion, iQuestion) => {
            oQuestion.answers.forEach((oAnswer, iAnswer) => {
              if (
                !this.oUiControl.getProperty(
                  `/questions/${iQuestion}/questionCorrect`
                )
              ) {
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/selected`,
                  false
                );
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/valueState`,
                  "None"
                );
              }
            });
          });
        this.oUiControl.setProperty("/showFeedback", false);
      },
    });
  }
);
