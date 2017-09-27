var selectorsToBeRemoved = ["#main > div.well.author-meta", "#main > p.hidden-xs", "#main > article> footer"];

function removeElems() {
	// itterate through selectors array an remove them from DOM
	selectorsToBeRemoved.forEach(function(selector) {
		jQuery(selector).remove();
	});	
}

// a map with some plus functionality
var ExtendedMap = function() {	};

// return the value from the `n`-th entry, given that the entries are sorted by their keys
ExtendedMap.prototype.valueAtIndex = function(n) {
	return this[Object.keys(this).sort()[n]];
}

// return the key from the `n`-th entry given that the entries are sorted by their keys
ExtendedMap.prototype.keyAtIndex = function(n) {
	return Object.keys(this).sort()[n];
}

// returns number of entries in the map
ExtendedMap.prototype.length = function() {
	return Object.keys(this).length;
}

//Finds y value of given object
//source: http://stackoverflow.com/a/11986153/3093041
function findPos(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        do {
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    return [curtop];
    }
}

// knows how to navigate to the next element with the same class "new-v*" as the current `element`
function goToNext(element) {
	// jQuery selector - by specific class new-v*
	var classSelector = jQuery("." + element.parentElement.classList[2].replace('.', "\\."));
	var indexOfEnclosingSpan = classSelector.index(jQuery(element.parentElement));
	// retrieve next span element with specific class
	var nextElement = classSelector.slice(indexOfEnclosingSpan+1).first();
	
	// remove previous id attribute from span elements identifiable by "next" id
	jQuery('span#next').removeAttr('id');
	
	// add `next` id to the next element that we have to navigate to
	// if there is no such element, then it navigates to the  first
	if (nextElement.length == 0) {
		classSelector.first().attr("id", "next");
	} else {
		nextElement.attr("id", "next");
	}
	
	var elementPos = findPos(document.getElementById("next")) - (screen.height/30);
	window.scroll(0, elementPos);
}

function labelManage() {
	// retrieve the content of the article
	var textToSearch = jQuery('article').children('.entry-content')[0].innerHTML;
	
	// find versions declaration like versions = [v2 - 2016-10-05, v3-2017-01-05,  v4-2017-01-05]	
	var versionsArrayRegexp = /versions\s*=\s*\[(.*?)\]/g;
	var versionsArrayMatch = versionsArrayRegexp.exec(textToSearch);
	
	// do not go further if versions declaration is not found
	if(versionsArrayMatch == null) return;
	
	// get the text between square brackets
	var versionsSplittedByComma = versionsArrayMatch[1];
	
	// put each version into an array by splitting after comma
	var versionsArray = versionsSplittedByComma.split(',');
	
	// do not go further if no versions declaration were found inside inside
	if (versionsArray.length == 0) return;
	
	// dictionary that will store the versions and their corresponding index of version
	// eg: for versions = [v6 - 2016-10-05, v4 - 2017-01-05,  v0.5- 2017-01-05]
	// versionsOrderedMap =  [4: "v4 - 2017-01-05", 0.5: "v5- 2017-01-05", 6: "v6 - 2016-10-05"]

	var versionsOrderedMap = new ExtendedMap();
	
	versionsArray.forEach(function(versionDeclaration){
		// some versions might be declared with en dash('\u2013') instead of `-` character
		versionDeclaration = versionDeclaration.replace('\u2013', '-');
		// will match for example v0.5 -2018-04-07
		var versionRegexp = /v(.*?)\s*-\s*.*/g;
		var versionMatch = versionRegexp.exec(versionDeclaration.trim());
		// e.g: for v6 - 2016-10-05, stringVersion = 6
		var stringVersion = versionMatch[1];
		// put the version declaration string at its stringVersion key
		// e.g: for v0.6 - 2016-10-05 will store  the followting entry 0.6: 2016-10-05  inside `versionsOrderedMap`
		versionsOrderedMap[stringVersion] = versionDeclaration.trim();
	})
	
	// obtain the last and the penultimate version and also their complete declaration		
	// e.g: lastVersion
	var lastVersion = versionsOrderedMap.keyAtIndex(versionsOrderedMap.length() - 1);
	var penultimateVersion =  versionsOrderedMap.keyAtIndex(versionsOrderedMap.length() - 2);
	
	var ultimateVersionDeclaration =  versionsOrderedMap[lastVersion];
	var penultimateVersionDeclaration =  versionsOrderedMap[penultimateVersion];
	
	// string that will retain the progressive replacement of the versions declarations with nice bootstrap spans
	var replaced;
	
	var anchorHTML = ' (<a style="color: white;  text-decoration: underline; cursor: pointer" onclick="goToNext(this)">go to next</a>)';
	// two versions
	if (ultimateVersionDeclaration != undefined && penultimateVersionDeclaration != undefined) {
	
		replaced = textToSearch.replace(versionsArrayMatch[0], '<span class="label label-danger new-v' + lastVersion + '">'  + ultimateVersionDeclaration + anchorHTML + "</span>" + 
										' <span class="label label-warning new-v' + penultimateVersion +  '">' + penultimateVersionDeclaration + anchorHTML + "</span>" );

		// search for possible NEW v<index> through the content
		// where index is the last version or the penultimate version index, replace with spans
		var newVRegexp = new RegExp("NEW v(" + lastVersion + ")", "g");
		replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-danger new-v$1">NEW v$1' + anchorHTML + '</span>');
		// here, we used a small hack because, for example, for a string penultimateVersion = v3 and lastVersion = v3.1, strings containing v3.1
		// would be overwritten by the regex above
		newVRegexp = new RegExp("NEW v(" + (penultimateVersion)+ ")(?!\\.)", "g");
		replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-warning new-v$1">NEW v$1' + anchorHTML + '</span>');
		
		// where index is different from (negative lookahead) last version or penultimateVersion, replace with a discrete span containing version number (v$2)s
		newVRegexp = new RegExp('(NEW v((?!' + lastVersion + '|' + penultimateVersion + ').*?))\\s+', "g");
		replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-default">v$2</span> ');
	
	// only one version									
	} else if (ultimateVersionDeclaration != undefined) {
		replaced = textToSearch.replace(versionsArrayMatch[0], '<span class="label label-danger new-v' + lastVersion + '">' + ultimateVersionDeclaration +  anchorHTML + "</span>");

		// search for possible NEW v<index> through the content
		
		// where index is the last version index, replace with spans
		var newVRegexp = new RegExp("NEW v(" + lastVersion + ")", "g");
		replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-danger new-v$1">NEW v$1' + anchorHTML + '</span>');		

		// where index is different from (negative lookahead) last version, replace with a discrete span containing version number (v$2)
		newVRegexp = new RegExp('(NEW v((?!' + lastVersion  + ').*?))\\s+', "g");
		replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-default">v$2</span> ');
	
	// when versions declaration did not respect the versionRegexp pattern	
	} else {
		return;
	}			
	// finally replace the actual content with the processed one
	jQuery('article').children('.entry-content').html(replaced);	
}

jQuery(document).ready(function () {
	Wpua_Hook.register("render_side_widget_version_cell_content", (version) => {
	    // TODO Anca return something usefull to attach in side widget version cells
	})
	removeElems();
	labelManage();
});


