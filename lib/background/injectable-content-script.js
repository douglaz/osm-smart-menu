"use strict";
(function(){

chrome.runtime.onMessage.addListener(function(request, _sender, sendResponse) {
  console.debug("injected content script received request: " + JSON.stringify(request));

  const siteId = request.id;
  sendResponse(extraData(siteId));
})


// note that the response given to the main thread should contain URL-encoded values (only strings)
const Extractors = {
  howdidyoucontribute: {
    getPermalink: getPermalinkBySelector('a[href*="//hdyc.neis-one.org/?"]')
  },
  bingmaps: {
    getValues: function(){
      // Known bug:
      // The URL doesn't change automatically. If the user enters into //www.bing.com/maps (without parameters) and
      //   doesn't move the map around at least once, then this script won't be able to extract any information.
      if (window.history && window.history.state && window.history.state.MapModeStateHistory && window.history.state.MapModeStateHistory.centerPoint) {
        const mapState = window.history.state.MapModeStateHistory;
        return {
          lat: mapState.centerPoint.latitude,
          lon: mapState.centerPoint.longitude,
          zoom: mapState.level
        };
      }
    }
  },
  overpassapi: {
    getPermalink: openLayers_getPermalink(),
    getValues: function(){
      //TODO: we can get userName if it's a changeset analysis and maybe map coordinates on both cases
    }
  },
  whodidit: {
    getValues: function(){
      //TODO: we may get an username or changeset info
    },
    getPermalink: openLayers_getPermalink()
  },
  osmrelationanalyzer: {
    getValues: function(){
      //TODO: we can get userName if it's a changeset analysis and maybe map coordinates on both cases
    }
  },
  osmroutemanager: {
    getValues: function(){
      //TODO: get user that change this relation for the last time
    }
  },
  osmose: {
    getPermalink: getPermalinkBySelector("[class*=permalink] a"),
    getValues: function(){
      //TODO: get parameters from URL because there is a language prefix between /map and /#zoom
    }
  },
  osmhistoryviewer: {
    getValues: function(){
      //TODO: we can get userName if it's a changeset analysis and maybe map coordinates on both cases
    }
  },
  osminspector: {
    getPermalink: getPermalinkBySelector("a#permalink")
  },
  keepright: {
    getPermalink: openLayers_getPermalink()
  },
  opencyclemap: {
    getPermalink: getPermalinkBySelector("a#permalink")
  },
  openseamap: {
    getPermalink: openLayers_getPermalink()
  },
  opensnowmap: {
    getPermalink: getPermalinkBySelector("a#permalink")
  },
  historicmap: {
    getPermalink: getPermalinkBySelector("a#permalink")
  },
  openwhatevermap: {
    getPermalink: openLayers_getPermalink()
  },
  openptmap: {
    getPermalink: openLayers_getPermalink()
  },
  opnvkarte: {
    getPermalink: openLayers_getPermalink()
  },
  openmapsurfer: {
    getPermalink: openLayers_getPermalink()
  }
}


function getPermalinkBySelector(selector){
  return function(document){
      const permalink = document.querySelector(selector);
      return permalink && permalink.href;
  }
}

function openLayers_getPermalink(){
  return getPermalinkBySelector("[id*=Permalink] a");
}

function getPermalinkByValue(){
  return function(document){
    const permalinkAnchor = [...(document.querySelectorAll('a'))]
                            .find(a => /permalink/i.test(a.textContent));
    return permalinkAnchor && permalinkAnchor.href;
  }
}

function extraData(siteId) {
  let permalink = null;
  let additionalValues = {};

  if (siteId == null) {
    // TODO: even if it is unknown, try to extract some information from the site with some generic guesses
  }
  else if (Extractors[siteId]) {
    if (Extractors[siteId].getPermalink) {
      permalink = Extractors[siteId].getPermalink(document);
    }
    if (Extractors[siteId].getValues) {
      additionalValues = Extractors[siteId].getValues();
    }
  }

  return {
    permalink: permalink,
    additionalValues: additionalValues
  };
}

})();
