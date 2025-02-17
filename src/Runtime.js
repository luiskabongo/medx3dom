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
 * Class: x3dom.runtime
 *
 * Runtime proxy object to get and set runtime parameters. This object
 * is attached to each X3D element and can be used in the following manner:
 *
 * > var e = document.getElementById('the_x3delement');
 * > e.runtime.showAll();
 * > e.runtime.resetView();
 * > ...
 */

// Global runtime
x3dom.runtime = {};


x3dom.Runtime = function(doc, canvas) {
    this.doc = doc;
    this.canvas = canvas;
    this.isReady = false;
};

x3dom.Runtime.prototype.initialize = function(doc, canvas) {
    this.doc = doc;
    this.canvas = canvas;

    // place to hold configuration data, i.e. flash backend path, etc.
    // format and structure needs to be decided.
    this.config = {};
    this.isReady = false;
};


/**
 * APIFunction: ready
 *
 * This method is called once the system initialized and is ready to render
 * the first time. It is therefore possible to execute custom
 * action by overriding this method in your code:
 *
 * > x3dom.runtime.ready = function() {
 * >    alert("About to render something the first time");
 * > }
 *
 * It is important to create this override before the document onLoad event has fired.
 * Therefore putting it directly under the inclusion of x3dom.js is the preferred
 * way to ensure overloading of this function.
 *
 * Parameters:
 * 		element - The x3d element this handler is acting upon
 */
x3dom.Runtime.prototype.ready = function() {
    x3dom.debug.logInfo('System ready.');
};

/**
 * APIFunction: enterFrame
 *
 * This method is called just before the next frame is
 * rendered. It is therefore possible to execute custom
 * action by overriding this method in your code:
 *
 * > var element = document.getElementById('my_element');
 * > element.runtime.enterFrame = function() {
 *     alert('hello custom enter frame');
 * };
 *
 * If you have more than one X3D element in your HTML
 * During initialization, just after ready() executed and before the very first frame
 * is rendered, only the global override of this method works. If you need to execute
 * code before the first frame renders, it is therefore best to use the ready()
 * function instead.
 *
 * Parameters:
 * 		element - The x3d element this handler is acting upon
 */
x3dom.Runtime.prototype.enterFrame = function() {
    //x3dom.debug.logInfo('Render frame imminent');
    // to be overwritten by user
},

/**
 * APIFunction: getActiveBindable
 *
 * Returns the currently active bindable DOM element of the given type.
 * typeName must be a valid Bindable node (e.g. Viewpoint, Background, etc.).
 *
 * For example:
 *
 *   > var element, bindable;
 *   > element = doucment.getElementById('the_x3delement');
 *   > bindable = element.runtime.getActiveBindable('background');
 *   > bindable.setAttribute('bind', 'false');
 *
 * Parameters:
 * 		typeName - bindable type name
 *
 * Returns:
 * 		The active DOM element
 */
x3dom.Runtime.prototype.getActiveBindable = function(typeName) {
    var stacks;
    var i, current, result;
    var type;

    stacks = this.canvas.doc._bindableBag._stacks;
    result = [];

    type = x3dom.nodeTypesLC[typeName.toLowerCase()];

    if (!type) {
        x3dom.debug.logError('No node of type "' + typeName + '" found');
        return null;
    }

    for (i=0; i < stacks.length; i++) {
        current = stacks[i].getActive();
            if (current._xmlNode !== undefined && x3dom.isa(current, type) ) {
                result.push(current);
            }
    }
    return result[0] ? result[0]._xmlNode : null;
};

/**
 * APIFunction: nextView
 *
 * Navigates tho the next viewpoint
 *
 */
x3dom.Runtime.prototype.nextView = function() {
    var stack = this.canvas.doc._scene.getViewpoint()._stack;
    if (stack) {
        stack.switchTo('next');
    } else {
        x3dom.debug.logError('No valid ViewBindable stack.');
    }
};

/**
 * APIFunction: prevView
 *
 * Navigates tho the previous viewpoint
 *
 */
x3dom.Runtime.prototype.prevView = function() {
    var stack = this.canvas.doc._scene.getViewpoint()._stack;
    if (stack) {
        stack.switchTo('prev');
    } else {
        x3dom.debug.logError('No valid ViewBindable stack.');
    }
};

/**
 * Function: viewpoint
 *
 * Returns the current viewpoint.
 *
 * Returns:
 * 		The viewpoint
 */
x3dom.Runtime.prototype.viewpoint = function() {
    return this.canvas.doc._scene.getViewpoint();
};

/**
 * Function: viewMatrix
 *
 * Returns the current view matrix.
 *
 * Returns:
 * 		Matrix object
 */
x3dom.Runtime.prototype.viewMatrix = function() {
    return this.canvas.doc._viewarea.getViewMatrix();
};

/**
 * Function: projectionMatrix
 *
 * Returns the current projection matrix.
 *
 * Returns:
 * 		Matrix object
 */
x3dom.Runtime.prototype.projectionMatrix = function() {
    return this.canvas.doc._viewarea.getProjectionMatrix();
};

/**
 * Function: getWorldToCameraCoordinatesMatrix
 *
 * Returns the current world to camera coordinates matrix.
 *
 * Returns:
 * 		Matrix object
 */
x3dom.Runtime.prototype.getWorldToCameraCoordinatesMatrix = function() {
    return this.canvas.doc._viewarea.getWCtoCCMatrix();
};

/**
 * Function: getCameraToWorldCoordinatesMatrix
 *
 * Returns the current camera to world coordinates matrix.
 *
 * Returns:
 * 		Matrix object
 */
x3dom.Runtime.prototype.getCameraToWorldCoordinatesMatrix = function() {
    return this.canvas.doc._viewarea.getCCtoWCMatrix();
};

/**
 * Function: getViewingRay
 *
 * Returns the viewing ray for a given (x, y) position.
 *
 * Returns:
 * 		Line object
 */
x3dom.Runtime.prototype.getViewingRay = function(x, y) {
    return this.canvas.doc._viewarea.calcViewRay(x, y);
};

/**
 * Function: getWidth
 *
 * Returns the width of the canvas element.
 */
x3dom.Runtime.prototype.getWidth = function() {
    return this.canvas.doc._viewarea._width;
};

/**
 * Function: getHeight
 *
 * Returns the width of the canvas element.
 */
x3dom.Runtime.prototype.getHeight = function() {
    return this.canvas.doc._viewarea._height;
};

/**
 * Function: mousePosition
 *
 * Returns the 2d canvas layer position [x, y] for a given mouse event, i.e.,
 * the mouse cursor's x and y positions relative to the canvas (x3d) element.
 */
x3dom.Runtime.prototype.mousePosition = function(event) {
    var pos = this.canvas.mousePosition(event);
    
    return [pos.x, pos.y];
};

/**
 * Function: calcCanvasPos
 *
 * Returns the 2d screen position [cx, cy] for a given point [wx, wy, wz] in world coordinates.
 */
x3dom.Runtime.prototype.calcCanvasPos = function(wx, wy, wz) {
    var pnt = new x3dom.fields.SFVec3f(wx, wy, wz);
    
    var mat = this.canvas.doc._viewarea.getWCtoCCMatrix();
    var pos = mat.multFullMatrixPnt(pnt);
    
    var w = this.canvas.doc._viewarea._width;
    var h = this.canvas.doc._viewarea._height;
    
    var x = Math.round((pos.x + 1) * (w - 1) / 2);
    var y = Math.round((h - 1) * (1 - pos.y) / 2);
    
    return [x, y];
};

/**
 * Function: calcPagePos
 *
 * Returns the 2d page (returns the mouse coordinates relative to the document) position [cx, cy] 
 * for a given point [wx, wy, wz] in world coordinates.
 */
x3dom.Runtime.prototype.calcPagePos = function(wx, wy, wz) {
    var elem = this.canvas.canvas.offsetParent;

    if (!elem) {
        x3dom.debug.logError("Can't calc page pos without offsetParent.");
        return [0, 0];
    }
    
	var canvasPos = elem.getBoundingClientRect();
	var mousePos = this.calcCanvasPos(wx, wy, wz);
	
	var scrollLeft =  window.pageXOffset || document.body.scrollLeft;
	var scrollTop = 	window.pageYOffset || document.body.scrollTop;
	
	var paddingLeft = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('padding-left'));
	var borderLeftWidth = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('border-left-width'));
		
	var paddingTop = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('padding-top'));
	var borderTopWidth = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('border-top-width'));
		
	var x = canvasPos.left + paddingLeft + borderLeftWidth + scrollLeft + mousePos[0];
    var y = canvasPos.top + paddingTop + borderTopWidth + scrollTop + mousePos[1];
    
    return [x, y];
};

/**
 * Function: calcClientPos
 *
 * Returns the 2d client (returns the mouse coordinates relative to the window) position [cx, cy] 
 * for a given point [wx, wy, wz] in world coordinates.
 */
x3dom.Runtime.prototype.calcClientPos = function(wx, wy, wz) {
    var elem = this.canvas.canvas.offsetParent;

    if (!elem) {
        x3dom.debug.logError("Can't calc client pos without offsetParent.");
        return [0, 0];
    }

    var canvasPos = elem.getBoundingClientRect();
    var mousePos = this.calcCanvasPos(wx, wy, wz);
	
	var paddingLeft = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('padding-left'));
	var borderLeftWidth = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('border-left-width'));
		
	var paddingTop = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('padding-top'));
	var borderTopWidth = parseFloat(document.defaultView.getComputedStyle(elem, null).getPropertyValue('border-top-width'));
	
	var x = canvasPos.left + paddingLeft + borderLeftWidth + mousePos[0];
    var y = canvasPos.top + paddingTop + borderTopWidth + mousePos[1];
    
    return [x, y];
};

/**
 * Function: lightMatrix
 *
 * Returns the current light matrix.
 *
 * Returns:
 * 		The light matrix
 */
x3dom.Runtime.prototype.lightMatrix = function() {
    this.canvas.doc._viewarea.getLightMatrix();
};

/**
 * APIFunction: resetView
 *
 * Resets the view to initial.
 *
 */
x3dom.Runtime.prototype.resetView = function() {
    this.canvas.doc._viewarea.resetView();
};

/**
 * Function: lightView
 *
 * Navigates to the first light, if any.
 *
 * Returns:
 * 		True if navigation was possible, false otherwise.
 */
x3dom.Runtime.prototype.lightView = function() {
    if (this.canvas.doc._nodeBag.lights.length > 0) {
        this.canvas.doc._viewarea.animateTo(this.canvas.doc._viewarea.getLightMatrix()[0],
                                            this.canvas.doc._scene.getViewpoint());
        return true;
    } else {
        x3dom.debug.logInfo("No lights to navigate to");
        return false;
    }
};

/**
 * APIFunction: uprightView
 *
 * Navigates to upright view
 *
 */
x3dom.Runtime.prototype.uprightView = function() {
    this.canvas.doc._viewarea.uprightView();
};

/**
 * APIFunction: showAll
 *
 * Zooms so that all objects are fully visible.
 *
 * Parameter:
 *     axis - the axis as string: posX, negX, posY, negY, posZ, negZ
 *
 */
x3dom.Runtime.prototype.showAll = function(axis) {
    this.canvas.doc._viewarea.showAll(axis);
};

/**
 * APIFunction: showObject
 *
 * Zooms so that a given object is fully visible in the middle of the screen.
 *
 * Parameter:
 *     obj  - the scene-graph element on which to focus
 */
x3dom.Runtime.prototype.showObject = function(obj) {
    var min = x3dom.fields.SFVec3f.MAX();
    var max = x3dom.fields.SFVec3f.MIN();

    if (obj && obj._x3domNode &&
        obj._x3domNode.getVolume(min, max, true))
    {
        var mat = obj._x3domNode.getCurrentTransform();

        min = mat.multMatrixPnt(min);
        max = mat.multMatrixPnt(max);

        // assume FOV_smaller as camera's fovMode
        var focalLen = (this.canvas.doc._viewarea._width < this.canvas.doc._viewarea._height) ?
                        this.canvas.doc._viewarea._width : this.canvas.doc._viewarea._height;

        var n0 = new x3dom.fields.SFVec3f(0, 0, 1);    // facingDir
        var viewpoint = this.canvas.doc._scene.getViewpoint();
        var fov = viewpoint.getFieldOfView() / 2.0;
        var ta = Math.tan(fov);

        if (Math.abs(ta) > x3dom.fields.Eps) {
            focalLen /= ta;
        }

        var w = this.canvas.doc._viewarea._width - 1;
        var h = this.canvas.doc._viewarea._height - 1;

        var frame = 0.25;
        var minScreenPos = new x3dom.fields.SFVec2f(frame * w, frame * h);

        frame = 0.75;
        var maxScreenPos = new x3dom.fields.SFVec2f(frame * w, frame * h);

        var dia2 = max.subtract(min).multiply(0.5);     // half diameter
        var rw = dia2.length();                         // approx radius

        var pc = min.add(dia2);                         // center in wc
        var vc = maxScreenPos.subtract(minScreenPos).multiply(0.5);

        var rs = 1.5 * vc.length();
        vc = vc.add(minScreenPos);

        var dist = 1.0;
        if (rs > x3dom.fields.Eps) {
            dist = (rw / rs) * Math.sqrt(vc.x*vc.x + vc.y*vc.y + focalLen*focalLen);
        }

        n0 = mat.multMatrixVec(n0).normalize();
        n0 = n0.multiply(dist);
        var p0 = pc.add(n0);

        var qDir = x3dom.fields.Quaternion.rotateFromTo(new x3dom.fields.SFVec3f(0, 0, 1), n0);
        var R = qDir.toMatrix();

        var T = x3dom.fields.SFMatrix4f.translation(p0.negate());
        var M = x3dom.fields.SFMatrix4f.translation(p0);

        M = M.mult(R).mult(T).mult(M);
        var viewmat = M.inverse();

        this.canvas.doc._viewarea.animateTo(viewmat, viewpoint);
    }
};

/**
 * APIMethod getCenter
 *
 * Returns the center of a X3DShapeNode or X3DGeometryNode.
 *
 * Parameters:
 *    domNode: the node for which its center shall be returned
 *
 *  Returns:
 *    Node center (or null if no Shape or Geometry)
 */
x3dom.Runtime.prototype.getCenter = function(domNode) {
    if (domNode && domNode._x3domNode &&
        (this.isA(domNode, "X3DShapeNode") || this.isA(domNode, "X3DGeometryNode")))
    {
        return domNode._x3domNode.getCenter();
    }
    
    return null;
};

/**
 * APIMethod getCurrentTransform
 *
 * Returns the current to world transformation of a node.
 *
 * Parameters:
 *    domNode: the node for which its transformation shall be returned
 *
 *  Returns:
 *    Transformation matrix (or null no valid node is given)
 */
x3dom.Runtime.prototype.getCurrentTransform = function(domNode) {
    if (domNode && domNode._x3domNode)
    {
        return domNode._x3domNode.getCurrentTransform();
    }
    
    return null;
};

/**
 * APIFunction: debug
 *
 * Displays or hides the debug window. If parameter is omitted,
 * the current visibility status is returned.
 *
 * Parameter:
 *     show - true to show debug window, false to hide
 *
 * Returns:
 *     Current visibility status of debug window (true=visible, false=hidden)
 */
x3dom.Runtime.prototype.debug = function(show) {
    if (show === true) {
        this.canvas.doc._viewarea._visDbgBuf = true;
        x3dom.debug.logContainer.style.display = "block";
    }
    if (show === false) {
        this.canvas.doc._viewarea._visDbgBuf = false;
        x3dom.debug.logContainer.style.display = "none";
    }
    else {
        if (this.canvas.doc._viewarea._visDbgBuf === undefined) 
            this.canvas.doc._viewarea._visDbgBuf = true;
        else
            this.canvas.doc._viewarea._visDbgBuf = !this.canvas.doc._viewarea._visDbgBuf;

        x3dom.debug.logContainer.style.display =
                (this.canvas.doc._viewarea._visDbgBuf === true) ? "block" : "none";
    }
    this.canvas.doc.needRender = true;
    return this.canvas.doc._viewarea._visDbgBuf;
};

/**
 * APIFunction: navigationType
 *
 * Readout of the currently active navigation.
 *
 * Returns:
 *     A string representing the active navigation type
 */
x3dom.Runtime.prototype.navigationType = function() {
    return this.canvas.doc._scene.getNavigationInfo().getType();
};

/**
 * APIFunction: noNav
 *
 * Switches to noNav mode
 */
x3dom.Runtime.prototype.noNav = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("none");
};

/**
 * APIFunction: examine
 *
 * Switches to examine mode
 */
x3dom.Runtime.prototype.examine = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("examine");
};

/**
 * APIFunction: fly
 *
 * Switches to fly mode
 */
x3dom.Runtime.prototype.fly = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("fly");
};

/**
 * APIFunction: lookAt
 *
 * Switches to lookAt mode
 */
x3dom.Runtime.prototype.lookAt = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("lookat");
};
/**
 * APIFunction: lookAround
 *
 * Switches to lookAround mode
 */
x3dom.Runtime.prototype.lookAround = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("lookaround");
};

/**
 * APIFunction: walk
 *
 * Switches to walk mode
 */
x3dom.Runtime.prototype.walk = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("walk");
};

/**
 * APIFunction: game
 *
 * Switches to game mode
 */
x3dom.Runtime.prototype.game = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("game");
};

/**
 * APIFunction: helicopter
 *
 * Switches to helicopter mode
 */
x3dom.Runtime.prototype.helicopter = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("helicopter");
};

/**
 * Function: resetExamin
 *
 * Resets all variables required by examin mode to init state
 */
 x3dom.Runtime.prototype.resetExamin = function() {
		this.canvas.doc._viewarea._rotMat = x3dom.fields.SFMatrix4f.identity();
    	this.canvas.doc._viewarea._transMat = x3dom.fields.SFMatrix4f.identity();
    	this.canvas.doc._viewarea._movement = new x3dom.fields.SFVec3f(0, 0, 0);
		this.canvas.doc.needRender = true;
 };

/**
 * Function: togglePoints
 *
 * Toggles points attribute
 */
x3dom.Runtime.prototype.togglePoints = function() {
    if (this.canvas.doc._viewarea._points === undefined)
        this.canvas.doc._viewarea._points = 0;
    this.canvas.doc._viewarea._points = ++this.canvas.doc._viewarea._points % 2; // % 3;
    this.canvas.doc.needRender = true;
};

/**
 * Function: pickRect
 *
 * Returns an array of all shape elements that are within the picked rectangle 
 * defined by (x1, y1) and (x2, y2) in canvas coordinates
 */
x3dom.Runtime.prototype.pickRect = function(x1, y1, x2, y2) {
    return this.canvas.doc.onPickRect(this.canvas.gl, x1, y1, x2, y2);
};

/**
 * Function: pickMode
 *
 * Get the current pickmode intersect type
 *
 * Parameters:
 *		internal - true/false. If given return the internal representation.
 *                 Only use for debugging.
 *
 * Returns:
 * 		The current intersect type value suitable to use with changePickMode
 *      If parameter is, given, provide with internal representation.
 */
x3dom.Runtime.prototype.pickMode = function(options) {
    if (options && options.internal === true) {
        return this.canvas.doc._scene._vf.pickMode;
    }
    return this.canvas.doc._scene._vf.pickMode.toLowerCase();
};

/**
 * Function: changePickMode
 *
 * Alter the value of intersct type. Can be one of: idbuf, color, textcoord, box.
 * Other values are ignored.
 *
 * Parameters:
 *		type - The new intersect type: idbuf, color, textcoord, or box.
 *
 * Returns:
 * 		true if the type hase been changed, false otherwise
 */
x3dom.Runtime.prototype.changePickMode = function(type, options) {

    // type one of : idbuf, color, textcoord, box
    type = type.toLowerCase();

    switch(type) {
        case 'idbuf':
            type = 'idBuf';
            break;
        case 'textcoord':
            type = 'textCoord';
            break;
        case 'color':
            type = 'color';
            break;
        case 'box':
            type = 'box';
            break;
        default:
            x3dom.debug.logWarning("Switch pickMode to "+ type + ' unknown intersect type');
            type = undefined;
    }

    if (type !== undefined) {
        this.canvas.doc._scene._vf.pickMode = type;
        x3dom.debug.logInfo("Switched pickMode to '" + type + "'.");
        return false;
    }

    return true;
};

/**
 * APIFunction: speed
 *
 *	Get the current speed value. If parameter is given the new speed value is set.
 *
 * Parameters:
 *		newSpeed - The new speed value (optional)
 *
 * Returns:
 * 		The current speed value
 */
x3dom.Runtime.prototype.speed = function(newSpeed) {
    if (newSpeed) {
        this.canvas.doc._scene.getNavigationInfo()._vf.speed = newSpeed;
        x3dom.debug.logInfo("Changed navigation speed to " + this.canvas.doc._scene.getNavigationInfo()._vf.speed);
    }
    return this.canvas.doc._scene.getNavigationInfo()._vf.speed;
};

/**
 * APIFunction: statistics
 *
 * Get or set statistics info. If parameter is omitted, this method
 * only returns the the visibility status of the statistics info overlay.
 *
 * Parameters:
 *		mode - true or false. To enable or disable the statistics info
 *
 * Returns:
 * 		The current visibility of the statistics info (true = visible, false = invisible)
 */
x3dom.Runtime.prototype.statistics = function(mode) {
    var statDiv = this.canvas.statDiv;
    if (statDiv) {

        if (mode === true) {
            statDiv.style.display = 'inline';
            return true;
        }
        if (mode === false) {
            statDiv.style.display = 'none';
            return false;
        }

        // if no parameter is given return current status (false = not visible, true = visible)
        return statDiv.style.display != 'none'
    }
};

/**
 * Function: processIndicator
 *
 * Enable or disable the process indicator. If parameter is omitted, this method
 * only returns the the visibility status of the statistics info overlay.
 *
 * Parameters:
 *		mode - true or false. To enable or disable the process indicator
 *
 * Returns:
 * 		The current visibility of the process indicator info (true = visible, false = invisible)
 */
x3dom.Runtime.prototype.processIndicator = function(mode) {
    var processDiv = this.canvas.processDiv;
    if (processDiv) {

        if (mode === true) {
            processDiv.style.display = 'inline';
            return true;
        }
        if (mode === false) {
            processDiv.style.display = 'none';
            return false;
        }

        // if no parameter is given return current status (false = not visible, true = visible)
        return processDiv.style.display != 'none'
    }
};

x3dom.Runtime.prototype.properties = function() {
    return this.canvas.doc.properties;
};

x3dom.Runtime.prototype.backendName = function() {
    return this.canvas.backend;
};

/**
 * APIMethod isA
 *
 * Test a DOM node object against a node type string. This method
 * can be used to determine the "type" of a DOM node.
 *
 * Parameters:
 *    domNode: the node to test for
 *    nodeType: node name to test domNode against
 *
 *  Returns:
 *    True or false
 */
x3dom.Runtime.prototype.isA = function(domNode, nodeType) {
    var inherits = false;
    
    if (nodeType && domNode && domNode._x3domNode) {
        if (nodeType === "") {
            nodeType = "X3DNode";
        }
        inherits = x3dom.isa(domNode._x3domNode, 
                             x3dom.nodeTypesLC[nodeType.toLowerCase()]);
    }
    
    return inherits;
};
