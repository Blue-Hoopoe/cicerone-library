//prototyping for more backward compatibility
Element.prototype.css = function (property) {
    return window.getComputedStyle(this).getPropertyValue(property);
}

Element.prototype.getClasses = function () {
    return this.className.split(" ");
}

Element.prototype.setClasses = function (classes) {
    if (typeof classes !== "string") {
        var classString = "";
        for (var i = 0; i < classes.length; i++) {
            classString += classes[i] + " ";
        }
        this.className = classString.slice(0, -1);
    } else {
        this.className = classes;
    }
}

//defining object logic
function Cicerone(steps) {

    //inicializing variables and properties
    var index = -1, self = this, curtain, current, styles, dialog, templates = {};
    this.steps = steps || [];

    //function which starts the whole presentation
    this.start = function (from) {

        //if curtain exsists, function shouldn't be invoked
        if (typeof curtain !== "undefined") {
            console && console.warn("The presentation is already running. Use 'makeStep' function to navigate.");
            return;
        }

        //check if from variable is in range
        if (from <= 0 || from > steps.length) {
            console && console.warn("Given step '" + from + "' is invalid. Presentation has " + this.steps.length + " levels.");
            return;;
        }

        //create curtain
        curtain = document.createElement("div");
        curtain.className = "cicerone curtain";
        curtain.setAttribute("style", "z-index:" + Cicerone.settings["z-index"]);
        document.getElementsByTagName("body")[0].appendChild(curtain);
        setTimeout(function () { curtain.className += " open"; }, 1);

        //get default animation time from current css
        Cicerone.settings['transition-duration'] = (function () {
            var duration = curtain.css("transition-duration") || "1s", durationLength = duration.length;
            duration = (duration.slice(-2) === "ms") ? duration.slice(0, -2) : duration.slice(0, -1) * 1000;
            return duration;
        })();

        //start new step
        if (typeof from === "undefined") {
            from = 1;
        }
        this.makeStep(Math.ceil(from));

    }

    //makes step in presentation: backward or forward
    this.makeStep = function (step) {

        //if curtain doesn't exists, someone is trying to invoke ended presentation
        if (!curtain) {
            console && console.warn("The presentation has ended or was not initialized. Please invoke 'start' before using 'makeStep' function.");
            return;
        }

        //check if presentation should be continued
        index += Math.ceil(step);
        if (index < 0 || index + 1 > this.steps.length) { this.end(); return; }

        //delete old dialog if exsists and return cached styles
        resetElement();

        //set current element and save styles for backup
        current = document.querySelector(this.steps[index].selector);
        current.className += " cicerone presentation";
        styles = current.getAttribute("style") || "";

        //get all required styles for presentation
        var stringCss = styles;
        var css = (this.steps[index]["css"]) ? [this.steps[index]["css"]] : [];
        if (current.css("position") === "static") {
            css.push("position: relative;");
        }
        css.push("z-index: " + (Cicerone.settings["z-index"] + 1) + ";");

        //creating and adding presentation styles
        for (var i = 0; i < css.length; i++) {
            if (css[i].slice(-1) !== ";") {
                css[i] += ";";
            }
            stringCss += css[i];
        }
        current.setAttribute("style", stringCss);

        //adding dialog
        dialog = renderDialog();
        current.appendChild(dialog);
        current.scrollIntoView();

    }

    //ends the presentation and clears all elements
    this.end = function () {

        //if curtain exists, function does  not have to be invoked
        if (typeof curtain === "undefined") {
            console && console.warn("The presentation has ended or was not initialized. Use 'start' function to initialize new one.");
            return;
        }

        //fade out the curtain and after that delete all cicerone classes
        resetElement();
        curtain && (curtain.className = "cicerone curtain");
        setTimeout(function () {
            var toDelete = document.querySelectorAll(".cicerone");
            for (var i = 0; i < toDelete.length; i++) {
                toDelete[i].outerHTML = "";
            }
        }, Cicerone.settings['transition-duration']);

        //reseting variables
        curtain = undefined, index = -1, dialog = undefined, current = undefined, styles = undefined;

    }

    //private function that clears current presentation element and dialog
    var resetElement = function () {
        if (current) {
            current.style = styles;
            var tempClasses = current.getClasses();
            tempClasses.splice(tempClasses.indexOf("cicerone"), 1);
            tempClasses.splice(tempClasses.indexOf("presentation"), 1)
            current.setClasses(tempClasses);
        }
        dialog && (dialog.outerHTML = "");
    }

    //private function that renders a dialog
    var renderDialog = function () {

        //rendering body
        var rendered = document.createElement("div");
        rendered.className = "cicerone dialog placement-" + (self.steps[index]["placement"] ? self.steps[index]["placement"] : "left");

        //getting template from cache or retriving new one and rendering variables
        var template;
        (function (selector) {
            if (!templates[selector]) {
                templates[selector] = template = document.querySelector(self.steps[index]["template"]).innerHTML;
            } else {
                template = templates[selector]
            }
        })(templates[self.steps[index]["template"]])

        //inserting variables
        var variables = self.steps[index]["variables"];
        if (variables) {
            template = template.replace(/\s+(?=[^\{\{]*\}\})/g, "");
            var keys = Object.keys(variables);
            for (var i = 0; i < keys.length; i++) {
                template = template.replace("{{" + [keys[i]] + "}}", variables[keys[i]]);
            }
        }

        rendered.innerHTML = template;

        //adding listeners
        (function (selectors, args) {
            for (var i = 0; i < selectors.length; i++) {
                var elements = rendered.querySelectorAll("[cicerone-" + selectors[i] + "]");
                var arg = args[i];
                for (var j = 0; j < elements.length; j++) {
                    (function (step) {
                        elements[j].addEventListener("click", function () {
                            self.makeStep(step);
                        });
                    })(arg)
                }
            }
        })(['next', 'back', 'exit'], [1, -1, self.steps.length]);

        return rendered;
    }

}

//creating default static settings
Cicerone.settings = {
    "z-index": 20000,
}