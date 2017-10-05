/*
* Entry point for wordpress include-html shortocde client side logic
*/
jQuery(document).ready(() => {
  jQuery("." + WPUAConstants.WPIH_CONTAINER_CLASS).ready(() => {
    // now get each include-html container and process itfor
    jQuery("." + WPUAConstants.WPIH_CONTAINER_CLASS).get().forEach((include_html_container) => {
      include_html_in_container(include_html_container)
    })
  });
})

function include_html_in_container(include_html_container) {
  let url = jQuery(include_html_container).attr(WPUAConstants.WPIH_SHORTCODE_PARAM_URL)
  if(url == undefined) {
    return
  }
  let xhr= new XMLHttpRequest();
  xhr.open('GET', url, true);
  // small trick to show only one error message, because onreadystatechange enters multiple time for only 1 call
  let error_handled = false;
  xhr.onreadystatechange= function() {
      if (this.readyState == 4 && this.status==200) {
        send_html_content_to_process(this.responseText, include_html_container);
      } else if (this.status !==200 && !error_handled) {
        include_html_container.appendChild(create_alert("Could not load URL: <code>" + url + "</code>.<p><b> Notice: Currently we suport loading html only for csp-dev-tools domain<b></p>", "alert-danger"))
        error_handled = true
      }
  };
  xhr.send();
}

function send_html_content_to_process(html_content, include_html_container) {
  var params = {}

  params[WPUAConstants.WPIH_SHORTCODE_PARAM_HTML_CONTENT] = encodeURI(html_content)

  make_server_request(
    "POST", 
    "process_html_content", 
    params, 
    (response) => {
       include_html_container.innerHTML = response
    }, 
    (error_response) => {
      include_html_container.appendChild(create_alert("Server error: Could not process html from URL: " + jQuery(include_html_container).attr(WPUAConstants.WPIH_SHORTCODE_PARAM_URL), "alert-danger"))
    })
}