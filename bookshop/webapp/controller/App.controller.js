sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter",
  ],
  function (
    Controller,
    MessageToast,
    Dialog,
    Button,
    Text,
    Filter,
    FilterOperator,
    formatter
  ) {
    "use strict";
    return Controller.extend("sap.codejam.controller.App", {
      formatter: formatter,
      onSelect: function (oEvent) {
        // console.clear();
        // console.log("event", oEvent);
        const oSource = oEvent.getSource();
        // console.log("source", oSource);
        const contextPath = oSource.getBindingContextPath();
        // console.log("context path", contextPath);
        const form = this.getView().byId("bookDetails");
        // console.log("form", form);
        form.bindElement(contextPath);
      },
      onSubmitOrder: function (oEvent) {
        const oBindingContext = this.getView()
          .byId("bookDetails")
          .getBindingContext();
        const selectedBookID = oBindingContext.getProperty("ID");
        const selectedBookTitle = oBindingContext.getProperty("title");
        const inputValue = this.getView().byId("stepInput").getValue();

        const oModel = this.getView().getModel("i18n");
        oModel.callFunction("/submitOrder", {
          method: "POST",
          urlParameters: {
            book: selectedBookID,
            quantity: inputValue,
          },
          success: function (oData, oResponse) {
            oModel.refresh();
            const oText = `Order successful (${selectedBookTitle}, ${inputValue} pcs.)`;
            MessageToast.show(oText);
          },
          error: function (oError) {
            if (oError.responseText) {
              oError = JSON.parse(oError.responseText).error;
            }
            this.oErrorMessageDialog = new Dialog({
              type: "Standard",
              title: "Error",
              state: "Error",
              content: new Text({ text: oError.message }).addStyleClass(
                "sapUiTinyMargin"
              ),
              beginButton: new Button({
                text: "Close",
                press: function () {
                  this.oErrorMessageDialog.close();
                }.bind(this),
              }),
            });
            this.oErrorMessageDialog.open();
          }.bind(this),
        });
      },
      onSearch: function (oEvent) {
        const sQuery = oEvent.getParameter("newValue");
        const aFilter = [];
        if (sQuery) {
          aFilter.push(new Filter("title", FilterOperator.Contains, sQuery));
        }
        const oList = this.byId("booksTable");
        const oBinding = oList.getBinding("items");
        oBinding.filter(aFilter);
      },
      getStockState: function (stock) {
        if (stock >= 20) {
          return "Success";
        } else if (stock > 0) {
          return "Warning";
        } else {
          return "Error";
        }
      },
      onAfterRendering: function () {
        this.getView().byId("orderBtn").setEnabled(false);
      },
    });
  }
);
