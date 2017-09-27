/**
* This is used internally to unify different rendering parts. Register in one place, and use in other
*/ 
var Wpua_Hook = {
  hooks: [],
 
  register: function ( name, callback ) {
    if( 'undefined' == typeof( Wpua_Hook.hooks[name] ) )
      Wpua_Hook.hooks[name] = []
    if (Wpua_Hook.hooks[name].length > 0) {
      console.error("Hook with key = " + name + " already registered in Wpua_Hook")
    }
    Wpua_Hook.hooks[name].push( callback )
  },
 
  call: function ( name, arguments ) {
    if( 'undefined' != typeof( Wpua_Hook.hooks[name] ) )
      for( i = 0; i < Wpua_Hook.hooks[name].length; ++i )
        return Wpua_Hook.hooks[name][i]( arguments )
  }
}

/*
* Generic method to make requests to server. Kepp in mind that this method populates in params article_id or logged_user if exists in wpua context.
*/
function make_server_request(request_type, request_uri, params, callback) {
  var widgetBody = document.getElementById(WPUAConstants.WIDGET_BODY_ID)
  if(widgetBody == undefined) {
    return
  }

  var articleId = widgetBody.getAttribute(WPUAConstants.ARTICLE_PARAMETER_NAME)
  var loggedUser = WPUAConstants.LOGGED_USER
  if (params == undefined) {
    params = {}
  }
  params[WPUAConstants.ARTICLE_PARAMETER_NAME] = articleId;
  params[WPUAConstants.LOGGED_USER_PARAMETER_NAME] = loggedUser;

  jQuery.ajax({
    type: request_type,
    url: WPUAConstants.RELATIVE_SITE_URL + request_uri,
    dataType: "json",
    data: params,
    success: callback,
    error: function(xhr, ajaxOptions, thrownError) {
      console.log(xhr, ajaxOptions, thrownError)
    }
  });
}