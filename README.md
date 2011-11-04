#HTTPS Enforcer Extension for Google Chrome#
The [HTTPS Enforcer extension](https://chrome.google.com/webstore/detail/beaholcfmnpbabojbldnhlikfmnjmoma) makes it easy to ensure you’re connecting to secure sites by rewriting all requests to an HTTPS URL whenever you visit one of the sites HTTPS Enforcer supports.

Original idea and ruleset libraries: [HTTPS Everywhere for Firefox](https://www.eff.org/https-everywhere)

##Features##
* It can automatically detect HTTPS on every site (SSL certificate should be valid!)
* It can detect cyclic redirects (http->https->http->https) and disable that rules (i.e. http://w3c.org)
* It can secure cookies on HTTPS sites (see http://en.wikipedia.org/wiki/HTTP_cookie#Secure_cookie).
* It can send new HTTPS sites that were automatically found to plugin`s author, so we have frequently updated actual database.

##NOTE##
Chrome doesn't yet have the necessary API to make this plugin completely secure as Firefox plugin. So, it doesn't provide the full security benefits of Firefox HTTPS Everywhere, but I think it would a) provide a clear improvement in security to those who understand the risks, b) make it easy to provide the full security benefits as soon as the necessary APIs have landed. It may also increase the pressure to finish those APIs. By the way, needed APIs currently are experimental, so we can use it in stable version soon. Stay tuned.