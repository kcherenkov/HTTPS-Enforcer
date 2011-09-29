var $ = document;
// create the new element to insert
var ndiv = $.createElement("div");
// give the new element an id
ndiv.setAttribute("id", "notify-container");
// insert the new element into the DOM before the existing first child
var nclose = $.createElement("span");
nclose.className = "notify-close";

var nclosea = $.createElement("a");
nclosea.title = "dismiss this notification";
nclosea.innerText = "\u00D7";
nclosea.onclick = function() {
    $.body.removeChild(ndiv);
};
nclose.appendChild(nclosea);

var ntext = $.createElement("span");
ntext.innerHTML = 'Something wrong? You can <a id="backUrl" href="' + backUrl + '">return back to non secure version</a>';

ndiv.appendChild(nclose);
ndiv.appendChild(ntext);

$.body.insertBefore(ndiv, $.body.firstChild);

$.getElementById('backUrl').onclick = function(){
    chrome.extension.sendRequest({disableRuleset: true, ruleset_id: ruleset_id});
};