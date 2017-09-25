
jQuery(document).ready(function () {
    jQuery("#" + WPUAConstants.WIDGET_BODY_ID).ready(
      getDataFromServer(renderWidget)
  );
})

function commitAckChange(dataToCommit) {
  var articleId = document.getElementById(WPUAConstants.WIDGET_BODY_ID).getAttribute(WPUAConstants.ARTICLE_PARAMETER_NAME)
  var param = {}
  param[WPUAConstants.ARTICLE_PARAMETER_NAME] = articleId
  param[WPUAConstants.ARTICLE_DATA_FIELD_VALUE] = dataToCommit

  jQuery.ajax({
    type: "POST",
    url: WPUAConstants.RELATIVE_SITE_URL + "/wp-json/wpua/api/savePreferences",
    dataType: "json",
    data: param
  });
}

function getDataFromServer(callback) {
  var widgetBody = document.getElementById(WPUAConstants.WIDGET_BODY_ID)
  if(widgetBody == undefined) {
    return
  }

  var articleId = widgetBody.getAttribute(WPUAConstants.ARTICLE_PARAMETER_NAME)
  var loggedUser = WPUAConstants.LOGGED_USER
  var param = {};
  param[WPUAConstants.ARTICLE_PARAMETER_NAME] = articleId;
  param[WPUAConstants.LOGGED_USER_PARAMETER_NAME] = loggedUser;

  jQuery.ajax({
    type: "GET",
    url: WPUAConstants.RELATIVE_SITE_URL + "/wp-json/wpua/api/load_wpua_widget_data",
    dataType: "json",
    data: param,
    success: callback
  });
}

/**
 * Main entry render point.
 * Function which add columns and rows to root table element which stores the article-id; It makes a quey to server and load all
 * date wheich needs to render;
 */
function renderWidget(data, responseCode) {
  // this is the root <table></table> where all columns/ros should be attached
  var widgetBody = document.getElementById(WPUAConstants.WIDGET_BODY_ID)
  if (widgetBody == undefined) {
    // this trigger from other place than an article page
    return
  }

  var articleId = widgetBody.getAttribute(WPUAConstants.ARTICLE_PARAMETER_NAME)
  var allUsers = data[WPUAConstants.REST_WIDGET_RESULT_DATA_ALL_USERS_FIELD]
  var allVersions = data[WPUAConstants.REST_WIDGET_RESULT_DATA_ALL_ARTICLE_VERSIONS_FIELD]
  var recordedAcks = data[WPUAConstants.REST_WIDGET_RESULT_DATA_RECORDED_ACKS_FIELD]

  if (recordedAcks == undefined) {
    // this is the case of first usage of the widget
    recordedAcks = []
  }

  if (allVersions == undefined) {
    widgetBody.appendChild(createWarningContent())
  } else {
    widgetBody.appendChild(createAckTable(allVersions, allUsers, recordedAcks))
  }

}


function createAckTable(allVersions, allUsers, recordedAcks) {
  tableElement = document.createElement("table")
  jQuery(tableElement).addClass("table table-condensed")
  jQuery(tableElement).addClass("wpua_table_no_margin")

  tableElement.appendChild(createTableHeader(allUsers.map(function(serverUser) {
    return serverUser.display_name
  })))


  var tbody = document.createElement("tbody")
  tableElement.appendChild(tbody)

  // a versions look like ["v1.1.0", "2017-15-23"]. The first param is value, second is a small comment
  allVersions.forEach(function(version) {
    tr = createTableRow()
    // append first column cells (for Versions column)
    tr.appendChild(createVersionCell(version))
    allUsers.map(function(serverUser) {
      return serverUser.ID
    }).forEach(function(user) {
      tr.appendChild(createEditTableCell(version[0], user, recordedAcks))
    });
    tbody.appendChild(tr)
  });

  return tableElement
}

function createVersionCell(version) {
  td = document.createElement("td")
  td.innerHTML = version[0] + " <small>" + version[1] + "</small>"
  return td
}


/**
* Creates
*/
function createEditTableCell(version, user, data, ) {
  td = document.createElement("td")
  jQuery(td).addClass("wpua_center_table_cell")
  button = document.createElement("button")

  button.setAttribute("version", version);
  button.setAttribute("user", user);

  jQuery(button).addClass("btn-sm")
  // disable button when current  logged user is not admin or is different from current render user cell
  if (!(user == WPUAConstants.LOGGED_USER || WPUAConstants.IS_ADMIN_LOGGED_USER)) {
    jQuery(button).addClass("disabled")
  }
  tableButtonClickEventHandler(button, data)

  button.onclick = function() {
    tableButtonClickEventHandler(this)
  }

  td.appendChild(button)

  return td
}

function createTableRow() {
  return document.createElement("tr")
}


/**
* Create the table header.
*/
function createTableHeader(users) {
  var thead = document.createElement("thead");
  var versionsHead = document.createElement("th");
  versionsHead.innerHTML = "Versions";
  thead.appendChild(versionsHead)
  users.forEach(function(user) {
    userHead = document.createElement("th");
    userHead.innerHTML = user;
    thead.appendChild(userHead)
  });
  return thead;
}

/**
* Function that add or remove a user from given version. It also commit the change to server.
* recordedAcks is like : [{"version" : "v1.0.2", "ackUsers" : ["1"] }, {"version" : "v1.0.1", "ackUsers" : ["1", "2"]}]
*/ 
function toggleAckUserInData(version, user, recordedAcks) {
  var versionDataEntry;
  var foundIndex = -1
  if (recordedAcks != null) {
    recordedAcks.forEach(function(dataEntry) {
      if (version == dataEntry.version) {
        var userIndex = 0
        if (dataEntry.ackUsers != undefined) {
          dataEntry.ackUsers.forEach(function(ackUser) {
            if (ackUser == user) {
              foundIndex = userIndex
              return
            }
            userIndex++
          })
        }
        versionDataEntry = dataEntry;
        return
      }
    })
  } else {
    recordedAcks = []
  }

  // now lazy init data hierarchy
  if (versionDataEntry == undefined) {
    versionDataEntry = {
      "version": version,
      "ackUsers": []
    }
    recordedAcks.push(versionDataEntry)
  }

  if (versionDataEntry.ackUsers == undefined) {
    versionDataEntry.ackUsers = []
  }

  if (foundIndex != -1) {
    versionDataEntry.ackUsers.splice(foundIndex, 1)
  } else {
    versionDataEntry.ackUsers.push(user)
  }

  commitAckChange(recordedAcks)
  return recordedAcks
}

/**
* Method which scan recoredAcks and return true if an user is found in certain version as ack
* recordedAcks is like : [{"version" : "v1.0.2", "ackUsers" : ["1"] }, {"version" : "v1.0.1", "ackUsers" : ["1", "2"]}]
*/
function extractAckToggleValueFromData(version, user, recordedAcks) {
  // data entry is like : {"version" : "v1.0.2", "ackUsers" : ["1"] }
  var found = false;
  if (recordedAcks != undefined) {
    recordedAcks.forEach(function(dataEntry) {
      if (version == dataEntry.version) {
        if (dataEntry.ackUsers != undefined) {
          dataEntry.ackUsers.forEach(function(ackUser) {
            if (ackUser == user) {
              found = true
              return
            }
          })
        }
        // return when version is found
        return
      }
    })
  }

  return found
}

function changeTableButtonStyle(buttonElement, version, user, data) {
  if (!extractAckToggleValueFromData(version, user, data)) {
    jQuery(buttonElement).text('Not read');
    jQuery(buttonElement).addClass("btn-danger")
    jQuery(buttonElement).removeClass("btn-success")
  } else {
    jQuery(buttonElement).text('Read');
    jQuery(buttonElement).removeClass("btn-danger")
    jQuery(buttonElement).addClass("btn-success")
  }
}

function tableButtonClickEventHandler(buttonElement, recordedAcks) {
  version = buttonElement.getAttribute("version");
  user = buttonElement.getAttribute("user")

  if (recordedAcks != undefined) {
    changeTableButtonStyle(buttonElement, version, user, recordedAcks)
  } else {
    // if no recordedAcks were provided, then query get them from server
    getDataFromServer(function(data) {
      var recordedAcks = toggleAckUserInData(version, user, data[WPUAConstants.REST_WIDGET_RESULT_DATA_RECORDED_ACKS_FIELD])
      changeTableButtonStyle(buttonElement, version, user, recordedAcks)
    })
  }

}

/**
 * Create an alert which is shown when no versions are present in article
 */
function createWarningContent() {
  alert = document.createElement("div")
  jQuery(alert).addClass("alert alert-info")
  jQuery(alert).css('margin-bottom', '0px');
  alert.innerHTML = "No versions found for this article. Use custom field <code>wpua_article_versions</code> to declare them. (e.g.<code>[[\"v1.1.0\", \"2017-09-23\"], ...]</code>)";
  return alert
}