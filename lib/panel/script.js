"use strict";

const port = chrome.runtime.connect({"name": "get-pages"});

port.onMessage.addListener(function(response){
  console.debug("popup script received message through port: " + JSON.stringify(response));


  if (response.sites) {
    replacePanelContent(response);
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

function replacePanelContent(sitesList) {
  const panel = document.querySelector(".panel");

  sitesList.forEach(function(site) {
    let additionalClass = '';
    if(!site.active) additionalClass+='disabled' //TODO: behavior could be configurable by user

    const anchor = document.createElement('a');
    anchor.id = site.id;
    anchor.href = site.url;
    anchor.textContent = chrome.i18n.getMessage('site_'+ site.id)

    const textDiv = document.createElement('div');
    textDiv.className = 'text';
    textDiv.appendChild(anchor);

    const listItem = document.createElement('div');
    listItem.className = `panel-list-item ${additionalClass}`;
    listItem.appendChild(textDiv);

    panel.appendChild(listItem);
  });
}
