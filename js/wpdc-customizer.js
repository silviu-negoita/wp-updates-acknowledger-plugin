var selectorsToBeRemoved = ["#main > div.well.author-meta", "#main > p.hidden-xs", "#main > article> footer"];

function removeElems() {
	// itterate through selectors array an remove them from DOM
	selectorsToBeRemoved.forEach(function(selector) {
		jQuery(selector).remove();
	});
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
function goToNext(element, withParent) {
	// jQuery selector - by specific class new-v*
	var classAttr = withParent ? element.parentElement.classList[2] : element.classList[2];
	var classSelector = jQuery("." + classAttr.replace(/\./g, "\\."));
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
    var versionArray = [];
    make_server_request("GET", "/wp-json/wpua/api/getArticleVersions", {}, function(response) {
		// obtain versions as an array of arrays, e.g: [["v1.1.1", "2017-15-26"], ["v1.2.1", "2017-15-25"], ["v1.3.2", "2017-15-25"]]
		// they come ordered from server
        versionsArray = response.restWidgetResultDataAllArticleVersionsField;
        if (versionsArray.length == 0) return;

        // obtain the last and the penultimate version number
        // e.g: for v6, stringVersion = 6
        var versionRegexp1 = /v(.*)/g;
        var latestVersionMatch1 = versionRegexp1.exec(versionsArray[0][0]);
		var latestStringVersion1 = latestVersionMatch1[1];
		var versionRegexp2 = /v(.*)/g;
        var latestVersionMatch2 = versionRegexp2.exec(versionsArray[1][0]);
        // e.g: for v6, stringVersion = 6
        var latestStringVersion2 = latestVersionMatch2[1];

        // string that will retain the progressive replacement of the versions declarations with nice bootstrap spans
        var replaced = textToSearch;

        var anchorHTML = ' (<a style="color: white;  text-decoration: underline; cursor: pointer" onclick="goToNext(this, true)">go to next</a>)';
        // two versions
        if (latestStringVersion1 != undefined && latestStringVersion2 != undefined) {
            // search for possible NEW v<index> through the content
            // where index is the last version or the penultimate version index, replace with spans
            var newVRegexp = new RegExp("NEW v(" + latestStringVersion1 + ")", "g");
            replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-danger new-v$1">NEW v$1' + anchorHTML + '</span>');
            // here, we used a small hack because, for example, for a string penultimateVersion = v3 and lastVersion = v3.1, strings containing v3.1
            // would be overwritten by the regex above
            newVRegexp = new RegExp("NEW v(" + (latestStringVersion2) + ")(?!\\.)", "g");
            replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-warning new-v$1">NEW v$1' + anchorHTML + '</span>');

            // where index is different from (negative lookahead) last version or penultimateVersion, replace with a discrete span containing version number (v$2)s
            newVRegexp = new RegExp('(NEW v((?!' + latestStringVersion1 + '|' + latestStringVersion2 + ').*?))\\s+', "g");
            replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-default new-v$2">v$2' + anchorHTML + '</span> ');

            // only one version									
        } else if (latestStringVersion1 != undefined) {

            // search for possible NEW v<index> through the content

            // where index is the last version index, replace with spans
            var newVRegexp = new RegExp("NEW v(" + latestStringVersion1 + ")", "g");
            replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-danger new-v$1">NEW v$1' + anchorHTML + '</span>');

            // where index is different from (negative lookahead) last version, replace with a discrete span containing version number (v$2)
            newVRegexp = new RegExp('(NEW v((?!' + latestStringVersion1 + ').*?))\\s+', "g");
            replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-default new-v$2">v$2' + anchorHTML + '</span> ');

            // when versions declaration did not respect the versionRegexp pattern	
        } else {
            return;
        }
        // finally replace the actual content with the processed one
        jQuery('article').children('.entry-content').html(replaced);
    });
}

jQuery(document).ready(function () {
	// renders version spans in the side table widget
	Wpua_Hook.register("render_side_widget_version_cell_content", (version) => {
		span = document.createElement("span");
		// matches color according to the the degree of novelty (red for latest, orange for before latest, grey for elder)
		if (version[1] == 0) {
			span.setAttribute("class", "label label-danger new-" + version[0][0]);
		} else if (version[1] == 1) {
			span.setAttribute("class", "label label-warning new-" + version[0][0]);
		} else {
			span.setAttribute("class", "label label-default new-" + version[0][0]);
		}
		span.setAttribute("style", "font-size: 80%; cursor: pointer; padding-top: 4%; padding-bottom: 3%; font-weight: bold");
		span.innerHTML = version[0][0] + " - " + version[0][1];
		span.setAttribute("onclick", "goToNext(this, false)");
		return span;
	});
	removeElems();
	labelManage();
});


