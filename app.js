//***************************** Budget Controller  *************************************************
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcperc = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    return {
        addItem: function (type, des, val) {
            var newItem;
            if (data.allItems[type].length > 0) {
                var ID =
                    data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                var ID = 0;
            }
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        // *********
        deleteItem: function (type, id) {
            var IDs, index;
            IDs = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = IDs.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        // *********
        calculateBudget: function () {
            calculateTotal("exp");
            calculateTotal("inc");

            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round(
                    (data.totals.exp / data.totals.inc) * 100
                );
            } else {
                data.percentage = -1;
            }
        },
        // *********
        calcperc: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcperc(data.totals.inc);
            });
        },
        getPercentage: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        // *********
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },
        testing: function () {
            console.log(data);
        },
    };
})();

//*********************************************** UI controller *******************************************************
var UIController = (function () {
    var domStrings = {
        inputType: ".add__type",
        inputDesc: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        expenseCont: ".expenses__list",
        incomeCont: ".income__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        continer: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
    };
    var formatNumber= function (num ,type) {
        var type , num;

        num = Math.abs(num)
        num = num.toFixed(2)
        numSplit = num.split('.')
        int=numSplit[0]
        if(int.length >3){
            int = int.substr(0,int.length -3 ) + '.' + int.substr(int.length-3 ,3)
        }
        dec=numSplit[1]

        return (type === 'exp' ? '-' : '+') + " " + int + '.' + dec;
    };
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(domStrings.inputType).value,
                desc: document.querySelector(domStrings.inputDesc).value,
                value: parseFloat(
                    document.querySelector(domStrings.inputValue).value
                ),
                btn: document.querySelector(domStrings.inputBtn).value,
            };
        },
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(domStrings.budgetLabel).textContent =
            formatNumber(obj.budget, type);
            document.querySelector(domStrings.incomeLabel).textContent =
            formatNumber(obj.totalInc, 'inc');
            document.querySelector(domStrings.expenseLabel).textContent =
            formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(domStrings.percentageLabel).textContent =
                    obj.percentage + " %";
            } else {
                document.querySelector(domStrings.percentageLabel).textContent =
                    "--";
            }
        },
        displayPercantage: function (percentages) {
            var fields = document.querySelectorAll(
                domStrings.expensesPercLabel
            );

            nodeListForEach(fields, function (cur, index) {
                if (percentages[index] > 0) {
                    cur.textContent = percentages[index] + " %";
                } else {
                    cur.textContent = "---";
                }
            });
        },
        displayMonth: function () {
            var year, month, months;
            month = new Date().getMonth();
            months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            year = new Date().getFullYear();

            document.querySelector(domStrings.dateLabel).textContent =
                months[month] + " " + year;
        },
        changedType: function() {
            
            var fields = document.querySelectorAll(
                domStrings.inputType + ',' +
                domStrings.inputDesc + ',' +
                domStrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(domStrings.inputBtn).classList.toggle('red');
            
        },
        getDomStrings: function () {
            return domStrings;
        },
        addListItems: function (obj, type) {
            var html, newHtml, element;

            if (type === "inc") {
                element = domStrings.incomeCont;
                html =
                    '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%desc%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === "exp") {
                element = domStrings.expenseCont;
                html =
                    '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%desc%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%desc%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value , type));

            document
                .querySelector(element)
                .insertAdjacentHTML("beforeend", newHtml);
        },
        deleteListItems: function (selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(
                domStrings.inputDesc + ", " + domStrings.inputValue
            );

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },
    };
})();

// ************************************App controller************************************
var controller = (function (budgetCtrl, uiCtrl) {
    var setupEventListeners = function () {
        var dom = uiCtrl.getDomStrings();

        document
            .querySelector(dom.inputBtn)
            .addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document
            .querySelector(dom.continer)
            .addEventListener("click", ctrlDeleteItem);

        document
            .querySelector(dom.inputType)
            .addEventListener("change", uiCtrl.changedType);
    };

    var updaeBudget = function () {
        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();

        uiCtrl.displayBudget(budget);
    };

    var ctrlAddItem = function () {
        var input = uiCtrl.getInput();

        if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {
            var newItem = budgetController.addItem(
                input.type,
                input.desc,
                input.value
            );

            uiCtrl.addListItems(newItem, input.type);

            uiCtrl.clearFields();

            updaeBudget();

            calculatePercentage();
        }
    };
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);

            uiCtrl.deleteListItems(itemID);

            updaeBudget();

            calculatePercentage();
        }
    };
    var calculatePercentage = function () {
        budgetCtrl.calcperc();
        var percentages = budgetCtrl.getPercentage();
        uiCtrl.displayPercantage(percentages);
    };

    return {
        init: function () {
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            uiCtrl.displayMonth();
            setupEventListeners();
        },
    };
})(budgetController, UIController);

controller.init();
