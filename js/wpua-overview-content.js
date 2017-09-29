// Declare constants

const overview_table_id = "wpua-table-element"
const overview_table_id_selector = "#" + overview_table_id
const category_expaned_class = "fa-folder-open-o"
const category_collapsed_class = "fa-folder-o"


jQuery(document).ready(() => {
  jQuery("#" + WPUAConstants.WPUA_OVERVIEW_PAGE_CONTAINER_ID).ready(() => {
    let rootElement = jQuery("#" + WPUAConstants.WPUA_OVERVIEW_PAGE_CONTAINER_ID).get(0)
    if (rootElement == undefined) {
      return
    }

    rootElement.innerHTML = "<h1> <i class=\"fa fa-spin fa-spinner\" aria-hidden=\"true\"></i> Loading data ... </h1>"
    get_overview_data(render_overview_content)
    remove_unused_dom_content()
  });
})

/*
* This method is used to remove some content from regular post page to transform it in a root page
* e.g. we remove the sidebar, the meta info etc
*/
function remove_unused_dom_content() {
  jQuery("#primary").removeClass("col-md-8")
  jQuery("#primary").addClass("col-md-12")
  jQuery("#secondary").remove()
  jQuery(".entry-meta").remove()
  jQuery("#breadcrumbs").remove()
}

function get_overview_data(callback) {
  make_server_request("GET", "/wp-json/wpua/api/getOverviewData", {}, callback)
}

/*
 * Entry point for rendering UA Overview Page content.
 */
function render_overview_content(result) {
  let rootElement = jQuery("#" + WPUAConstants.WPUA_OVERVIEW_PAGE_CONTAINER_ID).get(0)
  // empty the root element content 
  jQuery(rootElement).empty()
  // attach collapse/expand buttons
  let expand = document.createElement("button")
  jQuery(expand).addClass("btn btn-sm btn-primary")
  expand.innerHTML = "<i class=\"fa fa-plus\"></i> Expand all articles"
  jQuery(expand).click(on_expand_all_articles_click_event_handler)
  rootElement.appendChild(expand)

  let collapse = document.createElement("button")
  jQuery(collapse).addClass("btn btn-sm btn-success")
  jQuery(collapse).css("margin-left", "5px")
  jQuery(collapse).click(on_collapse_to_categoriesArticleClickEventHandler)
  collapse.innerHTML = "<i class=\"fa fa-minus\"></i>  Collapse to categories"
  rootElement.appendChild(collapse)


  // attach the table
  var table_wrapper = document.createElement("div")
  jQuery(table_wrapper).addClass("table-responsive wpua_overview_container")
  table_wrapper.appendChild(create_overview_table(result));
  rootElement.appendChild(table_wrapper)

  // now remove the sidebar and make the content wider


  // activate fixed header on table
  jQuery(overview_table_id_selector).floatThead({
    scrollContainer: ($table) => {
      return jQuery(table_wrapper)
    }
  });
}

function create_overview_table(data) {
  let categories_and_articles = data[WPUAConstants.REST_OVERVIEW_PAGE_RESULT_CATEGORIES_FIELD]
  let all_users = data[WPUAConstants.REST_WIDGET_RESULT_DATA_ALL_USERS_FIELD]
  tableElement = document.createElement("table");
  jQuery(tableElement).attr("id", overview_table_id)
  jQuery(tableElement).addClass("table table-hover")

  // append table header
  tableElement.appendChild(create_overview_table_header(all_users))
  // append table content
  let tbody = document.createElement("tbody")
  tableElement.appendChild(tbody)

  categories_and_articles.forEach((category) => {
    // apeend the category row
    tbody.appendChild(create_overview_table_category_row(category, all_users))
    if (category.hasOwnProperty('articles')) {
      // append articles for this category
      category['articles'].forEach((article) => {
        tbody.appendChild(create_overview_table_article_row(article, all_users, category['nesting_level'] + 1))
      })
    }
  })

  return tableElement;
}

function create_overview_table_category_row(category, all_users) {
  let nesting_level = category['nesting_level']
  let tr = document.createElement("tr")
  jQuery(tr).attr("category_id", category['cat_ID'])
  jQuery(tr).attr("category_parent", category['category_parent'])
  jQuery(tr).addClass("is-category")
  
  // create first column
  tr.appendChild(create_overview_table_category_cell(category['name'], nesting_level))
  jQuery(tr).attr("level", nesting_level)
  // now append empty columns
  for (var i = 0; i < all_users.length + 1; i++) {
    tr.appendChild(document.createElement("td"));
  }
  return tr
}

function create_overview_table_category_cell(category_name, nesting_level) {
  let td = document.createElement("td")
  let wrapper = document.createElement("div")
  jQuery(wrapper).css('margin-left', (nesting_level * 10) + 'px');
  jQuery(wrapper).css('width', '400px');

  jQuery(wrapper).click(on_category_icon_click_event_handler)
  jQuery(wrapper).css("cursor", "pointer")

  td.appendChild(wrapper);

  let icon = document.createElement("i")
  jQuery(icon).addClass("fa " + category_expaned_class)
  
  wrapper.appendChild(icon)


  text = document.createElement("span")
  text.innerHTML = "<strong> " + category_name + "</strong>"
  wrapper.appendChild(text)

  return td
}


function create_overview_table_article_row(article, all_users, nesting_level) {
  let tr = document.createElement("tr")
  jQuery(tr).attr("level", nesting_level)
  jQuery(tr).addClass("is-article")
  jQuery(tr).attr("category_parent", article['category_parent'])
  // first column, with article name
  tr.appendChild(create_overview_table_article_name_cell(article, nesting_level))

  let last_version = undefined

  // second column, with last version
  if (article['all_versions'] != undefined) {
    last_version = article['all_versions'][0]
    tr.appendChild(create_version_label(last_version[0], "label-success"))
  } else {
    td = document.createElement("td")
    td.innerHTML = "N/A"
    tr.appendChild(create_version_label("N/A", "label-warning"))
  }

  all_users.forEach((user) => {
    tr.appendChild(create_overview_table_user_column_cell(article['wpua_recorded_acks'], user, last_version));
  })

  return tr
}

function create_version_label(version, clazz) {
  td = document.createElement('td')
  jQuery(td).addClass("wpua_centered_cell_content")

  label = document.createElement("label")
  label.innerHTML = version
  jQuery(label).addClass("label " + clazz)
  jQuery(label).css("font-size", "13px")

  td.appendChild(label)

  return td
}


/**
 * 
 */
function create_overview_table_user_column_cell(recorded_acks, user, last_version) {
  let td = undefined
  let bigger_version = undefined

  if (last_version == undefined) {
    return document.createElement('td')
  } else if (recorded_acks != undefined) {
    recorded_acks.forEach((recorded_ack) => {
      if (jQuery.inArray(user['ID'], recorded_ack['ackUsers']) > -1) {
        // we found a version for this user
        if (bigger_version == undefined || bigger_version < recorded_ack['version']) {
          bigger_version = recorded_ack['version']
        }
      }
    })
  }

  if (bigger_version != undefined) {
    if (bigger_version != last_version[0]) {
      td = create_version_label(bigger_version, "label-danger")
    } else {
      td = create_version_label(bigger_version, "label-success")
    }
  } else {
    td = create_version_label("None", "label-danger")
  }

  return td
}

function create_overview_table_article_name_cell(article, nesting_level) {
  let td = document.createElement("td")
  jQuery(td).css('color', 'royalblue');

  wrapper = document.createElement("div")
  jQuery(wrapper).css('width', '400px');
  jQuery(wrapper).css('margin-left', ((nesting_level) * 10) + 'px');
  td.appendChild(wrapper);

  // create the first column, with article name
  icon = document.createElement("i")
  jQuery(icon).addClass("fa fa-level-up fa-rotate-90")

  wrapper.appendChild(icon)

  article_anchor = document.createElement("a")
  article_anchor.innerHTML = "<a href=\"" + article['permalink'] + "\"><strong> " + article['post_title'] + "<strong> </a>"
  wrapper.appendChild(article_anchor)
  return td
}

function create_overview_table_header(all_users) {
  let thead = document.createElement("thead")
  let tr = document.createElement("tr")

  thead.appendChild(tr)
  //append first column "Categories / Articles"
  th = document.createElement("th")
  jQuery(th).addClass("cell")
  th.innerHTML = "Categories / Articles"
  jQuery(th).addClass("col-md-4 col-sm-4")
  tr.appendChild(th)
  // append second column "Last version"
  th = document.createElement("th")
  th.innerHTML = "Last version"
  tr.appendChild(th)
  // now append all users
  all_users.forEach((user) => {
    th = document.createElement("th")
    th.innerHTML = user['display_name']
    tr.appendChild(th)
  })
  return thead
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TREE LOGIC PART
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 * This is a click handler for category icon. This represents the entry point for tree logic
 */
function on_category_icon_click_event_handler(event) {
  let category_row_element = jQuery(event.target).closest("tr")[0]
  
  icon = jQuery(category_row_element).find("i")[0]
  if (jQuery(icon).hasClass(category_expaned_class)) {
    collapse_or_expand_category(category_row_element, true)
  } else {
    collapse_or_expand_category(category_row_element, false)
  }
}

function on_expand_all_articles_click_event_handler(event) {
  collapse_or_expand_all_categories(false)
} 

function on_collapse_to_categoriesArticleClickEventHandler(event) {
  custom_category_validator = (category) => {
    let subcategory_childs = jQuery(overview_table_id_selector).find(".is-category[category_parent=" + jQuery(category).attr("category_id") + "]").get()
    // if a category has other subcategories, do not collapse
    return subcategory_childs.length < 1
  }

  collapse_or_expand_all_categories(true, custom_category_validator)
}

function collapse_or_expand_all_categories(collapse, custom_category_validator) {
  all_categories = jQuery(overview_table_id_selector).find(".is-category[level=0]")
  all_categories.get().forEach((category) => {
     collapse_or_expand_category(category, collapse, custom_category_validator)
  })
}
/**
* Function which toggle 'category_expaned_class' and 'category_collapsed_class' classes on an icon depending on 'collapse'
*/
function toggle_category_icon(category, collapse) {
    let icon = jQuery(category).find("i").get(0)
    if (collapse) {
      jQuery(icon).removeClass(category_expaned_class)
      jQuery(icon).addClass(category_collapsed_class)
    } else {
      jQuery(icon).removeClass(category_collapsed_class)
      jQuery(icon).addClass(category_expaned_class)
    }
}

/*
* Method which collapse or expand a category. Note the 'custom_category_validator' : this receives a category and return true or false if a category should expand/collapse, or not
*/
function collapse_or_expand_category(category, collapse, custom_category_validator) {
  if (!jQuery(category).hasClass("is-category")) {
    return
  }

  let should_collapse_this_category = collapse
  if (custom_category_validator != undefined) {
    // use the extra custom_category_validator
    should_collapse_this_category = custom_category_validator(category)
  }
  toggle_category_icon(category, should_collapse_this_category)

  let subcategory_childs = jQuery(overview_table_id_selector).find("[category_parent=" + jQuery(category).attr("category_id") + "]").get()

  subcategory_childs.forEach((sibling) => {
      if (should_collapse_this_category) {
        jQuery(sibling).fadeOut(200)
      } else {
        // needs to expand
        jQuery(sibling).fadeIn(200)
      }
      if(jQuery(sibling).hasClass("is-category")) {
        collapse_or_expand_category(sibling, collapse, custom_category_validator)
      }
  })
}