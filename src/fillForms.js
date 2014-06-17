function fillForms(){
	'use strict';
	
	/* jshint ignore:start */
    include "utils.js"

    include "defaultvalues.js"

    include "systemdefaults.js"

    //Everytime the fill forms script is executed, send an event to google analytics
    ga('create', 'UA-44998061-1', 'shanti2530.github.io', {'name': 'formFiller'});
    ga('formFiller.send', 'event', 'chrome-extension', location.host);
	/* jshint ignore:end */
	
    /*Checker text which the inputs should be matched to
        The values which are assigned have a priority. The first in the list
        has the most priority over the others in the list
    */
    var inputChecker = {

        checkText: function(text) {
            if (utils.isEmpty(text)){
                return;
            }

            var defaults = getDefaults();
            //loop through all the system defaults to check if the text provided could be found
            for (var d in defaults) {
                var contains = utils.contains(defaults[d].value.includes, text);
                //if we find something
                if (contains) {
                    //we need to make sure that the text provided is not in the excluded list
                    var excludedContains = utils.contains(defaults[d].value.excludes, text);

                   //if it is also in the excluded list we need to ignore it
                   //else if we did not find it in the excluded list .. then this is our type .. we are ready
                    if(!excludedContains) {
                        return defaults[d].name;
                    }
                }
            }
        },

        checkInput: function(input) {

            var defaultType;

            //check input id
            var inputId = input.id;
            if (inputId) {
                defaultType = this.checkText(inputId);
                if (!utils.isEmpty(defaultType)) {
                    ga('formFiller.send', 'event', 'input-type', defaultType, inputId);
                    return defaultType;
                }
            }

            //check input type
            var inputType = input.type;
            if (!utils.isEmpty(inputType)) {
                defaultType = this.checkText(inputType);
                if (!utils.isEmpty(defaultType)) {
                    ga('formFiller.send', 'event', 'input-type', defaultType, inputType);
                    return defaultType;
                }
            }

            //check input name
            var inputName = input.name;
            if (!utils.isEmpty(inputName)) {
                defaultType = this.checkText(inputName);
                if (!utils.isEmpty(defaultType)) {
                  ga('formFiller.send', 'event', 'input-type', defaultType, inputName);
                    return defaultType;
                }
            }

            //check input placeholder
            var inputPlaceholder = input.placeholder;
            if (!utils.isEmpty(inputPlaceholder)) {
                defaultType = this.checkText(inputPlaceholder);
                if (!utils.isEmpty(defaultType)) {
                    ga('formFiller.send', 'event', 'input-type', defaultType, inputPlaceholder);
                    return defaultType;
                }
            }

            //Check input label
            if (!utils.isEmpty(inputId)) {
                var labels = document.getElementsByTagName('LABEL');
                for (var i = 0; i < labels.length; i++) {
                    if (!utils.isEmpty(labels[i].htmlFor) && labels[i].htmlFor === inputId) {
                      var labelText = labels[i].innerHTML;
                        defaultType = this.checkText(labelText);
                        if (!utils.isEmpty(defaultType)) {
                            ga('formFiller.send', 'event', 'input-type', defaultType, labelText);
                            return defaultType;
                        }
                    }
                }
            }

            //if we are here then we were unable to match an input with a type then always default to text
            defaultType = 'TEXT';
            ga('formFiller.send', 'event', 'input-type', defaultType, inputId +
              '|' + inputType + '|' + inputName + '|' + inputPlaceholder);
            return defaultType;
        }
    };

    /*A function that given an array of input elements would fill them up
    with the respective values*/
    var processInputElements = function(inputs) {

        for(var i = 0; i < inputs.length; i++) {
            var input = inputs[i];

            if (input.type === 'radio' || input.type === 'hidden' || input.type === 'button' ||
                input.type === 'submit' || input.type === 'file') {
                /*hidden inputs should not be altered .. they are hidden for a reason*/
                /*radio buttons are handled separately in the function processRadioButtonGroupElements*/
                /*buttons/submit inputs could not be prefilled therefore we skip them*/
                /*file input types could not be prefilled, therefore we do not try to process them*/
            } else if (input.type === 'checkbox') {
                /*tick all checkboxes bottons found*/
                input.checked = true;
            } else if (input.value && input.value.length > 0) {
                /*we do not alter the value in the text box if it is not empty*/
            } else {
                var inputCheckerResult = inputChecker.checkInput(input);

                /**Checking for the max length that is allowed by this input
                 if not defined the value is very large and therefore we do not want to use it **/
                var maxLength = 7;

                if (input.maxLength && input.maxLength < 7) {
                    maxLength = input.maxLength;
                }

                input.value = getDefaultValue(inputCheckerResult, maxLength, input);
            }
            
        }
    };

    /*A function which processes groups of radio buttons,
      the reason to treating radio buttons seperately from other inputs
      is that we have to take care that only one radio button is selected per group
      and that if one is already selected, then we do not chnage the group*/
    var processRadioButtonGroupElements = function(radios) {
        for (var i = 0; i < radios.length; i++) {
            //get the radio group name 
            var group = radios[i].name;
            
            //check if for this specific group there is no radio button checked already
            var groupRadios = document.querySelectorAll('input[name=' + group + ']:checked');
            
            //if one is already checked .. then skip this radio button
            //else check it
            if (groupRadios.length < 1) {
                radios[i].checked = true;
                //before we assign a value to the input lets send an event to google analytics
                //with the type of input we are filling up
                //this will help with understanding what types of fields are being used
                ga('formFiller.send', 'event', 'input-type', 'RADIO');
            }
        }
    };
    
    /*function which given an array of selects would choose a random option*/
    var processSelectElements = function(selects) {
        for(var i = 0; i < selects.length; i++){
            var dd = selects[i];
            
            //get a random valid option
            var allValidOptions = dd.querySelectorAll('option[value]:not([value=""])');
            dd.selectedIndex = allValidOptions[Math.floor(Math.random() * allValidOptions.length)].index;
            
            // Triggers the change event
            dd.dispatchEvent(new Event('change'));

            //before we assign a value to the input lets send an event to google analytics
            //with the type of input we are filling up
            //this will help with understanding what types of fields are being used
            ga('formFiller.send', 'event', 'input-type', 'SELECT');
        }
    };
    
    /*function which given an array of text areas would insert random text*/
    var processTextAreaElements = function(textAreas) {
        for (var i = 0; i < textAreas.length; i++) {
            var txtArea = textAreas[i];
            txtArea.value = utils.randomText(20);

            //before we assign a value to the input lets send an event to google analytics
            //with the type of input we are filling up
            //this will help with understanding what types of fields are being used
            ga('formFiller.send', 'event', 'input-type', 'TEXTAREA');
        }
    };
    
    /*lookup for the form elements to fill*/
    processRadioButtonGroupElements(document.querySelectorAll('input[type=radio]:not([disabled])'));
    processInputElements(document.querySelectorAll('input:not([disabled]):not([type="radio"])'));
    processSelectElements(document.querySelectorAll('select:not([disabled])'));
    processTextAreaElements(document.querySelectorAll('textarea:not([disabled])'));
}
fillForms();