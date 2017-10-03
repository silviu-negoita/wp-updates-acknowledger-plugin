jQuery(document).ready(function () {
    jQuery("#" + WPUAConstants.WIDGET_BODY_ID).ready(
      get_data_from_server(render_widget)
  );
})

function commit_ack_change(dataToCommit) {
  var params = {}
  params[WPUAConstants.ARTICLE_DATA_FIELD_VALUE] = dataToCommit
  make_server_request("POST", "/wp-json/wpua/api/savePreferences", params)
}

function get_data_from_server(callback) {
  make_server_request("GET",  "/wp-json/wpua/api/load_wpua_widget_data", {}, callback);
}

/**
 * Main entry render point.
 * Function which add columns and rows to root table element which stores the article-id; It makes a quey to server and load all
 * date wheich needs to render;
 */
function render_widget(data, responseCode) {
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
    widgetBody.appendChild(create_warning_content())
  } else {
    widgetBody.appendChild(create_ack_table(allVersions, allUsers, recordedAcks))
  }

}


function create_ack_table(allVersions, allUsers, recordedAcks) {
  tableElement = document.createElement("table")
  jQuery(tableElement).addClass("table table-condensed")
  jQuery(tableElement).addClass("wpua_table_no_margin")

  tableElement.appendChild(create_table_header(allUsers.map(function(serverUser) {
    return serverUser.display_name
  })))


  var tbody = document.createElement("tbody")
  tableElement.appendChild(tbody)

  // a versions look like ["v1.1.0", "2017-15-23"]. The first param is value, second is a small comment
  let version_index = 0
  allVersions.forEach(function(version) {
    tr = create_table_row()
    // append first column cells (for Versions column)
    tr.appendChild(create_version_cell(version, version_index))
    allUsers.map(function(serverUser) {
      return serverUser.ID
    }).forEach(function(user) {
      tr.appendChild(create_edit_table_cell(version[0], user, recordedAcks))
    });
    tbody.appendChild(tr)
    version_index++
  });

  return tableElement
}

function create_version_cell(version, version_index) {
  td = document.createElement("td")
  jQuery(td).addClass("wpua_centered_cell_content");
  
  version_cell_content = Wpua_Hook.call('render_side_widget_version_cell_content', [version, version_index]);

  if(version_cell_content != undefined) {
    if (typeof version_cell_content == "object") {
      // we ssume that if it is object, it is dom element
      td.appendChild(version_cell_content)
    } else {
      td.innerHTML = version_cell_content
    }
  } else {
    // the default behavior
     td.innerHTML = version[0] + " <small>" + version[1] + "</small>"
  }
 
  return td
}


/**
* Creates
*/
function create_edit_table_cell(version, user, data, ) {
  td = document.createElement("td")
  jQuery(td).addClass("wpua_centered_cell_content")
  button = document.createElement("button")

  button.setAttribute("version", version);
  button.setAttribute("user", user);

  jQuery(button).addClass("btn-sm")
  // disable button when current  logged user is not admin or is different from current render user cell
  if (!(user == WPUAConstants.LOGGED_USER || WPUAConstants.IS_ADMIN_LOGGED_USER)) {
    jQuery(button).addClass("disabled")
  }
  table_button_click_event_handler(button, data)

  button.onclick = function() {
    table_button_click_event_handler(this)
  }

  td.appendChild(button)

  return td
}

function create_table_row() {
  return document.createElement("tr")
}

/**
* Create the table header.
*/
function create_table_header(users) {
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
function toggle_ack_user_in_data(version, user, recordedAcks) {
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

  commit_ack_change(recordedAcks)
  return recordedAcks
}

/**
* Method which scan recoredAcks and return true if an user is found in certain version as ack
* recordedAcks is like : [{"version" : "v1.0.2", "ackUsers" : ["1"] }, {"version" : "v1.0.1", "ackUsers" : ["1", "2"]}]
*/
function extract_ack_toggle_value_from_data(version, user, recordedAcks) {
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

function change_table_button_style(buttonElement, version, user, data) {
  if (!extract_ack_toggle_value_from_data(version, user, data)) {
    jQuery(buttonElement).text('Not read');
    jQuery(buttonElement).addClass("btn-danger")
    jQuery(buttonElement).removeClass("btn-success")
  } else {
    jQuery(buttonElement).text('Read');
    jQuery(buttonElement).removeClass("btn-danger")
    jQuery(buttonElement).addClass("btn-success")
  }
}

function table_button_click_event_handler(buttonElement, recordedAcks) {
  version = buttonElement.getAttribute("version");
  user = buttonElement.getAttribute("user")

  if (recordedAcks != undefined) {
    change_table_button_style(buttonElement, version, user, recordedAcks)
  } else {
    // if no recordedAcks were provided, then query get them from server
    get_data_from_server(function(data) {
      var recordedAcks = toggle_ack_user_in_data(version, user, data[WPUAConstants.REST_WIDGET_RESULT_DATA_RECORDED_ACKS_FIELD])
      change_table_button_style(buttonElement, version, user, recordedAcks)
    })
  }
}

/**
 * Create an alert which is shown when no versions are present in article
 */
function create_warning_content() {
  alert = document.createElement("div")
  jQuery(alert).addClass("alert alert-info")
  jQuery(alert).css('margin-bottom', '0px');
  let now = new Date();
  let day = ("0" + now.getDate()).slice(-2);
  let month = ("0" + (now.getMonth() + 1)).slice(-2);
  let today = now.getFullYear() + "-" + (month) + "-" + (day);
  alert.innerHTML = "No versions found for this article. Use custom field <code>wpua_article_versions</code> to declare them. e.g.<p><code>[[\"v1.0\", \"" + today +"\"]]</code></p>";
  return alert
}