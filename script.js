
/* =========================================
   ELEMENTS
========================================= */

const expressionDisplay =
    document.getElementById("expression");

const resultDisplay =
    document.getElementById("result");

const buttons =
    document.querySelectorAll(".btn");

const historyToggle =
    document.getElementById("historyToggle");

const historyPanel =
    document.getElementById("historyPanel");

const historyList =
    document.getElementById("historyList");

const clearHistoryButton =
    document.getElementById("clearHistory");


/* =========================================
   VARIABLES
========================================= */

let expression = "";

let lastAnswer = 0;

let history = [];


/* =========================================
   UPDATE DISPLAY
========================================= */

function updateDisplay() {

    expressionDisplay.textContent =
        expression || "0";

    try {

        if (expression) {

            const result =
                calculateExpression(expression);

            resultDisplay.textContent =
                formatNumber(result);

        } else {

            resultDisplay.textContent = "0";

        }

    } catch {

        resultDisplay.textContent = "0";

    }
}


/* =========================================
   FORMAT NUMBER
========================================= */

function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return "Error";
    }

    if (Number.isInteger(number)) {
        return number.toLocaleString("en-IN");
    }

    return parseFloat(
        number.toFixed(10)
    ).toLocaleString("en-IN");
}


/* =========================================
   PREPARE EXPRESSION
========================================= */

function prepareExpression(exp) {

    return exp
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/π/g, Math.PI.toString())
        .replace(/ANS/g, lastAnswer.toString());
}


/* =========================================
   CALCULATE EXPRESSION
========================================= */

function calculateExpression(exp) {

    let prepared =
        prepareExpression(exp);

    /*
        Only allow:
        numbers
        operators
        decimal
        parentheses
        spaces
    */

    if (!/^[0-9+\-*/().\s]+$/.test(prepared)) {

        throw new Error("Invalid expression");

    }


    /*
        Evaluate expression.

        This is suitable for this local calculator
        because the expression is generated from
        calculator buttons/keyboard input.
    */

    const result =
        Function(`"use strict"; return (${prepared})`)();

    if (!Number.isFinite(result)) {

        throw new Error("Math error");

    }

    return result;
}


/* =========================================
   ADD NUMBER
========================================= */

function addNumber(value) {

    /*
        Prevent multiple decimal points
        in the same number.
    */

    if (value === ".") {

        const parts =
            expression.split(/[\+\-\*\/]/);

        const currentNumber =
            parts[parts.length - 1];

        if (currentNumber.includes(".")) {
            return;
        }

        if (
            currentNumber === "" ||
            currentNumber === "0"
        ) {

            expression += "0";

        }
    }


    /*
        Prevent strange leading zeros.
    */

    if (
        value === "00" &&
        (
            expression === "" ||
            expression.endsWith("+") ||
            expression.endsWith("-") ||
            expression.endsWith("*") ||
            expression.endsWith("/")
        )
    ) {

        expression += "0";

        updateDisplay();

        return;
    }


    expression += value;

    updateDisplay();
}


/* =========================================
   ADD OPERATOR
========================================= */

function addOperator(operator) {

    if (expression === "") {

        if (operator === "-") {

            expression = "-";

            updateDisplay();

        }

        return;
    }


    /*
        Don't allow two operators together.
    */

    const lastCharacter =
        expression.slice(-1);

    if (
        ["+", "-", "*", "/"].includes(lastCharacter)
    ) {

        expression =
            expression.slice(0, -1) + operator;

    } else {

        expression += operator;

    }

    updateDisplay();
}


/* =========================================
   CLEAR
========================================= */

function clearCalculator() {

    expression = "";

    expressionDisplay.textContent = "0";

    resultDisplay.textContent = "0";
}


/* =========================================
   DELETE
========================================= */

function deleteLast() {

    expression =
        expression.slice(0, -1);

    updateDisplay();
}


/* =========================================
   EQUALS
========================================= */

function calculateResult() {

    if (!expression) {
        return;
    }

    try {

        const result =
            calculateExpression(expression);

        const formattedResult =
            formatNumber(result);

        addToHistory(
            expression,
            formattedResult
        );

        lastAnswer = result;

        expressionDisplay.textContent =
            expression + " =";

        resultDisplay.textContent =
            formattedResult;

        expression =
            result.toString();

    } catch {

        expressionDisplay.textContent =
            "Invalid calculation";

        resultDisplay.textContent =
            "Error";

        expression = "";

    }
}


/* =========================================
   PERCENTAGE
========================================= */

function percentage() {

    if (!expression) {
        return;
    }

    try {

        /*
            Convert the last number into percentage.
        */

        const match =
            expression.match(
                /(\d*\.?\d+)$/
            );

        if (!match) {
            return;
        }

        const number =
            parseFloat(match[1]);

        const percentageValue =
            number / 100;

        expression =
            expression.slice(
                0,
                match.index
            ) + percentageValue;

        updateDisplay();

    } catch {

        resultDisplay.textContent =
            "Error";

    }
}


/* =========================================
   SQUARE ROOT
========================================= */

function squareRoot() {

    if (!expression) {
        return;
    }

    try {

        const value =
            calculateExpression(expression);

        if (value < 0) {

            resultDisplay.textContent =
                "Error";

            return;
        }

        const result =
            Math.sqrt(value);

        addToHistory(
            `√(${formatNumber(value)})`,
            formatNumber(result)
        );

        lastAnswer = result;

        expression =
            result.toString();

        expressionDisplay.textContent =
            `√(${formatNumber(value)})`;

        resultDisplay.textContent =
            formatNumber(result);

    } catch {

        resultDisplay.textContent =
            "Error";

    }
}


/* =========================================
   SQUARE
========================================= */

function squareNumber() {

    if (!expression) {
        return;
    }

    try {

        const value =
            calculateExpression(expression);

        const result =
            value * value;

        addToHistory(
            `(${formatNumber(value)})²`,
            formatNumber(result)
        );

        lastAnswer = result;

        expression =
            result.toString();

        expressionDisplay.textContent =
            `(${formatNumber(value)})²`;

        resultDisplay.textContent =
            formatNumber(result);

    } catch {

        resultDisplay.textContent =
            "Error";

    }
}


/* =========================================
   RECIPROCAL
========================================= */

function reciprocal() {

    if (!expression) {
        return;
    }

    try {

        const value =
            calculateExpression(expression);

        if (value === 0) {

            resultDisplay.textContent =
                "Error";

            return;
        }

        const result =
            1 / value;

        addToHistory(
            `1/(${formatNumber(value)})`,
            formatNumber(result)
        );

        lastAnswer = result;

        expression =
            result.toString();

        expressionDisplay.textContent =
            `1/(${formatNumber(value)})`;

        resultDisplay.textContent =
            formatNumber(result);

    } catch {

        resultDisplay.textContent =
            "Error";

    }
}


/* =========================================
   PLUS / MINUS
========================================= */

function plusMinus() {

    if (!expression) {
        return;
    }

    try {

        const value =
            calculateExpression(expression);

        const result =
            value * -1;

        expression =
            result.toString();

        updateDisplay();

    } catch {

        resultDisplay.textContent =
            "Error";

    }
}


/* =========================================
   PI
========================================= */

function addPi() {

    if (
        expression &&
        /[\d)]$/.test(expression)
    ) {

        expression += "*";

    }

    expression += "π";

    updateDisplay();
}


/* =========================================
   OPEN PARENTHESIS
========================================= */

function openParenthesis() {

    if (
        expression &&
        /[\dπ)]$/.test(expression)
    ) {

        expression += "*";

    }

    expression += "(";

    updateDisplay();
}


/* =========================================
   CLOSE PARENTHESIS
========================================= */

function closeParenthesis() {

    if (!expression) {
        return;
    }

    const open =
        (expression.match(/\(/g) || []).length;

    const close =
        (expression.match(/\)/g) || []).length;

    if (open > close) {

        expression += ")";

        updateDisplay();

    }
}


/* =========================================
   ANSWER
========================================= */

function addAnswer() {

    if (
        expression &&
        /[\d)]$/.test(expression)
    ) {

        expression += "*";

    }

    expression += "ANS";

    updateDisplay();
}


/* =========================================
   HISTORY
========================================= */

function addToHistory(
    calculation,
    result
) {

    history.unshift({
        calculation,
        result
    });


    /*
        Keep only last 20 calculations.
    */

    if (history.length > 20) {

        history.pop();

    }

    renderHistory();
}


/* =========================================
   RENDER HISTORY
========================================= */

function renderHistory() {

    historyList.innerHTML = "";


    if (history.length === 0) {

        historyList.innerHTML =
            `<p class="empty-history">
                No calculations yet
            </p>`;

        return;
    }


    history.forEach((item, index) => {

        const historyItem =
            document.createElement("div");

        historyItem.className =
            "history-item";


        historyItem.innerHTML = `
            <div class="history-expression">
                ${item.calculation}
            </div>

            <div class="history-result">
                = ${item.result}
            </div>
        `;


        /*
            Clicking history item
            puts result into calculator.
        */

        historyItem.addEventListener(
            "click",
            () => {

                expression =
                    item.result.replace(/,/g, "");

                updateDisplay();

                historyPanel.classList.remove(
                    "active"
                );

            }
        );


        historyList.appendChild(historyItem);

    });

}


/* =========================================
   CLEAR HISTORY
========================================= */

clearHistoryButton.addEventListener(
    "click",
    () => {

        history = [];

        renderHistory();

    }
);


/* =========================================
   HISTORY TOGGLE
========================================= */

historyToggle.addEventListener(
    "click",
    () => {

        historyPanel.classList.toggle(
            "active"
        );

    }
);


/* =========================================
   BUTTON EVENTS
========================================= */

buttons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const value =
                button.dataset.value;

            const action =
                button.dataset.action;


            /*
                Number / decimal buttons
            */

            if (value !== undefined) {

                if (
                    ["+", "-", "*", "/"].includes(value)
                ) {

                    addOperator(value);

                } else {

                    addNumber(value);

                }

                return;
            }


            /*
                Actions
            */

            switch (action) {

                case "clear":
                    clearCalculator();
                    break;

                case "delete":
                    deleteLast();
                    break;

                case "equals":
                    calculateResult();
                    break;

                case "percent":
                    percentage();
                    break;

                case "sqrt":
                    squareRoot();
                    break;

                case "square":
                    squareNumber();
                    break;

                case "reciprocal":
                    reciprocal();
                    break;

                case "plusMinus":
                    plusMinus();
                    break;

                case "pi":
                    addPi();
                    break;

                case "openParen":
                    openParenthesis();
                    break;

                case "closeParen":
                    closeParenthesis();
                    break;

                case "ans":
                    addAnswer();
                    break;

            }

        }
    );

});


/* =========================================
   KEYBOARD SUPPORT
========================================= */

document.addEventListener(
    "keydown",
    event => {

        const key = event.key;


        /*
            Numbers
        */

        if (/^[0-9]$/.test(key)) {

            addNumber(key);

            return;
        }


        /*
            Decimal
        */

        if (key === ".") {

            addNumber(".");

            return;
        }


        /*
            Operators
        */

        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/"
        ) {

            addOperator(key);

            return;
        }


        /*
            Enter
        */

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculateResult();

            return;
        }


        /*
            Backspace
        */

        if (key === "Backspace") {

            deleteLast();

            return;
        }


        /*
            Escape
        */

        if (key === "Escape") {

            clearCalculator();

            return;
        }


        /*
            Percentage
        */

        if (key === "%") {

            percentage();

            return;
        }


        /*
            Parentheses
        */

        if (key === "(") {

            openParenthesis();

            return;
        }


        if (key === ")") {

            closeParenthesis();

            return;
        }

    }
);


/* =========================================
   INITIAL DISPLAY
========================================= */

updateDisplay();

renderHistory();

