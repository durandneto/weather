function extend(base, sub) {
  // Avoid instantiating the base class just to setup inheritance
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
  // for a polyfill
  // Also, do a recursive merge of two prototypes, so we don't overwrite 
  // the existing prototype, but still maintain the inheritance chain
  // Thanks to @ccnokes
  var origProto = sub.prototype;
  sub.prototype = Object.create(base.prototype);
  for (var key in origProto)  {
     sub.prototype[key] = origProto[key];
  }
  // Remember the constructor property was set wrong, let's fix it
  sub.prototype.constructor = sub;
  // In ECMAScript5+ (all modern browsers), you can make the constructor property
  // non-enumerable if you define it like this instead
  Object.defineProperty(sub.prototype, 'constructor', { 
    enumerable: false, 
    value: sub 
  });
} 

var CompucorpCore = (function(){
/*
* public contructor 
*/
  function CompucorpCore(){
    // abstract scope
    this.scope = [];
    // false because here is the contructor
    this.completeRecurseDomChildren = false;
  }

  CompucorpCore.prototype ={

    /**
    @function : recurseDomChildren
    @params   : start node
    @params   : output function callback
    @description : this function is responsible for making the html parse 
    the objects found in the template that will be loaded
    */
    recurseDomChildren : function (start, output){

      var nodes;
      if(start.childNodes){
        nodes = start.childNodes;
        CompucorpCore.prototype.loopNodeChildren(nodes, output);
      }

    } 
    /*
    @function : loopNodeChildren
    @params   : nodes node childs
    @params   : output function callback
    @description : this function is responsible for decide 
    if the node childs are finished, 
    and call output function
    */
    , loopNodeChildren : function (nodes, output){

      var node;
      for(var i=0; i<nodes.length; i++){
        node = nodes[i];
        // if is true, call output function
        if(output){
          CompucorpCore.prototype.outputNode(node);
        }
        // if node has any child, call recursive function
        if(node.childNodes){
          CompucorpCore.prototype.recurseDomChildren(node, output);
        }
      }

    }
    /*
    @function : parseHTML
    @params   : node
    @description :  this function find for custom directives and manipulate the html
    */
    , parseHTML : function (node){

      try {
        // checking if the node.data has a loop
        if(node.hasAttribute('compucorp-repeat')){

          // getting the loop text
          var loop = node.getAttribute('compucorp-repeat').split(' in ');
          // removving custom directive of the node
          node.removeAttribute('compucorp-repeat');
          // save the node inner html
          var nodeHTML = node.innerHTML;
          // cleaning de node html
          node.innerHTML = "";
          // getting parent node refenrence
          var parentNode = node.parentNode;
          // save the first string the loop, this string represent
          // the single object 
          var index = loop[0].trim();
          // this variable represent all class object
          var variable = loop[1].trim();
          // setting new returno of the node
          var returnString = [];
          // repeat the node's content 
          eval("for("+index+" in this.scope."+variable+"){"
          +   "var i = "+index+";"
          // replace text content by object value
          +   "returnString["+index+"] = CompucorpCore.prototype.replaceAll(nodeHTML,index,'"+variable+"['+i+']')" 
          + "}");
          // setting new html content in the node
          nodeHTML  = returnString.join('');
          // create a new template
          var t = document.createElement('template');
          // setting html content
          t.innerHTML = nodeHTML;
          // clone conetent 
          var c = t.content.cloneNode(true); 
          // setting new node content
          node.appendChild(c);

        }
      }catch(err){

      }

    }
    /*
    @function : getElementsByAttribute
    @params   : attribute name of custom directive to get element
    @params   : context element to search custom directive, if null element=document
    @description :  this function find for custom directives and manipulate the html
    */
    , getElementsByAttribute :function (attribute, context) {
        var nodeList = (context || document).getElementsByTagName('*');
        var iterator = 0;
        var node = null;
        // parse all child elements of the node
        while (node = nodeList[iterator++]) {
          // if match node attribute and attibute passed by user
          if (node.hasAttribute(attribute)) {
            return node;
          }
        }

    }
    /*
    @function : escapeRegExp
    @params   : str string to search espcials caracters
    @return   : returns the character found
    */
    , escapeRegExp : function (str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
        /*
    @function : replaceAll
    @params   : str string to search caracters
    @params   : find string that will be searched
    @return   : returns recursive string replace all occurrence found
    */
    , replaceAll : function (str, find, replace) {
        return str.replace(new RegExp(CompucorpCore.prototype.escapeRegExp(find), 'g'), replace);
    }
    , outputNode : function (node) {
        // check if node is a html content
        if(node.nodeType === 1)
        {
          // call function parseHtml to check custom directives
            CompucorpCore.prototype.parseHTML(node);
        }
        else if(node.nodeType === 3){ 
          // check if node is valid to replace objects
          if(node.data)
          { 
            try{
              //if this is true, will start replacing the html for the object class values
              if(CompucorpCore.prototype.completeRecurseDomChildren){
                // set string to search the start of objects
                var val = "{{";
                // get the possition of the first object
                var posStart = node.data.indexOf(val);
                // if position is valid, will be able to get the object and replace
                while (posStart !== -1) {
                  // get the end of object
                  var posEnd = node.data.indexOf("}}",posStart+2);
                  // here, i am checking if node.data could be a function of the class
                  // but I do not yet implemented
                  var checkIsFunction = node.data.indexOf("(",posStart+2);
                  if(checkIsFunction > 0){
                    var getEndFunction = node.data.indexOf(")",checkIsFunction+1);
                    //get function name
                    var getFunctionName = node.data.slice(posStart+2,checkIsFunction);

                    // look the console to see the function
                     console.log('yes this is a function ', getFunctionName,node.data.slice(checkIsFunction+1 ,getEndFunction));
                    /* I identify that here is a function but i dont have implemented yet*/
                    var value =  eval("CompucorpCore.prototype.scope."+node.data.slice(checkIsFunction+1 ,getEndFunction));
                    // window[this.scope.getFunctionName]('durand');
                    value =  eval("CompucorpCore.prototype.scope."+getFunctionName+"('"+value+"')");
                  }else{
                    // call the value of the class object and setting in a variable
                    var value = eval("CompucorpCore.prototype.scope."+node.data.slice(posStart+2,posEnd));
                  }

                  // replace the node.data by the value returned of the class's object
                  node.data = node.data.replace(node.data.slice(posStart+2,posEnd),value);
                  // checking if have more objects
                  posStart = node.data.indexOf(val, posStart + 2);
                }
                //replace all string that identifies objects in html
                node.data = CompucorpCore.prototype.replaceAll(node.data,"{{","");
                node.data = CompucorpCore.prototype.replaceAll(node.data,"}}",""); 
              }
            }catch(err){

            }
          }  
        }  
    },
    /*
    @function : getScope
    @params   : void
    @return   : return scope of the class
    @descrition : Abstract function, this function need to be implemented by all classes
    */
    getScope: function() {
    // return scope
    },
    /*
    @function : getTemplate
    @params   : void
    @return   : return template_url of the class
    @descrition : Abstract function, this function need to be implemented by all classes
    */
    getTemplate: function() {
    // template_url
    },
    /*
    @function : request
    @params   : _method type of request GET/POST/PATCH/DELETE/UPDATE
    @params   : _url url called to request
    @params   : _callback output function that will be called when finished the request
    @descrition : This function get all templates and call the callback function 
    */
    request : function(_method,_url,_callback){

      /*
      // no implemented errors yet
      */
      var xhr = new XMLHttpRequest();
      
      xhr.open(_method, _url, true);
      
      xhr.onload = function (){
        // checking if readding is done
        if (this.readyState === 4){
          // checking if not have erros
          if (this.status === 200){
            // call function callback sendding the response text
            _callback(this.responseText);
          }
        } 
      };

      xhr.send(); 
    }
    /*
    @function : _manipulateHTMLFile
    @params   : _callback output function that will be called when finished all parses htmls and objects
    @descrition : This function is called by all classes to parse the template and HTML replace all objects 
    */
    , _manipulateHTMLFile : function (_callback){
        // set the scope for manipulate after
        CompucorpCore.prototype.scope = this.getScope();
        // if loaded the class's template, 
        // it's will save the template in an object 
        // for do not get by requesting http any more
        if(!CompucorpCore.prototype.scope.cache_template){
          // call method request to get html template for first time
          CompucorpCore.prototype.request("GET", CompucorpCore.prototype.scope.template_url, function(responseText){ 
            var template = document.createElement('template');
            template.innerHTML = responseText;
            // save de template loadded in self variable
            CompucorpCore.prototype.scope.cache_template = template;
            var clone = template.content.cloneNode(true);
            // init parse html, only html
            CompucorpCore.prototype.recurseDomChildren(clone, true);
            // set variable to restart the parse html to replace all objects
            CompucorpCore.prototype.completeRecurseDomChildren = true;
            // init replace objects in html
            CompucorpCore.prototype.recurseDomChildren(clone, true);
            // call callback function sendding http fragment for end parse
            _callback(clone);

          });
      }else{
        // get template html cached 
          var template = CompucorpCore.prototype.scope.cache_template;
          var clone = template.content.cloneNode(true);
          // init parse html, only html
          CompucorpCore.prototype.recurseDomChildren(clone, true);
          // set variable to restart the parse html to replace all objects
          CompucorpCore.prototype.completeRecurseDomChildren = true;
          // init replace objects in html
          CompucorpCore.prototype.recurseDomChildren(clone, true);
          // call callback function sendding http fragment for end parse
          _callback(clone);

      }

    }

  }

   return CompucorpCore;

 }());


var CC_Weather = (function(){
  /**
   * contructor of the class and the super class
   * @return {void}
   */ 

    
  function CC_Weather(){
    // creating the scope
    this.scope = {};
    // endpoint of the API to get weather by text
    this.scope.api_openweather = 'http://api.openweathermap.org/data/2.5/weather?';
    // endpoit to get forecast by Weather ID
    this.scope.api_openweather_nextday = 'http://api.openweathermap.org/data/2.5/forecast/daily?';
    // public key 
    this.scope.openweather_key = '8d0ae863745d6192e0282e029267d8dd';
    // initial posision is false, for call navigator geolocation position
    this.scope.positionUser  = false;
    // texts for translation
    this.scope.degree = 'F';
    this.scope.degreeSwitch = 'C';
    this.scope.messageSwitchDegree = 'Switch to';
    // setting default place , if user block de permission to get your position
    // I am getting London as default place
    this.scope.defaultPlace = 'London';
    // file that have the template
    this.scope.template_url = './templates/template.html';
    // object type CC_ForeCast the get the forecast values
    this.scope.ForeCast = new CC_ForeCast();
    // init cache template to false , because this is the contructor of the class
    this.cache_template = false;
    // start watching input search events
    this.setInputSearch(this.getElementsByAttribute("compucorp-input-search"));
    this.setButtonSearch(this.getElementsByAttribute("compucorp-button-search"));

    this.scope.convertDirectionDegree = function(deg){
      var direction;

        if (deg>11.25 && deg<33.75){
          direction = "NNE";
        }else if (deg>33.75 && deg<56.25){
          direction = "ENE";
        }else if (deg>56.25 && deg<78.75){
          direction = "E";
        }else if (deg>78.75 && deg<101.25){
          direction = "ESE";
        }else if (deg>101.25 && deg<123.75){ 
          direction = "ESE";
        }else if (deg>123.75 && deg<146.25){
          direction = "SE";
        }else if (deg>146.25 && deg<168.75){
          direction = "SSE";
        }else if (deg>168.75 && deg<191.25){
          direction = "S";
        }else if (deg>191.25 && deg<213.75){
          direction = "SSW";
        }else if (deg>213.75 && deg<236.25){
          direction = "SW";
        }else if (deg>236.25 && deg<258.75){
          direction = "WSW";
        }else if (deg>258.75 && deg<281.25){
          direction = "W";
        }else if (deg>281.25 && deg<303.75){
          direction = "WNW";
        }else if (deg>303.75 && deg<326.25){
          direction = "NW";
        }else if (deg>326.25 && deg<348.75){
          direction = "NNW";
        }else{
          direction = "N"; 
        }

        return deg +" m/s "+ direction;
    }

 

  this.scope.formatTemp = function(temp){
    return  Math.round(((temp- 273.15)*9/5)+32);
  }


  this.scope.convertTimestamp = function(timestamp){
    var pubDate = new Date();
    pubDate.setTime(timestamp* 1000); 
    return pubDate.getHours()+':'+pubDate.getMinutes(); 

  }


  }


  CC_Weather.prototype = {
    /*
      @function : setButtonSearch
      @params: node input type text where will by capturated the click events
    */
    setButtonSearch : function(node){
      var _self = this;
      this.scope.buttonSearch = node;
      // create function to capture click in the button
      function clickSearchButton(e){
        _self.getDefaultPlace(_self.scope.inputSearch.value); 
      }
      // setting function on button events listener 
      this.scope.buttonSearch.addEventListener('click',clickSearchButton);
    },
     /*
      @function : setInputSearch
      @params: node input type text where will by capturated the keypress events
    */
    setInputSearch : function(node){
      var _self = this;
      this.scope.inputSearch = node;
      // create function to capture key events
      function keypressEvents (e){
        if (e.keyCode == 13) {
          _self.getDefaultPlace(this.value); 
        }
      };
      // setting function on input events listener
      this.scope.inputSearch.addEventListener('keypress',keypressEvents);
    },
    getScope : function(){
      return this.scope;
    },
    _getPlaceByLatLon : function(position){
        // $http.get(api_openweather+'lat='+position.coords.latitude+'&lon='+position.coords.longitude+'&APPID='+openweather_key)
        var _self = this;
        this.request("GET"
          , _self.scope.api_openweather+'lat='+position.coords.latitude+'&lon='+position.coords.longitude+'&APPID='+_self.scope.openweather_key
          , function (responseText){
              _self.scope.myPlace = JSON.parse(responseText);
              _self.run();
              _self.scope.ForeCast.getForeCast(_self.scope.myPlace.id);
          });
    },
    _callbackErrorOnGetLocation : function(error){
      var _error_message = false;
       switch(error.code) {
        case error.PERMISSION_DENIED:
            // _error_message = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            _error_message = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            _error_message = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            _error_message = "An unknown error occurred."
            break;
        }

        // if has error, 
        if(_error_message === false){
          // if not have error, get place
          this.getDefaultPlace();
        }else{
          // call alert if error
          alert(_error_message);
        }
    },
    /*
      @function : checkBrowserPosition
      @params : void
      @description : this function invoke navigation's function 
                      to get current user position
    */
    checkBrowserPosition : function (){
      var _self = this;
      // checking fi the browser has suport to geolocation
      if(navigator.geolocation){
        // try get browser position
        navigator.geolocation.getCurrentPosition(
                  function (position){
                    // on user allow
                    _self._callbackSuccessOnGetLocation(position);
                  }
                  , function (error){
                    // on user block
                    _self._callbackErrorOnGetLocation(error);
                  }
                );
      }else{
        // if not init with default place and user can get any weather by search input
         _self.getDefaultPlace();
      }
    },
    // function 
    _callbackSuccessOnGetLocation : function(postion){
       this._getPlaceByLatLon(postion);
    },
    getTemplate : function(){
      return this.scope.template_url;
    },
    run : function(){

      var _self = this
      , place = this.scope.defaultPlace;

      _self._manipulateHTMLFile(function(responseText){
        var el = _self.getElementsByAttribute("compucorp-view");
        el.innerHTML = "";
        el.appendChild(responseText);
      }); 

    },
    getDefaultPlace : function(place){
      if(place === undefined){
        place = this.scope.defaultPlace || 'London';
      }
      var _self = this;
       this.request("GET",_self.scope.api_openweather+"q="+place+"&APPID="+_self.scope.openweather_key,function(responseText){
        
          var myPlace = JSON.parse(responseText);
          
          if(myPlace .cod == 200){
            _self.scope.myPlace = myPlace;
            _self.run();
            _self.scope.ForeCast.getForeCast(_self.scope.myPlace.id);
          }
        
       });
    } 
  }

  // Expõe o construtor
  return CC_Weather;

}()); 


var CC_ForeCast = (function(){
  /**
   * contructor of the class and the super class
   * @return {void}
   */ 

    
  function CC_ForeCast(){
    this.scope = {};
    this.scope.api_openweather = 'http://api.openweathermap.org/data/2.5/weather?';
    this.scope.api_openweather_nextday = 'http://api.openweathermap.org/data/2.5/forecast/daily?';
    this.scope.openweather_key = '8d0ae863745d6192e0282e029267d8dd';
    this.cache_template = false;
    this.scope.template_url = './templates/template2.html';


    this.scope.formatDate = function(dt){

      var today = new Date();


      var pubDate = new Date();
      pubDate.setTime(dt * 1000);

      // if(today.getDay() == pubDate.getDay()){
      //   return 'Today';
      // }
      var weekday=new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
      var monthname=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
      var formattedDate = weekday[pubDate.getDay()] + ' ' 
                      + monthname[pubDate.getMonth()] + ' ' 
                      + pubDate.getDate() + ', ' + pubDate.getFullYear()
      return formattedDate;

    }


    this.scope.formatTemp = function(temp){
      return  Math.round(((temp- 273.15)*9/5)+32);
    }



    this.scope.convertDirectionDegree = function(deg){
      var direction;

        if (deg>11.25 && deg<33.75){
          direction = "NNE";
        }else if (deg>33.75 && deg<56.25){
          direction = "ENE";
        }else if (deg>56.25 && deg<78.75){
          direction = "E";
        }else if (deg>78.75 && deg<101.25){
          direction = "ESE";
        }else if (deg>101.25 && deg<123.75){ 
          direction = "ESE";
        }else if (deg>123.75 && deg<146.25){
          direction = "SE";
        }else if (deg>146.25 && deg<168.75){
          direction = "SSE";
        }else if (deg>168.75 && deg<191.25){
          direction = "S";
        }else if (deg>191.25 && deg<213.75){
          direction = "SSW";
        }else if (deg>213.75 && deg<236.25){
          direction = "SW";
        }else if (deg>236.25 && deg<258.75){
          direction = "WSW";
        }else if (deg>258.75 && deg<281.25){
          direction = "W";
        }else if (deg>281.25 && deg<303.75){
          direction = "WNW";
        }else if (deg>303.75 && deg<326.25){
          direction = "NW";
        }else if (deg>326.25 && deg<348.75){
          direction = "NNW";
        }else{
          direction = "N"; 
        }

        return deg +" m/s "+ direction;
    }

 

  }


  CC_ForeCast.prototype = { 
    getScope : function(){
      return this.scope;
    },
    getTemplate : function(){
      return this.scope.template_url;
    },
    run : function(){
      
      var _self = this;
      _self._manipulateHTMLFile(function(responseText){
        var el = _self.getElementsByAttribute("forecast-view");
        el.innerHTML = "";
        el.appendChild(responseText);
      }); 

    }, 
    getForeCast : function(cityId){
      var _self = this;
       this.request("GET",_self.scope.api_openweather_nextday+'id='+cityId+'&cnt=10&APPID='+_self.scope.openweather_key,function(responseText){
          _self.scope.nextDays = JSON.parse(responseText);
          _self.run();
       });
    }
  }
  // Expõe o construtor
  return CC_ForeCast;

}()); 

 
extend(CompucorpCore, CC_Weather);
extend(CompucorpCore, CC_ForeCast);  
