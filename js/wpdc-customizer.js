var selectorsToBeRemoved = ["#main > div.well.author-meta", "#main > p.hidden-xs", "#main > article> footer"];
var versionsArray = [];

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
	element = withParent ? element.parentElement : element;
	var classString = element.classList[2];
	var classSelector = jQuery("." + classString.replace(/\./g, "\\."));
	var indexOfEnclosingSpan = classSelector.index(jQuery(element));
	// retrieve next span element with specific class
	var nextElement = classSelector.slice(indexOfEnclosingSpan+1).first();
	
	// remove previous id attribute from span elements identifiable by "next" id
	jQuery('span#next').removeAttr('id');
	
	// add `next` id to the next element that we have to navigate to
	// if there is no such element, then it navigates to the first
	if (nextElement.length == 0) {
		classSelector.first().attr("id", "next");
	} else {
		nextElement.attr("id", "next");
	}
	
	// in case we have at least one element in the document and one in the side widget
	// the element from the side widget is always on the last position in our classSelector
	// since the user starts navigating from it, in the interface, we consider the last element, actually, the penultimate (classSelector.length - 2)
	var completeVersionInfo = getVersionInfo(classString.replace("new-", ""));
	if (classSelector.length >= 2 && indexOfEnclosingSpan ==  classSelector.length - 2) {
		showBSModal({
			title: "Reached the last change tag for " + completeVersionInfo,
			body: "Do you want to restart from the first change tag?",
			size: "small",
			actions: [
				{
					label: 'Confirm',
					cssClass: 'btn-success',
					onClick: function(e) {
						jQuery(e.target).parents('.modal').modal('hide');
						var elementPos = findPos(classSelector[0]) - (screen.height/30);
						window.scroll(0, elementPos);
					}
				},
				{
					label: 'Cancel',
					cssClass: 'btn-danger',
					onClick: function(e){
						jQuery(e.target).parents('.modal').modal('hide');
					}
				}
			]
		});
	// in case only the element in the side widget has the specific class
	} else if (classSelector.length == 1) {
		showBSModal({
			title: completeVersionInfo,
			body: "There are no change tags in the document.",
			size: "small",
		});
	}
	else {
		var elementPos = findPos(document.getElementById("next")) - (screen.height/30);
		window.scroll(0, elementPos);
	}
}

function getVersionInfo(versionString) {
	var versionCompleteInfo = "";
	versionsArray.forEach(function(version) {
		if (versionString == version[0]) {
			versionCompleteInfo = versionString + " - " + version[1];
		}
	});
	return versionCompleteInfo;
}

function labelManage() {
    // retrieve the content of the article
    var textToSearch = jQuery('article').children('.entry-content')[0].innerHTML;
    
    make_server_request("GET", "get_article_versions", {}, function(response) {
		// obtain versions as an array of arrays, e.g: [["v1.1.1", "2017-15-26"], ["v1.2.1", "2017-15-25"], ["v1.3.2", "2017-15-25"]]
		// they come ordered from server
        versionsArray = response.restWidgetResultDataAllArticleVersionsField;
        if (versionsArray == undefined || versionsArray.length == 0) return;

        // obtain the last and the penultimate version number
        // e.g: for v6, stringVersion = 6
        var versionRegexp1 = /v(.*)/g;
        var latestVersionMatch1 = versionRegexp1.exec(versionsArray[0][0]);
		var latestStringVersion1 = latestVersionMatch1[1];


        // string that will retain the progressive replacement of the versions declarations with nice bootstrap spans
        var replaced = textToSearch;

        var anchorHTML = ' (<a style="color: white; text-decoration: underline; cursor: pointer" onclick="goToNext(this, true)">go to next</a>)';
        // two versions
        if (latestStringVersion1 != undefined && versionsArray.length > 1) {
			var versionRegexp2 = /v(.*)/g;
			var latestVersionMatch2 = versionRegexp2.exec(versionsArray[1][0]);
			// e.g: for v6, stringVersion = 6
			var latestStringVersion2 = latestVersionMatch2[1];
		
            // search for possible NEW v<index> through the content
            // where index is the last version or the penultimate version index, replace with spans
            var newVRegexp = new RegExp("NEW v(" + latestStringVersion1 + ")", "g");
            replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-danger new-v$1">NEW v$1' + anchorHTML + '</span>');
            // here, we used a small hack because, for example, for a string penultimateVersion = v3 and lastVersion = v3.1, strings containing v3.1
            // would be overwritten by the regex above
            newVRegexp = new RegExp("NEW v(" + (latestStringVersion2) + ")(?!\\.)", "g");
            replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-warning new-v$1">NEW v$1' + anchorHTML + '</span>');

            // where index is different from (negative lookahead) last version or penultimateVersion, replace with a discrete span containing version number (v$2)
			// another small hack: sometimes we find in text strings like this <p>NEW v4.2></p> and we do not have to take into our capture group "</p>"
            newVRegexp = new RegExp('(NEW v((?!' + latestStringVersion1 + '|' + latestStringVersion2 + ').*?)(<\/p>)?)\\s+', "g");
            replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-default new-v$2">v$2' + anchorHTML + '</span> ');

            // only one version									
        } else if (latestStringVersion1 != undefined) {

            // search for possible NEW v<index> through the content

            // where index is the last version index, replace with spans
            var newVRegexp = new RegExp("NEW v(" + latestStringVersion1 + ")", "g");
            replaced = replaced.replace(newVRegexp, '<span style="font-size: x-small" class="label label-danger new-v$1">NEW v$1' + anchorHTML + '</span>');

            // where index is different from (negative lookahead) last version, replace with a discrete span containing version number (v$2)
			// another small hack: sometimes we find in text strings like this <p>NEW v4.2></p> and we do not have to take into our capture group "</p>"
            newVRegexp = new RegExp('(NEW v((?!' + latestStringVersion1 + ').*?)(<\/p>)?)\\s+', "g");
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

// source: https://raw.githubusercontent.com/mohdovais/utilities/master/bootstrap.model.wrapper.js
window.showBSModal = function self(options) {

    var options = jQuery.extend({
            title : '',
            body : '',
            remote : false,
            backdrop : 'static',
            size : false,
            onShow : false,
            onHide : false,
            actions : false
        }, options);

    self.onShow = typeof options.onShow == 'function' ? options.onShow : function () {};
    self.onHide = typeof options.onHide == 'function' ? options.onHide : function () {};

    if (self.$modal == undefined) {
        self.$modal = jQuery('<div class="modal fade"><div class="modal-dialog"><div class="modal-content"></div></div></div>').appendTo('body');
        self.$modal.on('shown.bs.modal', function (e) {
            self.onShow.call(this, e);
        });
        self.$modal.on('hidden.bs.modal', function (e) {
            self.onHide.call(this, e);
        });
    }

    var modalClass = {
        small : "modal-sm",
        large : "modal-lg"
    };

    self.$modal.data('bs.modal', false);
    self.$modal.find('.modal-dialog').removeClass().addClass('modal-dialog ' + (modalClass[options.size] || ''));
    self.$modal.find('.modal-content').html('<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">jQuery{title}</h4></div><div class="modal-body">jQuery{body}</div><div class="modal-footer"></div>'.replace('jQuery{title}', options.title).replace('jQuery{body}', options.body));

    var footer = self.$modal.find('.modal-footer');
    if (Object.prototype.toString.call(options.actions) == "[object Array]") {
        for (var i = 0, l = options.actions.length; i < l; i++) {
            options.actions[i].onClick = typeof options.actions[i].onClick == 'function' ? options.actions[i].onClick : function () {};
            jQuery('<button type="button" class="btn ' + (options.actions[i].cssClass || '') + '">' + (options.actions[i].label || '{Label Missing!}') + '</button>').appendTo(footer).on('click', options.actions[i].onClick);
        }
    } else {
        jQuery('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>').appendTo(footer);
    }

    self.$modal.modal(options);
}