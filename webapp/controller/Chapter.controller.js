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
        this.getView().setModel(
          new JSONModel({
            questions: [],
            rating: {
              percentage: 0,
              correctQuestions: 0,
              result: null,
            },
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

        this.byId("chapterDetails").bindElement({
          path: oContext.getPath(),
        });

        const oChapter = oContext.getObject();

        this._createChapterContent(oChapter);

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

        this._createChapterContent(oChapter);
      },

      _createChapterContent: function (oChapter) {
        const sHtml = oChapter.content_html || "";

        const oHtml = new sap.ui.core.HTML({ content: [sHtml] });

        const oWrapper = new sap.m.VBox({ items: oHtml }).addStyleClass(
          "sapUiMediumMargin"
        );

        const oContainer = this.byId("chapterContainer");
        oContainer.removeAllItems();

        if (sHtml) {
          oContainer.addItem(oWrapper);
          this.byId("feedbackWrapper").removeAllItems();
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
          id: "oValidateButton",
          press: () => {
            this._onEvaluateAnswers(oTest);
            oButton.destroy();
          },
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
            correct: null,
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
        const oData = this.oUiControl.getData();
        const aQuestions = oTest.questions;

        oTest.questions.forEach((oQuestion, iQuestion) => {
          oQuestion.answers.forEach((oAnswer, iAnswer) => {
            if (aQuestions[iQuestion].correct.includes(iAnswer)) {
              if (oData.questions[iQuestion].answers[iAnswer].selected) {
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/correct`,
                  true
                );
              } else {
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/correct`,
                  false
                );
              }
            } else {
              if (!oData.questions[iQuestion].answers[iAnswer].selected) {
                console.log("index: " + iQuestion);
                console.log(this.oUiControl);
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/correct`,
                  true
                );
              } else {
                this.oUiControl.setProperty(
                  `/questions/${iQuestion}/answers/${iAnswer}/correct`,
                  false
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

        this._setPercentage(this._calculateCorrectQuestions());
        this._setRating();
        this._generateFeedback(oTest);
      },

      _calculateCorrectQuestions: function () {
        const aCorrectQuestions = [];
        this.oUiControl.getData().questions.forEach((oQuestion) => {
          if (oQuestion.questionCorrect) {
            aCorrectQuestions.push(oQuestion.question);
          }
        });
        this.oUiControl.setProperty(
          "/rating/correctQuestions",
          aCorrectQuestions.length
        );
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

      _generateFeedback: function (oTest) {
        const oChartContainer = new sap.suite.ui.microchart.RadialMicroChart({
          size: "L",
          percentage: this.oUiControl.getProperty("/rating/percentage"),
          valueColor: this.oUiControl.getProperty("/rating/result"),
          width: "6rem",
        });
        const oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
          content: oChartContainer,
        }).addStyleClass("sapUiSmallMarginEnd");
        const oRepeatButton = new sap.m.Button({
          text: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("evaluateAnswers"),
          press: () => {
            this._onEvaluateAnswers(oTest);
          },
        });

        let sFeedbackTitle = "";

        if (this.oUiControl.getProperty("/rating/result") == "good") {
          sFeedbackTitle = this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("feedbackGood");
        } else {
          sFeedbackTitle = this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("feedbackBad");
        }

        const iCorrectQuestions = this.oUiControl.getProperty(
          "/rating/correctQuestions"
        );
        const iQuestionAmount =
          this.oUiControl.getProperty(`/questions`).length;

        const sFeedBackText = `${iCorrectQuestions} von ${iQuestionAmount} Fragen sind richtig beantwortet worden`; // I18n Erstellen, wenn noch zeit

        const oFeedBackTitle = new sap.m.Title({
          text: sFeedbackTitle,
        }).addStyleClass("AgiHeader2");
        const oFeedBackText = new sap.m.Text({
          text: sFeedBackText,
        });

        const oFeedbackTextWrapper = new sap.m.VBox({
          items: [oFeedBackTitle, oFeedBackText],
        });

        const oFeedBackWrapperLeft = new sap.m.HBox({
          items: [oHorizontalLayout, oFeedbackTextWrapper],
          justifyContent: "Center",
        });

        const oCenterVBox = new sap.m.HBox({
          items: [oFeedBackWrapperLeft, oRepeatButton],
          width: "100%",
          justifyContent: "SpaceBetween",
          alignItems: "End",
        });

        const oFeedbackWrapper = this.byId("feedbackWrapper");
        const oFeedbackContainer = new sap.m.Panel({
          content: [oCenterVBox],
          width: "100%",
        }).addStyleClass(
          "sapMTile AgiNoMarginStartEnd sapUiSmallMarginTopBottom"
        );

        const oVBox = new sap.m.VBox({
          items: oFeedbackContainer,
          width: "calc(100% - 12rem)",
        });

        oFeedbackWrapper.removeAllItems();
        oFeedbackWrapper.addItem(oVBox);
      },

      _showWrongAnswer: function () {},
    });
  }
);
