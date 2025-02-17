/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * @class x3dom.X3DCanvas
 */
x3dom.X3DCanvas = function(x3dElem, canvasIdx) {

    var that = this;
	this.canvasIdx = canvasIdx;
	
    this.initContext = function(canvas, forbidMobileShaders) {
        x3dom.debug.logInfo("Initializing X3DCanvas for [" + canvas.id + "]");
        var gl = x3dom.gfx_webgl(canvas, forbidMobileShaders);
        if (!gl) {
            x3dom.debug.logError("No 3D context found...");
            this.x3dElem.removeChild(canvas);
            return null;
        }
        return gl;
    };

	this.initFlashContext = function(object) {
        x3dom.debug.logInfo("Initializing X3DObject for [" + object.id + "]");
        var gl = x3dom.gfx_flash(object);
        return gl;
    };

	this.appendParam = function(node, name, value) {
		var param = document.createElement('param');
		param.setAttribute('name', name);
		param.setAttribute('value', value);
		node.appendChild( param );
	};
	
	this.fileExists = function(url) {
		var xhr = new XMLHttpRequest();
		try {
			xhr.open("HEAD", url, false);
			xhr.send(null);
			return (xhr.status==404) ? false : true;
		} catch(e) { return true; }
	};		
	
	this.detectFlash = function(required, max)
	{
		var required_version = required;
		var max_version = max;
		var available_version = 0;

		/* this section is for NS, Mozilla, Firefox and similar Browsers */
		if(typeof(navigator.plugins["Shockwave Flash"]) == "object")
		{
			var description = navigator.plugins["Shockwave Flash"].description;
			available_version = description.substr(16, (description.indexOf(".", 16) - 16));
		}
		else if(typeof(ActiveXObject) == "function") {
			for(var i = 10; i < (max_version + 1); i ++) {
				try {
					if(typeof(new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + i)) == "object") {
						available_version = i+1;
					}
			   }
			   catch(error){}
			}
		}
	
		return [available_version, required_version];
	};
	
	this.createInitFailedDiv = function(x3dElem) {
		var div = document.createElement('div');
        div.setAttribute("id", "x3dom-create-init-failed");
		div.style.width = x3dElem.getAttribute("width");;
		div.style.height = x3dElem.getAttribute("height");;
		div.style.backgroundColor = "#C00";
		div.style.color = "#FFF";
		div.style.fontSize = "20px";
		div.style.fontWidth = "bold";
		div.style.padding = "10px 10px 10px 10px";
		div.style.display = "inline-block";
		div.style.fontFamily = "Helvetica";
		div.style.textAlign = "center";
		
		div.appendChild(document.createTextNode('Your Browser does not support X3DOM'));
		div.appendChild(document.createElement('br'));
		div.appendChild(document.createTextNode('Read more about Browser support on:'));
		div.appendChild(document.createElement('br'));
		
		var link = document.createElement('a');
		link.setAttribute('href', 'http://www.x3dom.org/?page_id=9');
		link.appendChild( document.createTextNode('X3DOM | Browser Support'));
		div.appendChild(link);

        // check if "altImg" is specified on x3d element and if so use it as background
        altImg = x3dElem.getAttribute("altImg") || null;
        if (altImg) {
            altImgObj = new Image();
            altImgObj.src = altImg;
            div.style.backgroundImage = "url("+altImg+")";
            div.style.backgroundRepeat = "no-repeat"
            div.style.backgroundPosition = "50% 50%"
        }

        x3dElem.appendChild(div);




        x3dom.debug.logError("Your Browser does not support X3DOM!");
	}

	this.createFlashObject = function(x3dElem) {
	
		var result = this.detectFlash(11, 11);
		
		if( !result[0] || result[0] < result[1]) {
			return null;
		} else {
		
			x3dom.debug.logInfo("Creating FlashObject for (X)3D element...");
			
			//Get X3D-Element ID
			var id = x3dElem.getAttribute("id");
			if (id !== null) {
				id = "x3dom-" + id + "-object";
			} else {
				var index = new Date().getTime();
				id = "x3dom-" + index + "-object";
			}

			//Get SWFPath
			var swf_path = x3dElem.getAttribute("swfpath");
			if (swf_path === null) {
				swf_path = "x3dom.swf";
			}
			
			if( !this.fileExists(swf_path) )
			{
				swf_path = "http://www.x3dom.org/download/x3dom.swf";
				x3dom.debug.logWarning("Can't find local x3dom.swf. X3DOM now using the online version from x3dom.org."); 
			}

			//Get width from x3d-Element or set default
			var width = x3dElem.getAttribute("width");
			if( width == null ) {
				width = 550;
			}else{
				var idx = width.indexOf("px");
				if( idx != -1 ) {
					width = width.substr(0, idx);
				}
			}
			//Get height from x3d-Element or set default
			var height = x3dElem.getAttribute("height");
			if( height == null ) {
				height = 400;
			}else{
				var idx = height.indexOf("px");
				if( idx != -1 ) {
					height = height.substr(0, idx);
				}
			}

			var obj = document.createElement('object');
			obj.setAttribute('width', width);
			obj.setAttribute('height', height);
			obj.setAttribute('id', id);

			this.appendParam(obj, 'menu', 'false');
			this.appendParam(obj, 'quality', 'high');
			this.appendParam(obj, 'wmode', 'gpu');
			this.appendParam(obj, 'allowScriptAccess', 'always');
			this.appendParam(obj, 'flashvars', 'width=' + width + '&height=' + height + '&canvasIdx=' + this.canvasIdx);
			this.appendParam(obj, 'movie', swf_path);

			x3dElem.appendChild(obj);

			if(navigator.appName == "Microsoft Internet Explorer")
				obj.setAttribute('classid', 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000');
			else {
				obj.setAttribute('type', 'application/x-shockwave-flash');
				obj.setAttribute('data', swf_path);
			}

			return obj;
		}
	};

    this.createHTMLCanvas = function(x3dElem)
    {
        x3dom.debug.logInfo("Creating canvas for (X)3D element...");
        var canvas = document.createElement('canvas');
        canvas.setAttribute("class", "x3dom-canvas");

        // check if user wants to style the X3D element
        var userStyle = x3dElem.getAttribute("style");
        if (userStyle) {
            x3dom.debug.logInfo("Inline X3D styles detected");
        }

        // check if user wants to attach events to the X3D element
        var evtArr = [
            "onmousedown",
            "onmousemove",
            "onmouseout",
            "onmouseover",
            "onmouseup",
            "onclick",
            "ondblclick",
            "onkeydown",
            "onkeypress",
            "onkeyup",

            // w3c touch: http://www.w3.org/TR/2011/WD-touch-events-20110505/
            "ontouchstart",
            "ontouchmove",
            "ontouchend",
            "ontouchcancel",
            "ontouchleave",
			"ontouchenter",
            
            // apple gestures
            "ongesturestart",
            "ongesturechange",
            "ongestureend",

            // mozilla touch
            "MozTouchDown",
            "MozTouchMove",
            "MozTouchUp"
        ];

        // TODO; handle attribute event handlers dynamically during runtime
        for (var i=0; i < evtArr.length; i++)
        {
            var evtName = evtArr[i];
            var userEvt = x3dElem.getAttribute(evtName);
            if (userEvt) {
                x3dom.debug.logInfo(evtName +", "+ userEvt);
                canvas.setAttribute(evtName, userEvt);
            }
        }

        // workaround since one cannot find out which handlers are registered
        if (!x3dElem.__addEventListener && !x3dElem.__removeEventListener)
        {
            x3dElem.__addEventListener = x3dElem.addEventListener;
            x3dElem.__removeEventListener = x3dElem.removeEventListener;

            // helpers to propagate the element's listeners
            x3dElem.addEventListener = function(type, func, phase) {
                var j, found = false;
                for (j=0; j < evtArr.length && !found; j++) {
                    if (evtArr[j] === type) {
                        found = true;
                    }
                }

                if (found) {
                    x3dom.debug.logInfo('addEventListener for div.on' + type);
                    that.canvas.addEventListener(type, func, phase);
                } else {
                    x3dom.debug.logInfo('addEventListener for X3D.on' + type);
                    this.__addEventListener(type, func, phase);
                }
            };

            x3dElem.removeEventListener = function(type, func, phase) {
                var j, found = false;
                for (j=0; j<evtArr.length && !found; j++) {
                    if (evtArr[j] === type) {
                        found = true;
                    }
                }

                if (found) {
                    x3dom.debug.logInfo('removeEventListener for div.on' + type);
                    that.canvas.removeEventListener(type, func, phase);
                } else {
                    x3dom.debug.logInfo('removeEventListener for X3D.on' + type);
                    this.__removeEventListener(type, func, phase);
                }
            };
        }

        x3dElem.appendChild(canvas);

        // If the X3D element has an id attribute, append "_canvas"
        // to it and and use that as the id for the canvas
        var id = x3dElem.getAttribute("id");
        if (id !== null) {
            canvas.id = "x3dom-" + id + "-canvas";
        } else {
            // If the X3D element does not have an id... do what?
            // For now check the date for creating a (hopefully) unique id
            var index = new Date().getTime();
            canvas.id = "x3dom-" + index + "-canvas";
        }

        // Apply the width and height of the X3D element to the canvas
        var w = 2, h = 2;

        if ((w = x3dElem.getAttribute("width")) !== null) {
            //Attention: pbuffer dim is _not_ derived from style attribs!
            if (w.indexOf("%") >= 0) {
				x3dom.debug.logWarning("The width attribute is to be specified in pixels.");
			}
            canvas.style.width = w;
            canvas.setAttribute("width", w);
        }

        if ((h = x3dElem.getAttribute("height")) !== null) {
            //Attention: pbuffer dim is _not_ derived from style attribs!
            if (h.indexOf("%") >= 0) {
				x3dom.debug.logWarning("The height attribute is to be specified in pixels.");
			}
            canvas.style.height = h;
            canvas.setAttribute("height", h);
        }

        // http://snook.ca/archives/accessibility_and_usability/elements_focusable_with_tabindex
        canvas.setAttribute("tabindex", "0");
       // canvas.focus(); ???why - it is necessary - makes touch events break???
        
        return canvas;
    };

    var _old_dim = [0,0];
    this.watchForResize = function() {

        var new_dim = [
            x3dom.getStyle(that.canvas, "width"),
            x3dom.getStyle(that.canvas, "height")
        ];

        if ((_old_dim[0] != new_dim[0]) || (_old_dim[1] != new_dim[1])) {
            _old_dim = new_dim;
            that.x3dElem.setAttribute("width", new_dim[0]);
            that.x3dElem.setAttribute("height", new_dim[1]);
        }
    };

    this.createStatDiv = function() {
        var statDiv = document.createElement('div');
        statDiv.setAttribute("class", "x3dom-statdiv");
        statDiv.innerHTML = "0 fps";

        statDiv.oncontextmenu = statDiv.onmousedown = function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.returnValue = false;
            return false;
        };
        return statDiv;
    };

    this.createProgressDiv = function() {
        var progressDiv = document.createElement('div');
        progressDiv.setAttribute("class", "x3dom-progress");

        var _text = document.createElement('strong');
        _text.appendChild(document.createTextNode('Loading...'));
        progressDiv.appendChild(_text);

        var _inner = document.createElement('span');
        _inner.setAttribute('style', "width: 25%;");
        _inner.appendChild(document.createTextNode(' '));  // this needs to be a protected whitespace
        progressDiv.appendChild(_inner);

        progressDiv.oncontextmenu = progressDiv.onmousedown = function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.returnValue = false;
            return false;
        };
        return progressDiv;
    };


	//Need for WebKit Browser
	this.isFlashReady = false;

    this.x3dElem = x3dElem;
	
	this.backend = this.x3dElem.getAttribute('backend');
	if (this.backend)
	    this.backend = this.backend.toLowerCase()
	else
	    this.backend = 'none';

    if (this.backend == 'flash') {
		this.backend = 'flash';
		this.canvas = this.createFlashObject(x3dElem);
		if (this.canvas != null) {
			this.canvas.parent = this;
			this.gl = this.initFlashContext(this.canvas);
		} else {
			this.createInitFailedDiv(x3dElem);
			return null;
		}
	} else {
		this.canvas = this.createHTMLCanvas(x3dElem);
		this.canvas.parent = this;
		this.gl = this.initContext(this.canvas, (this.backend.search("desktop") >= 0));
		this.backend = 'webgl';
		if (this.gl == null)
		{
			x3dom.debug.logInfo("Fallback to Flash Renderer");
			this.backend = 'flash';
			this.canvas = this.createFlashObject(x3dElem);
			if (this.canvas != null) {
				this.canvas.parent = this;
				this.gl = this.initFlashContext(this.canvas);
			} else {
				this.createInitFailedDiv(x3dElem);
				return null;
			}
		}
	}
	
	x3dom.caps.BACKEND = this.backend;

	this.fps_t0 = new Date().getTime();
    this.doc = null;

    // allow listening for (size) changes
    x3dElem.__setAttribute = x3dElem.setAttribute;
    x3dElem.setAttribute = function(attrName, newVal) {
        this.__setAttribute(attrName, newVal);

        switch(attrName) {

            case "width":
                that.canvas.setAttribute("width", newVal);
                if (that.doc._viewarea) {
                    that.doc._viewarea._width = parseInt(that.canvas.getAttribute("width"), 0);
                }
                break;

            case "height":
                that.canvas.setAttribute("height", newVal);
                if (that.doc._viewarea) {
                    that.doc._viewarea._height = parseInt(that.canvas.getAttribute("height"), 0);
                }
                break;

            default:
        }

        that.doc.needRender = true;
    };

    var runtimeEnabled = x3dElem.getAttribute("runtimeEnabled");

    if (runtimeEnabled !== null) {
        this.hasRuntime = (runtimeEnabled.toLowerCase() == "true");
    } else {
        this.hasRuntime = x3dElem.hasRuntime;
    }

    if (this.gl === null) {
        this.hasRuntime = false;
    }

    this.showStat = x3dElem.getAttribute("showStat");
    this.statDiv = this.createStatDiv();
    this.statDiv.style.display = (this.showStat !== null && this.showStat == "true") ? "inline" : "none";
    this.x3dElem.appendChild(this.statDiv);
    
    this.showProgress = x3dElem.getAttribute("showProgress");
    this.progressDiv = this.createProgressDiv();
    this.progressDiv.style.display = (this.showProgress !== null && this.showProgress == "true") ? "inline" : "none";
    this.x3dElem.appendChild(this.progressDiv);
    
    this.showTouchpoints = x3dElem.getAttribute("showTouchpoints");
    this.showTouchpoints = this.showTouchpoints ? !(this.showTouchpoints.toLowerCase() == "false") : true;
    //this.showTouchpoints = this.showTouchpoints ? (this.showTouchpoints.toLowerCase() == "true") : false;

    this.disableTouch = x3dElem.getAttribute("disableTouch");
    this.disableTouch = this.disableTouch ? (this.disableTouch.toLowerCase() == "true") : false;
    
    
    if (this.canvas !== null && this.gl !== null && this.hasRuntime && this.backend !== "flash") {
        // event handler for mouse interaction
        this.canvas.mouse_dragging = false;
        this.canvas.mouse_button = 0;
        this.canvas.mouse_drag_x = 0;
        this.canvas.mouse_drag_y = 0;

        this.canvas.isMulti = false;

        this.canvas.oncontextmenu = function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.returnValue = false;
            return false;
        };
        
        // TODO: handle context lost events properly
        this.canvas.addEventListener("webglcontextlost", function(event) {
            x3dom.debug.logWarning("WebGL context lost");
            event.preventDefault();
        }, false);
        
        this.canvas.addEventListener("webglcontextrestored", function(event) {
            x3dom.debug.logError("recover WebGL state and resources on context lost NYI");
            event.preventDefault();
        }, false);
        
        
        // Mouse Events
        this.canvas.addEventListener('mousedown', function (evt) {
			if(!this.isMulti) {
				this.focus();
				
				switch(evt.button) {
					case 0:  this.mouse_button = 1; break;  //left
					case 1:  this.mouse_button = 4; break;  //middle
					case 2:  this.mouse_button = 2; break;  //right
					default: this.mouse_button = 0; break;
				}
				
				if (evt.shiftKey) { this.mouse_button = 1; }
				if (evt.ctrlKey)  { this.mouse_button = 4; }
				if (evt.altKey)   { this.mouse_button = 2; }
				
				var pos = this.parent.mousePosition(evt);
				this.mouse_drag_x = pos.x;
				this.mouse_drag_y = pos.y;
				
				this.mouse_dragging = true;
				
				this.parent.doc.onMousePress(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);

        this.canvas.addEventListener('mouseup', function (evt) {
			if(!this.isMulti) {
				this.mouse_button = 0;
				this.mouse_dragging = false;

				this.parent.doc.onMouseRelease(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);

        this.canvas.addEventListener('mouseover', function (evt) {
			if(!this.isMulti) {
				this.mouse_button = 0;
				this.mouse_dragging = false;

				this.parent.doc.onMouseOver(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);

        this.canvas.addEventListener('mouseout', function (evt) {
			if(!this.isMulti) {
				this.mouse_button = 0;
				this.mouse_dragging = false;

				this.parent.doc.onMouseOut(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);

        this.canvas.addEventListener('dblclick', function (evt) {
			if(!this.isMulti) {
				this.mouse_button = 0;
				
				var pos = this.parent.mousePosition(evt);
				this.mouse_drag_x = pos.x;
				this.mouse_drag_y = pos.y;
				
				this.mouse_dragging = false;

				this.parent.doc.onDoubleClick(that.gl, this.mouse_drag_x, this.mouse_drag_y);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);

        this.canvas.addEventListener('mousemove', function (evt) {
			if(!this.isMulti) {

				if (evt.shiftKey) { this.mouse_button = 1; }
				if (evt.ctrlKey)  { this.mouse_button = 4; }
				if (evt.altKey)   { this.mouse_button = 2; }
           
				var pos = this.parent.mousePosition(evt);
				this.mouse_drag_x = pos.x;
              	this.mouse_drag_y = pos.y; 
				
				if (this.mouse_dragging) {
					this.parent.doc.onDrag(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				}
				else {
					this.parent.doc.onMove(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				}
			    
				this.parent.doc.needRender = true;
				
				// deliberately different for performance reasons
				evt.preventDefault();
				evt.stopPropagation();
				evt.returnValue = false;
			}
        }, false);

        this.canvas.addEventListener('DOMMouseScroll', function (evt) {
			if(!this.isMulti) {
				this.mouse_drag_y += 2 * evt.detail;

				this.parent.doc.onDrag(that.gl, this.mouse_drag_x, this.mouse_drag_y, 2);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);

        this.canvas.addEventListener('mousewheel', function (evt) {
			if(!this.isMulti) {
				this.mouse_drag_y -= 0.1 * evt.wheelDeltaY;

				this.parent.doc.onDrag(that.gl, this.mouse_drag_x, this.mouse_drag_y, 2);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);


        // Key Events
        this.canvas.addEventListener('keypress', function (evt) {
            var keysEnabled = this.parent.x3dElem.getAttribute("keysEnabled");
            if (!keysEnabled || keysEnabled.toLowerCase() == "true") {
                this.parent.doc.onKeyPress(evt.charCode);
            }
            this.parent.doc.needRender = true;
            evt.returnValue = true;
        }, true);

        // in webkit special keys are only handled on key-up
        this.canvas.addEventListener('keyup', function (evt) {
            var keysEnabled = this.parent.x3dElem.getAttribute("keysEnabled");
            if (!keysEnabled || keysEnabled.toLowerCase() == "true") {
                this.parent.doc.onKeyUp(evt.keyCode);
            }
            this.parent.doc.needRender = true;
            evt.returnValue = true;
        }, true);

        this.canvas.addEventListener('keydown', function (evt) {
            var keysEnabled = this.parent.x3dElem.getAttribute("keysEnabled");
            if (!keysEnabled || keysEnabled.toLowerCase() == "true") {
                this.parent.doc.onKeyDown(evt.keyCode);
            }
            this.parent.doc.needRender = true;
            evt.returnValue = true;
        }, true);


        // Multitouch Events
        var touches =
        {
          numTouches : 0,
          
          firstTouchTime: new Date().getTime(),
          firstTouchPoint: new x3dom.fields.SFVec2f(0,0),
          
          lastDrag : new x3dom.fields.SFVec2f(),
          
          lastMiddle : new x3dom.fields.SFVec2f(),
          lastDistance : new x3dom.fields.SFVec2f(),
          lastSquareDistance : 0,
          lastAngle : 0,
		  lastLayer : new Array(),
          
          calcAngle : function(vector)
          {
            var rotation = vector.normalize().dot(new x3dom.fields.SFVec2f(1,0));
            rotation = Math.acos(rotation);
            
            if(vector.y < 0)
              rotation = Math.PI + (Math.PI - rotation);
              
            return rotation;
          },

          disableTouch: this.disableTouch,
          // set a mark in HTML so we can track the position of the finger visually
          visMarker: this.showTouchpoints,
          visMarkerBag: new Array(),
          
          visualizeTouches: function(evt, cleanup)
          {
              if (!this.visMarker)
                  return;

              var touchBag = [];
              var marker = null;
              
              for (var i=0; i<evt.touches.length; i++) {
                  var id = evt.touches[i].identifier || evt.touches[i].streamId;
                  if (!id) id = 0;
                  
                  var index = this.visMarkerBag.indexOf(id);
                  
                  if (index >= 0) {
                      marker = document.getElementById("visMarker" + id);

                      marker.style.left = (evt.touches[i].pageX) + "px";
                      marker.style.top  = (evt.touches[i].pageY) + "px";
                  }
                  else {
                      marker = document.createElement("div");
                      
        			  marker.appendChild(document.createTextNode("#" + id));
        			  marker.id = "visMarker" + id;
        			  marker.className = "x3dom-touch-marker";
        			  document.body.appendChild(marker);
        			  
        			  index = this.visMarkerBag.length;
        			  this.visMarkerBag[index] = id;
                  }
                  
                  touchBag.push(id);
              }
              
              for (var j=this.visMarkerBag.length-1; j>=0; j--) {
                  var oldId = this.visMarkerBag[j];
                  
                  if (touchBag.indexOf(oldId) < 0) {
                      this.visMarkerBag.splice(j, 1);
                      marker = document.getElementById("visMarker" + oldId);
                      document.body.removeChild(marker);
                  }
              }
          }
        };
        
        // Mozilla Touches
        var mozilla_ids = [];
		
        var mozilla_touches = 
        {
          touches : [],
          preventDefault : function() {}
        };
        
        // === Touch Start ===
        var touchStartHandler = function(evt, doc)
        {
            this.isMulti = true;
			evt.preventDefault();
			touches.visualizeTouches(evt);
			
			if (doc == null)
				doc = this.parent.doc;
			
			touches.lastLayer = [];
		
			for(var i = 0; i < evt.touches.length; i++) {
				var pos = this.parent.mousePosition(evt.touches[i]);
				touches.lastLayer.push(new Array(evt.touches[i].identifier, new x3dom.fields.SFVec2f(pos.x,pos.y)));
			}
           
			if(touches.numTouches < 1 && evt.touches.length == 1) {
			
				touches.numTouches = 1;
				touches.lastDrag = new x3dom.fields.SFVec2f(evt.touches[0].screenX, evt.touches[0].screenY);
			} else if(touches.numTouches < 2 && evt.touches.length >= 2) {
			
				touches.numTouches = 2;
            
				var touch0 = new x3dom.fields.SFVec2f(evt.touches[0].screenX, evt.touches[0].screenY);
				var touch1 = new x3dom.fields.SFVec2f(evt.touches[1].screenX, evt.touches[1].screenY);
            
				var distance = touch1.subtract(touch0);
				var middle = distance.multiply(0.5).add(touch0);
				var squareDistance = distance.dot(distance);
            
				touches.lastDistance = distance;
				touches.lastMiddle = middle;
				touches.lastSquareDistance = squareDistance;
				touches.lastAngle = touches.calcAngle(distance);
			}
			
			var min = x3dom.fields.SFVec3f.MAX();
			var max = x3dom.fields.SFVec3f.MIN();
		
			if (doc._scene.getVolume(min, max, true)) {
				doc._scene._lastMin = min;
				doc._scene._lastMax = max;
			}
			
			for(var i = 0; i < evt.touches.length; i++) {
				var pos = this.parent.mousePosition(evt.touches[i]);
				doc.onPick(that.gl, pos.x, pos.y);
				doc._viewarea.prepareEvents(pos.x, pos.y, 1, "onmousedown");
				doc._viewarea._pickingInfo.lastClickObj = doc._viewarea._pickingInfo.pickObj;
				doc.needRender = true;
			}            
        };
        
        var touchStartHandlerMoz = function(evt)
        {
			this.isMulti = true;
			evt.preventDefault();
          
			var new_id = true;
			for(var i=0; i<mozilla_ids.length; ++i)
				if(mozilla_ids[i] == evt.streamId)
					new_id = false;
              
			if(new_id == true) {		
				evt.identifier = evt.streamId;
				mozilla_ids.push(evt.streamId);
				mozilla_touches.touches.push(evt);
			}
			touchStartHandler(mozilla_touches, this.parent.doc);
        };
        
        // === Touch Move ===
        var touchMoveHandler = function(evt, doc)
        {
			evt.preventDefault();
			touches.visualizeTouches(evt);
			
			if (doc == null)
				doc = this.parent.doc;

			// one finger: x/y rotation
			if(evt.touches.length == 1) {
				var currentDrag = new x3dom.fields.SFVec2f(evt.touches[0].screenX, evt.touches[0].screenY);
								
				var deltaDrag = currentDrag.subtract(touches.lastDrag);
				touches.lastDrag = currentDrag;
				
				var mx = x3dom.fields.SFMatrix4f.rotationY(deltaDrag.x / 100);
				var my = x3dom.fields.SFMatrix4f.rotationX(deltaDrag.y / 100);
				var rotMatrix = mx.mult(my);
				
				doc.onMoveView(that.gl, null, rotMatrix);
				doc.needRender = true;
			}
			// two fingers: scale, translation, rotation around view (z) axis
			else if(evt.touches.length >= 2) {
				var touch0 = new x3dom.fields.SFVec2f(evt.touches[0].screenX, evt.touches[0].screenY);
				var touch1 = new x3dom.fields.SFVec2f(evt.touches[1].screenX, evt.touches[1].screenY);
            
				var distance = touch1.subtract(touch0);
				var middle = distance.multiply(0.5).add(touch0);
				var squareDistance = distance.dot(distance);
            
				var deltaMiddle = middle.subtract(touches.lastMiddle);
				var deltaZoom = squareDistance - touches.lastSquareDistance;
            
				var deltaMove = new x3dom.fields.SFVec3f(
            		 deltaMiddle.x / screen.width,
            		-deltaMiddle.y / screen.height,
              		 deltaZoom / (screen.width * screen.height * 0.2));
			
				var rotation = touches.calcAngle(distance);
				var angleDelta = touches.lastAngle - rotation;
				touches.lastAngle = rotation;

				var rotMatrix = x3dom.fields.SFMatrix4f.rotationZ(angleDelta);

				touches.lastMiddle = middle;
				touches.lastDistance = distance;
				touches.lastSquareDistance = squareDistance;

				doc.onMoveView(that.gl, deltaMove, rotMatrix);
				doc.needRender = true;
			}
        };
        
        var touchMoveHandlerMoz = function(evt)
        {
			evt.preventDefault();
          
			for(var i=0; i<mozilla_ids.length; ++i)
				if(mozilla_ids[i] == evt.streamId)
					mozilla_touches.touches[i] = evt;
          
			touchMoveHandler(mozilla_touches, this.parent.doc);
        };
        
        // === Touch end ===
        var touchEndHandler = function(evt, doc)
        {
            this.isMulti = false;
			evt.preventDefault();
			touches.visualizeTouches(evt);
			
			if (doc == null)
				doc = this.parent.doc;
          
			// reinit first finger for rotation
			if (touches.numTouches == 2 && evt.touches.length == 1)
				touches.lastDrag = new x3dom.fields.SFVec2f(evt.touches[0].screenX, evt.touches[0].screenY);
			
			var dblClick = false;
			
			if (evt.touches.length < 2) {
			    if (touches.numTouches == 1)
			        dblClick = true;
			    touches.numTouches = evt.touches.length;
			}
			
			for(var i = 0; i < touches.lastLayer.length; i++) {
				var pos = touches.lastLayer[i][1];
				
				doc.onPick(that.gl, pos.x, pos.y);
				
				doc._viewarea.prepareEvents(pos.x, pos.y, 1, "onmouseup");
				doc._viewarea._pickingInfo.lastClickObj = doc._viewarea._pickingInfo.pickObj;
				
				// click means that mousedown _and_ mouseup were detected on same element
				if (doc._viewarea._pickingInfo.pickObj &&
					doc._viewarea._pickingInfo.pickObj ===
					doc._viewarea._pickingInfo.lastClickObj) {
					
					doc._viewarea.prepareEvents(pos.x, pos.y, 1, "onclick");	
				}
			}
			
            if (dblClick) {
                var now = new Date().getTime();
                var dist = touches.firstTouchPoint.subtract(touches.lastDrag).length();

                if (dist < 18 && now - touches.firstTouchTime < 180)
                    doc.onDoubleClick(that.gl, 0, 0);

                touches.firstTouchTime = now;
                touches.firstTouchPoint = touches.lastDrag;
            }
			
			doc.needRender = true;
        };
        
        var touchEndHandlerMoz = function(evt)
        {
			this.isMulti = false;
			evt.preventDefault();
          
			var remove_index = -1;
			for(var i=0; i<mozilla_ids.length; ++i)
				if(mozilla_ids[i] == evt.streamId)
					remove_index = i;
              
			if(remove_index != -1)
			{
				mozilla_ids.splice(remove_index, 1);
				mozilla_touches.touches.splice(remove_index, 1);
			}
          
			touchEndHandler(mozilla_touches, this.parent.doc);
        };

        if (!this.disableTouch)
        {
            // mozilla touch events
            this.canvas.addEventListener('MozTouchDown',  touchStartHandlerMoz, true);
            this.canvas.addEventListener('MozTouchMove',  touchMoveHandlerMoz,  true);
            this.canvas.addEventListener('MozTouchUp',    touchEndHandlerMoz,   true);

            // w3c / apple touch events (in Chrome via chrome://flags)
            this.canvas.addEventListener('touchstart',    touchStartHandler, true);
            this.canvas.addEventListener('touchmove',     touchMoveHandler,  true);
            this.canvas.addEventListener('touchend',      touchEndHandler,   true);
        }
    }
    
    /** Helper that converts a point from node coordinates to page coordinates 
        FIXME: does NOT work when x3dom.css is not included so that x3d element is not floating
    */
    this.mousePosition = function(evt)
    {
        var convertPoint = window.webkitConvertPointFromNodeToPage;
        var x = 0, y = 0;

        if ( "getBoundingClientRect" in document.documentElement ) {
            var elem = evt.target.offsetParent;    // should be x3dElem
    		var box = elem.getBoundingClientRect();
    		
    		var scrolleft =  window.pageXOffset || document.body.scrollLeft;
    		var scrolltop =  window.pageYOffset || document.body.scrollTop;
            
    		var paddingLeft = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('padding-left'));
    		var borderLeftWidth = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('border-left-width'));
            
    		var paddingTop = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('padding-top'));
    		var borderTopWidth = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('border-top-width'));
    		
    		x = Math.round(evt.pageX - (box.left + paddingLeft + borderLeftWidth + scrolleft));
    		y = Math.round(evt.pageY - (box.top + paddingTop + borderTopWidth + scrolltop));
        }
        else if (convertPoint) {
            var point = convertPoint(evt.target, new WebKitPoint(0, 0));

            x = Math.round(point.x);
            y = Math.round(point.y);
        }
        else {
    		x3dom.debug.logError('NO getBoundingClientRect, NO webkitConvertPointFromNodeToPage');
    	}
    	
    	return new x3dom.fields.SFVec2f(x, y);
    };
};

x3dom.X3DCanvas.prototype.tick = function()
{
    var d = new Date().getTime();
    var fps = 1000.0 / (d - this.fps_t0);

    this.fps_t0 = d;

    try {
        this.doc.advanceTime(d / 1000);
        var animD = new Date().getTime() - d;

        if (this.doc.needRender) {

            if (this.x3dElem.runtime.isReady == true) {
                this.x3dElem.runtime.enterFrame();
            } else {
                this.x3dElem.runtime.ready();
                this.x3dElem.runtime.isReady = true;
                this.x3dElem.runtime.enterFrame();
            }

            if (this.statDiv) {
                this.statDiv.textContent = fps.toFixed(2) + ' fps';
                this.statDiv.appendChild(document.createElement("br"));
                this.statDiv.appendChild(document.createTextNode("anim: " + animD));
            }

            if (this.backend == 'flash') {
				if (this.isFlashReady) {
					this.canvas.setFPS({fps: fps});
					this.doc.needRender = false;    // picking might require another pass
					this.doc.render(this.gl);
				}
			} else{
				this.doc.needRender = false;    // picking might require another pass
				this.doc.render(this.gl);
			}

		}

        if (this.statDiv || this.progressDiv) {
            if (this.statDiv && this.doc.downloadCount) {
                if (this.doc.needRender)
                {
                    this.statDiv.appendChild(document.createElement("br"));
                    this.statDiv.appendChild(document.createTextNode("#Loading: " + this.doc.downloadCount));
                }
                else {
                    this.statDiv.textContent = "#Loading: " + this.doc.downloadCount;
                }
            }

            if (this.doc.properties.getProperty("showProgress") !== 'false') {
                if (this.progressDiv) {
                    this.progressDiv.childNodes[0].textContent = 'Loading: ' + (+this.doc.downloadCount);
                    if (this.doc.downloadCount > 0) {
                        this.progressDiv.style.display = 'inline';
                    } else {
                        this.progressDiv.style.display = 'none';
                    }

                    // TODO: fix these strange window-bound scope issues!
                    window.myThat = this;
                    window.myStopProgress = function stopProgress() {
                        window.myThat.doc.downloadCount = 0;
                        window.myThat.progressDiv.style.display = 'none';
                    };
                    window.setTimeout("window.myStopProgress()", 1500);
                }
            } else {
                this.progressDiv.style.display = 'none';
            }

        }

    } catch (e) {
        x3dom.debug.logException(e);
        throw e;
    }
};

/** Loads the given @p uri.
    @param uri can be a uri or an X3D node
    */
x3dom.X3DCanvas.prototype.load = function(uri, sceneElemPos, settings) {
    this.doc = new x3dom.X3DDocument(this.canvas, this.gl, settings);
    var x3dCanvas = this;

    this.doc.onload = function () {
        x3dom.debug.logInfo("loaded '" + uri + "'");
		
        if (x3dCanvas.hasRuntime) {

			// requestAnimationFrame https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/demos/common/webgl-utils.js
			(function mainloop(){
                x3dCanvas.watchForResize();
        		x3dCanvas.tick();
			    window.requestAnimFrame(mainloop, x3dCanvas);
		    })();

        } else {
            x3dCanvas.tick();
        }
    };

    this.x3dElem.render = function() {
        if (x3dCanvas.hasRuntime) {
            x3dCanvas.doc.needRender = true;
        } else {
            x3dCanvas.doc.render(x3dCanvas.gl);
        }
    };

    this.x3dElem.context = x3dCanvas.gl.ctx3d;

    this.doc.onerror = function () {
        alert('Failed to load X3D document');
    };

    this.doc.load(uri, sceneElemPos);
};
