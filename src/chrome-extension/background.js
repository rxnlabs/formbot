// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function() {
	'use strict';
	chrome.tabs.executeScript(null, {file: 'scripts/analytics.js'});
	chrome.tabs.executeScript(null, {file: 'scripts/fillForms.min.js'});
});

function loadValues() {
	'use strict';
	/* jshint ignore:start */
	include "utils.js"
	include "systemdefaults.js"
	include "defaulttypes.js"
	/* jshint ignore:end */

	//try to get the input value from the user defined values
	for (var i = 0; i < defaultType.length; i++) {
		var type = defaultType[i];
		var val = localStorage[type];
		
		//if not found in the local storage then set the system default value
		if (val === undefined) {
			localStorage[type] = getSystemDefault(type, 15);
		}
	}

}
loadValues();

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
			'use strict';
		    if (request.method === 'getInputValue') {

				//try to get the input value from the user defined values
				var val = localStorage[request.inputType];

				sendResponse({data: val});
		    }
		}
);