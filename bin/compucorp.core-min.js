function extend(e,t){var o=t.prototype;t.prototype=Object.create(e.prototype);for(var r in o)t.prototype[r]=o[r];t.prototype.constructor=t,Object.defineProperty(t.prototype,"constructor",{enumerable:!1,value:t})}var CompucorpCore=function(){function CompucorpCore(){this.scope=[],this.completeRecurseDomChildren=!1}return CompucorpCore.prototype={recurseDomChildren:function(e,t){var o;e.childNodes&&(o=e.childNodes,CompucorpCore.prototype.loopNodeChildren(o,t))},loopNodeChildren:function(e,t){for(var o,r=0;r<e.length;r++)o=e[r],t&&CompucorpCore.prototype.outputNode(o),o.childNodes&&CompucorpCore.prototype.recurseDomChildren(o,t)},parseHTML:function(node){try{if(node.hasAttribute("compucorp-repeat")){var loop=node.getAttribute("compucorp-repeat").split(" in ");node.removeAttribute("compucorp-repeat");var nodeHTML=node.innerHTML;node.innerHTML="";var parentNode=node.parentNode,index=loop[0].trim(),variable=loop[1].trim(),returnString=[];eval("for("+index+" in this.scope."+variable+"){var i = "+index+";returnString["+index+"] = CompucorpCore.prototype.replaceAll(nodeHTML,index,'"+variable+"['+i+']')}"),nodeHTML=returnString.join("");var t=document.createElement("template");t.innerHTML=nodeHTML;var c=t.content.cloneNode(!0);node.appendChild(c)}}catch(err){}},getElementsByAttribute:function(e,t){for(var o=(t||document).getElementsByTagName("*"),r=0,n=null;n=o[r++];)if(n.hasAttribute(e))return n},escapeRegExp:function(e){return e.replace(/([.*+?^=!:${}()|\[\]\/\\])/g,"\\$1")},replaceAll:function(e,t,o){return e.replace(new RegExp(CompucorpCore.prototype.escapeRegExp(t),"g"),o)},outputNode:function(node){if(1===node.nodeType)CompucorpCore.prototype.parseHTML(node);else if(3===node.nodeType&&node.data)try{if(CompucorpCore.prototype.completeRecurseDomChildren){for(var val="{{",posStart=node.data.indexOf(val);-1!==posStart;){var posEnd=node.data.indexOf("}}",posStart+2),checkIsFunction=node.data.indexOf("(",posStart+2);if(checkIsFunction>0){var getEndFunction=node.data.indexOf(")",checkIsFunction+1),getFunctionName=node.data.slice(posStart+2,checkIsFunction);console.log("yes this is a function ",getFunctionName,node.data.slice(checkIsFunction+1,getEndFunction));var value=eval("CompucorpCore.prototype.scope."+node.data.slice(checkIsFunction+1,getEndFunction));value=eval("CompucorpCore.prototype.scope."+getFunctionName+"('"+value+"')")}else var value=eval("CompucorpCore.prototype.scope."+node.data.slice(posStart+2,posEnd));node.data=node.data.replace(node.data.slice(posStart+2,posEnd),value),posStart=node.data.indexOf(val,posStart+2)}node.data=CompucorpCore.prototype.replaceAll(node.data,"{{",""),node.data=CompucorpCore.prototype.replaceAll(node.data,"}}","")}}catch(err){}},getScope:function(){},getTemplate:function(){},request:function(e,t,o){var r=new XMLHttpRequest;r.open(e,t,!0),r.onload=function(){4===this.readyState&&200===this.status&&o(this.responseText)},r.send()},_manipulateHTMLFile:function(e){if(CompucorpCore.prototype.scope=this.getScope(),CompucorpCore.prototype.scope.cache_template){var t=CompucorpCore.prototype.scope.cache_template,o=t.content.cloneNode(!0);CompucorpCore.prototype.recurseDomChildren(o,!0),CompucorpCore.prototype.completeRecurseDomChildren=!0,CompucorpCore.prototype.recurseDomChildren(o,!0),e(o)}else CompucorpCore.prototype.request("GET",CompucorpCore.prototype.scope.template_url,function(t){var o=document.createElement("template");o.innerHTML=t,CompucorpCore.prototype.scope.cache_template=o;var r=o.content.cloneNode(!0);CompucorpCore.prototype.recurseDomChildren(r,!0),CompucorpCore.prototype.completeRecurseDomChildren=!0,CompucorpCore.prototype.recurseDomChildren(r,!0),e(r)})}},CompucorpCore}(),CC_Weather=function(){function e(){this.scope={},this.scope.api_openweather="http://api.openweathermap.org/data/2.5/weather?",this.scope.api_openweather_nextday="http://api.openweathermap.org/data/2.5/forecast/daily?",this.scope.openweather_key="8d0ae863745d6192e0282e029267d8dd",this.scope.positionUser=!1,this.scope.degree="F",this.scope.degreeSwitch="C",this.scope.messageSwitchDegree="Switch to",this.scope.defaultPlace="London",this.scope.template_url="./templates/template.html",this.scope.ForeCast=new CC_ForeCast,this.cache_template=!1,this.setInputSearch(this.getElementsByAttribute("compucorp-input-search")),this.setButtonSearch(this.getElementsByAttribute("compucorp-button-search")),this.scope.convertDirectionDegree=function(e){var t;return t=e>11.25&&33.75>e?"NNE":e>33.75&&56.25>e?"ENE":e>56.25&&78.75>e?"E":e>78.75&&101.25>e?"ESE":e>101.25&&123.75>e?"ESE":e>123.75&&146.25>e?"SE":e>146.25&&168.75>e?"SSE":e>168.75&&191.25>e?"S":e>191.25&&213.75>e?"SSW":e>213.75&&236.25>e?"SW":e>236.25&&258.75>e?"WSW":e>258.75&&281.25>e?"W":e>281.25&&303.75>e?"WNW":e>303.75&&326.25>e?"NW":e>326.25&&348.75>e?"NNW":"N",e+" m/s "+t},this.scope.formatTemp=function(e){return Math.round(9*(e-273.15)/5+32)},this.scope.convertTimestamp=function(e){var t=new Date;return t.setTime(1e3*e),t.getHours()+":"+t.getMinutes()}}return e.prototype={setButtonSearch:function(e){function t(e){o.getDefaultPlace(o.scope.inputSearch.value)}var o=this;this.scope.buttonSearch=e,this.scope.buttonSearch.addEventListener("click",t)},setInputSearch:function(e){function t(e){13==e.keyCode&&o.getDefaultPlace(this.value)}var o=this;this.scope.inputSearch=e,this.scope.inputSearch.addEventListener("keypress",t)},getScope:function(){return this.scope},_getPlaceByLatLon:function(e){var t=this;this.request("GET",t.scope.api_openweather+"lat="+e.coords.latitude+"&lon="+e.coords.longitude+"&APPID="+t.scope.openweather_key,function(e){t.scope.myPlace=JSON.parse(e),t.run(),t.scope.ForeCast.getForeCast(t.scope.myPlace.id)})},_callbackErrorOnGetLocation:function(e){var t=!1;switch(e.code){case e.PERMISSION_DENIED:break;case e.POSITION_UNAVAILABLE:t="Location information is unavailable.";break;case e.TIMEOUT:t="The request to get user location timed out.";break;case e.UNKNOWN_ERROR:t="An unknown error occurred."}t===!1?this.getDefaultPlace():alert(t)},checkBrowserPosition:function(){var e=this;navigator.geolocation?navigator.geolocation.getCurrentPosition(function(t){e._callbackSuccessOnGetLocation(t)},function(t){e._callbackErrorOnGetLocation(t)}):e.getDefaultPlace()},_callbackSuccessOnGetLocation:function(e){this._getPlaceByLatLon(e)},getTemplate:function(){return this.scope.template_url},run:function(){var e=this;this.scope.defaultPlace;e._manipulateHTMLFile(function(t){var o=e.getElementsByAttribute("compucorp-view");o.innerHTML="",o.appendChild(t)})},getDefaultPlace:function(e){void 0===e&&(e=this.scope.defaultPlace||"London");var t=this;this.request("GET",t.scope.api_openweather+"q="+e+"&APPID="+t.scope.openweather_key,function(e){var o=JSON.parse(e);200==o.cod&&(t.scope.myPlace=o,t.run(),t.scope.ForeCast.getForeCast(t.scope.myPlace.id))})}},e}(),CC_ForeCast=function(){function e(){this.scope={},this.scope.api_openweather="http://api.openweathermap.org/data/2.5/weather?",this.scope.api_openweather_nextday="http://api.openweathermap.org/data/2.5/forecast/daily?",this.scope.openweather_key="8d0ae863745d6192e0282e029267d8dd",this.cache_template=!1,this.scope.template_url="./templates/template2.html",this.scope.formatDate=function(e){var t=(new Date,new Date);t.setTime(1e3*e);var o=new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat"),r=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"),n=o[t.getDay()]+" "+r[t.getMonth()]+" "+t.getDate()+", "+t.getFullYear();return n},this.scope.formatTemp=function(e){return Math.round(9*(e-273.15)/5+32)},this.scope.convertDirectionDegree=function(e){var t;return t=e>11.25&&33.75>e?"NNE":e>33.75&&56.25>e?"ENE":e>56.25&&78.75>e?"E":e>78.75&&101.25>e?"ESE":e>101.25&&123.75>e?"ESE":e>123.75&&146.25>e?"SE":e>146.25&&168.75>e?"SSE":e>168.75&&191.25>e?"S":e>191.25&&213.75>e?"SSW":e>213.75&&236.25>e?"SW":e>236.25&&258.75>e?"WSW":e>258.75&&281.25>e?"W":e>281.25&&303.75>e?"WNW":e>303.75&&326.25>e?"NW":e>326.25&&348.75>e?"NNW":"N",e+" m/s "+t}}return e.prototype={getScope:function(){return this.scope},getTemplate:function(){return this.scope.template_url},run:function(){var e=this;e._manipulateHTMLFile(function(t){var o=e.getElementsByAttribute("forecast-view");o.innerHTML="",o.appendChild(t)})},getForeCast:function(e){var t=this;this.request("GET",t.scope.api_openweather_nextday+"id="+e+"&cnt=10&APPID="+t.scope.openweather_key,function(e){t.scope.nextDays=JSON.parse(e),t.run()})}},e}();extend(CompucorpCore,CC_Weather),extend(CompucorpCore,CC_ForeCast);