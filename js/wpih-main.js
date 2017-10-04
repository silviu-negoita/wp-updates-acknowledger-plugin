jQuery(document).ready(() => {
  jQuery("#" + WPUAConstants.WPIH_CONTAINER_ELEMENT_ID).ready(() => {
    get_html_content_by_url(jQuery("#" + WPUAConstants.WPIH_CONTAINER_ELEMENT_ID).attr(WPUAConstants.WPIH_SHORTCODE_PARAM_URL))
  });
})

function attach_element_to_wpih_contaner(element) {
  jQuery("#" + WPUAConstants.WPIH_CONTAINER_ELEMENT_ID).get(0).appendChild(element)
}

function get_html_content_by_url(url) {
  if(url == undefined) {
    return
  }
  var xhr= new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange= function() {
      if (this.readyState == 4 && this.status==200) {
        send_html_content_to_process(this.responseText);
      } else if (this.status != 200) {
        attach_element_to_wpih_contaner(create_alert("Could not load URL: <code>" + url + "</code>.<p><b> Notice: Currently we suport loading html only for csp-dev-tools domain<b></p>", "alert-danger"))
      }
  };
  xhr.send();
}

function send_html_content_to_process(html_content) {
  params = {}

  params[WPUAConstants.WPIH_SHORTCODE_PARAM_HTML_CONTENT] = encodeURI(html_content)

  make_server_request("POST", "/wp-json/wpua/api/process_html_content", params, include_html_content, on_error_callback)
}

function include_html_content(response) {
  to_attach = response
  to_attach = to_attach.replace(/\\"/g, '"');
  jQuery("#" + WPUAConstants.WPIH_CONTAINER_ELEMENT_ID).get(0).innerHTML = to_attach
}

function on_error_callback(error) {
  //TODO
}
