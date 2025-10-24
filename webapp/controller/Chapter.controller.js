sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("ui5.agi_learning_hub.controller.Chapter", {
      oRouter: undefined,

      onInit: function () {
        this.getOwnerComponent()
          .getRouter()
          .getRoute("chapter")
          .attachPatternMatched(this._onChapterMatched, this);
        this.oRouter = this.getOwnerComponent().getRouter();
        this.getView().setModel(
          new JSONModel({
            chapterId: undefined,
            unitId: undefined,
            questions: [],
            rating: {
              percentage: 0,
              correctQuestions: 0,
              questionAmount: 0,
              result: null,
            },
            showFeedback: false,
            eResult: {
              // Nicht teil des Models
              GOOD: "Good",
              CRITICAL: "Critical",
              ERROR: "Error",
            },
          }),
          "uiControl"
        );
        // Idealerrweise eher eine Funktion bereitstellen, z.B. getUIModel()
        // um den Flow in Kombination mit der UI5 API nicht zu brechen
        this.oUiControl = this.getView().getModel("uiControl");
        this.oModel = this.getOwnerComponent().getModel();
      },

      onEvaluateAnswers: function (oEvent) {
        const aUiQuestions = this.oUiControl.getProperty("/questions");
        const iCourse = this._findCourseIndex();
        const iUnit = this._findUnitIndex(iCourse);
        const iChapter = this._findChapterIndex(iCourse, iUnit);
        const oTest = this.oModel.getProperty(
          `/master_data/courses/${iCourse}/units/${iUnit}/chapters/${iChapter}`
        );

        oTest.questions.forEach((oQuestion, iQuestion) => {
          // Besser iIndex oder iQuestionIndex
          oQuestion.answers.forEach((oAnswer, iAnswer) => {
            this.oUiControl.setProperty(
              `/questions/${iQuestion}/answers/${iAnswer}/correct`,
              oQuestion.correct.includes(iAnswer) ===
                aUiQuestions[iQuestion].answers[iAnswer].selected
            );
            this.oUiControl.setProperty(
              `/questions/${iQuestion}/answers/${iAnswer}/valueState`,
              oQuestion.correct.includes(iAnswer) ===
                aUiQuestions[iQuestion].answers[iAnswer].selected
                ? "Success"
                : "Error"
            );
          });
        });

        this.oUiControl
          .getProperty(`/questions`)
          .forEach((oQuestion, iQuestion) => {
            this.oUiControl.setProperty(
              `/questions/${iQuestion}/questionCorrect`,
              oQuestion.answers.every((oAnswer) => oAnswer.correct)
            );
          });

        this._calculateCorrectQuestions();
        this._setPercentage();
        this._setRating();

        this.oUiControl.setProperty("/showFeedback", true);
      },

      onChapterPress: function (oEvent) {
        const oItem = oEvent.getParameter("item") || oEvent.getSource();
        const oContext = oItem.getBindingContext();

        const sChapterId = oContext.getObject().id;
        const sUnitId = oEvent.getSource().getParent().getProperty("key"); // Prüfen ob evtl. Zugriff über Stabile ID möglich ist

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
        // Course Id sollte teil der schnittstelle sein
        const aCourses = this.oModel.getProperty("/master_data/courses") || [];
        return aCourses.findIndex((oCourse) => oCourse.id === this.sCourseId);
      },

      _findUnitIndex: function (iCourse) {
        // Unit Id sollte teil der schnittstelle sein
        const aUnits =
          this.oModel.getProperty(`/master_data/courses/${iCourse}/units`) ||
          [];
        return aUnits.findIndex((oUnit) => oUnit.id === this.sUnitId);
      },

      _findChapterIndex(iCourse, iUnit) {
        // Capter Id sollte teil der schnittstelle sein
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

        // Entweder/oder sChapterId, oChapter. Einheitlich für alle 3 Objekte (Course,Unit,Chapter)
        // Evtl. Hilfsfunktion für Zugriff auf Objekt getCurrentChapter()
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

        if (this.oChapter.type == "chapter") {
          const oContainer = this.byId("chapterContainer");
          oContainer.removeAllItems();
          oContainer.addItem(oWrapper);
        } else {
          const oTestcontainer = this.byId("testContainer");
          oTestcontainer.removeAllItems();
          this._createTest();
        }
      },

      _createTest: async function () {
        // Nur 1x laden, prüfen ob schon gesetzt
        if (!this._oTestFragment) {
          this._oTestFragment = sap.ui.core.Fragment.load({
            name: "ui5.agi_learning_hub.view.fragment.Test",
            type: "XML",
            controller: this,
          }).then(() => {
            oFragment.placeAt(this.byId("chapterDetails"));
          });
        } else {
          this._oTestFragment.placeAt(this.byId("chapterDetails"));
        }

        // async/await
        this._oTestFragment ??= await sap.ui.core.Fragment.load({
          name: "ui5.agi_learning_hub.view.fragment.Test",
          type: "XML",
          controller: this,
        });

        this._oTestFragment.placeAt(this.byId("chapterDetails"));
      },

      /**
       * Factory
       * @param {*} sId
       * @param {*} oContext
       * @returns
       */
      createQuestion: function (sId, oContext) {
        const aPathParts = oContext.getPath().split("/");
        const iQuestion = aPathParts[aPathParts.length - 1];
        const sQuestion = oContext.getProperty("question");
        const aAnswers = oContext.getProperty("answers");

        // Aufbau der Daten im JSON Model muss on Route Matched stattfinden
        // daraus abgeleitet, ist die Factory hinfällig...
        const uiControl = this.getView().getModel("uiControl");
        uiControl.setProperty(`/questions/${iQuestion}`, {
          description: sQuestion,
          answers: aAnswers.map((oAnswer) => ({
            text: oAnswer,
            selected: false,
            correct: null,
            valueState: "None",
          })),
          correct: false,
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
                onpress: "", // Allenfalls Handler für sicherstellen single choice, etc.
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
          .filter((oQuestion) => !oQuestion.questionCorrect)
          .forEach((oQuestion, iQuestion) => {
            oQuestion.answers.forEach((oAnswer, iAnswer) => {
              this.oUiControl.setProperty(
                `/questions/${iQuestion}/answers/${iAnswer}/selected`,
                false
              );
              this.oUiControl.setProperty(
                `/questions/${iQuestion}/answers/${iAnswer}/valueState`,
                "None"
              );
            });
          });
        this.oUiControl.setProperty("/showFeedback", false); 
      },
    });
  }
);
