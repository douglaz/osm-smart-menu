"use strict";

const port = chrome.runtime.connect({"name": "get-pages"});

port.onMessage.addListener(function(response){
  console.debug("popup script received message through port: " + JSON.stringify(response));


  if (response.sites) {
    const panel = document.querySelector(".panel");
    panel.innerHTML = createPanelContent(response.sites);
  } else {
    document.body.innerHTML = chrome.i18n.getMessage(response.error);
  }

  Array.from(document.querySelectorAll("a")).forEach(function(anchor){
    anchor.addEventListener("click", openLink);
  });
});


function openLink(event) {
  //we have to ask the background script to open links because links in the panel don't open in tabs :-(
  if (event.currentTarget.nodeName == "A") {
    const a = event.currentTarget;
    const message = {
      "url": a.href,
      "id": a.id //currently this is unnecessary
    };
    port.postMessage(message);

    event.stopPropagation();
    event.preventDefault();
  }
}

function createPanelContent(sitesList) { //TODO: consider using the DOM node creation API instead
  // <div class="panel-section panel-section-list"> theorically should be added... see https://firefoxux.github.io/StyleGuide/#/panels
  return sitesList.reduce(function(html, site){
      let additionalClass = '';
      if(!site.active) additionalClass+='disabled' //TODO: behavior could be configurable
      return html +
        '<a id="'+ site.id +'" href="'+ site.url +'" class="panel-list-item '+additionalClass+'">' +
            // '<div class="icon"></div>' //will be used in the future
            '<div class="text">' +
              chrome.i18n.getMessage('site_'+ site.id) +
            '</div>'+
        '</a>'
  }, '');
}
