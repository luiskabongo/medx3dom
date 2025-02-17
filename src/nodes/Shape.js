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

/* ### X3DAppearanceNode ### */
x3dom.registerNodeType(
    "X3DAppearanceNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DAppearanceNode.superClass.call(this, ctx);
        }
    )
);

/* ### Appearance ### */
x3dom.registerNodeType(
    "Appearance",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceNode,
        function (ctx) {
            x3dom.nodeTypes.Appearance.superClass.call(this, ctx);

            this.addField_SFNode('material', x3dom.nodeTypes.X3DMaterialNode);
            this.addField_SFNode('texture',  x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFNode('textureTransform', x3dom.nodeTypes.X3DTextureTransformNode);
            this.addField_SFNode('blendMode', x3dom.nodeTypes.BlendMode);
            this.addField_SFNode('depthMode', x3dom.nodeTypes.DepthMode);
            this.addField_MFNode('shaders', x3dom.nodeTypes.X3DShaderNode);
			this.addField_SFString(ctx, 'sortType', 'auto');      // [auto, transparent, opaque]
            this.addField_SFInt32(ctx, 'sortKey', 0);             // Change render order manually

            // shortcut to shader program
            this._shader = null;
        },
        {
            nodeChanged: function() {
                if (!this._cf.material.node) {
                    this.addChild(x3dom.nodeTypes.Material.defaultNode());
                }

                if (this._cf.shaders.nodes.length) {
                    this._shader = this._cf.shaders.nodes[0];
                }
				
				if(this._vf.sortType == 'auto') {
					if(this._cf.material.node && this._cf.material.node._vf.transparency > 0) {
						this._vf.sortType = 'transparent';
					}
                    else if (this._cf.texture.node && this._cf.texture.node._vf.url.length) {
                        // uhh, this is a rather coarse guess...
                        if (this._cf.texture.node._vf.url[0].toLowerCase().indexOf('.'+'png') >= 0) {
                            this._vf.sortType = 'transparent';
                        }
                    }
                    else {
						this._vf.sortType = 'opaque';
					}
				}
            },

            texTransformMatrix: function() {
                if (this._cf.textureTransform.node === null) {
                    return x3dom.fields.SFMatrix4f.identity();
                }
                else {
                    return this._cf.textureTransform.node.texTransformMatrix();
                }
            }
        }
    )
);

x3dom.nodeTypes.Appearance.defaultNode = function() {
    if (!x3dom.nodeTypes.Appearance._defaultNode) {
        x3dom.nodeTypes.Appearance._defaultNode = new x3dom.nodeTypes.Appearance();
        x3dom.nodeTypes.Appearance._defaultNode.nodeChanged();
    }
    return x3dom.nodeTypes.Appearance._defaultNode;
};

/* ### X3DAppearanceChildNode ### */
x3dom.registerNodeType(
    "X3DAppearanceChildNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DAppearanceChildNode.superClass.call(this, ctx);
        }
    )
);

/* ### BlendMode ### */
x3dom.registerNodeType(
    "BlendMode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.BlendMode.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'srcFactor', "src_alpha");
            this.addField_SFString(ctx, 'destFactor', "one_minus_src_alpha");
            this.addField_SFColor(ctx, 'color', 1, 1, 1);
            this.addField_SFFloat(ctx, 'colorTransparency', 0);
            this.addField_SFString(ctx, 'alphaFunc', "none");
            this.addField_SFFloat(ctx, 'alphaFuncValue', 0);
            this.addField_SFString(ctx, 'equation', "none");
        }
    )
);

/* ### DepthMode ### */
x3dom.registerNodeType(
    "DepthMode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.DepthMode.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'enableDepthTest', true);
            this.addField_SFString(ctx, 'depthFunc', "none");
            this.addField_SFBool(ctx, 'readOnly', false);
            this.addField_SFFloat(ctx, 'zNearRange', -1);
            this.addField_SFFloat(ctx, 'zFarRange', -1);
        }
    )
);

/* ### X3DMaterialNode ### */
x3dom.registerNodeType(
    "X3DMaterialNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DMaterialNode.superClass.call(this, ctx);
        }
    )
);

/* ### Material ### */
x3dom.registerNodeType(
    "Material",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DMaterialNode,
        function (ctx) {
            x3dom.nodeTypes.Material.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'ambientIntensity', 0.2);
            this.addField_SFColor(ctx, 'diffuseColor', 0.8, 0.8, 0.8);
            this.addField_SFColor(ctx, 'emissiveColor', 0, 0, 0);
            this.addField_SFFloat(ctx, 'shininess', 0.2);
            this.addField_SFColor(ctx, 'specularColor', 0, 0, 0);
            this.addField_SFFloat(ctx, 'transparency', 0);
        },
		{

			fieldChanged: function(fieldName) {
				if (fieldName == "ambientIntensity" || fieldName == "diffuseColor" ||
					fieldName == "emissiveColor" || fieldName == "shininess" ||
					fieldName == "specularColor" || fieldName == "transparency")
                {
                    Array.forEach(this._parentNodes, function (app) {
                        Array.forEach(app._parentNodes, function (shape) {
                            shape._dirty.material = true;
                        });
                    });
                }
			}
		}
    )
);

x3dom.nodeTypes.Material.defaultNode = function() {
    if (!x3dom.nodeTypes.Material._defaultNode) {
        x3dom.nodeTypes.Material._defaultNode = new x3dom.nodeTypes.Material();
        x3dom.nodeTypes.Material._defaultNode.nodeChanged();
    }
    return x3dom.nodeTypes.Material._defaultNode;
};

/* ### X3DShapeNode ### */
x3dom.registerNodeType(
    "X3DShapeNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DShapeNode.superClass.call(this, ctx);

            // FIXME: X3DShapeNode inherits from X3DChildNode and X3DBoundedObject
            // (at least according to spec), therefore impl. "render" field there.
            this.addField_SFBool(ctx, 'render', true);
            this.addField_SFBool(ctx, 'isPickable', true);
            // same thing for bbox
            this.addField_SFVec3f(ctx, 'bboxCenter', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'bboxSize', -1, -1, -1);
            
            this.addField_SFNode('appearance', x3dom.nodeTypes.X3DAppearanceNode);
            this.addField_SFNode('geometry', x3dom.nodeTypes.X3DGeometryNode);

            this._objectID = 0;
            
            // in WebGL-based renderer a clean-up function is attached
            this._cleanupGLObjects = null;

            this._dirty = {
                positions: true,
                normals: true,
                texcoords: true,
                colors: true,
                indexes: true,
                texture: true,
                material: true,
                text: true,
                shader: true
            };

            // FIXME; move somewhere else and allow generic values!!!
            this._coordStrideOffset = [0, 0];
            this._normalStrideOffset = [0, 0];
            this._texCoordStrideOffset = [0, 0];
            this._colorStrideOffset = [0, 0];
        },
        {
            collectDrawableObjects: function (transform, out)
            {
                var collectNeedsReset = false;
                if ( out && !out.collect && out.useIdList && this._cf.geometry.node !== null && 
                    (out.idList.indexOf(this._DEF) >= 0 || out.idList.indexOf(this._cf.geometry.node._DEF) >= 0) ) {
                    out.collect = true;
                    collectNeedsReset = true;
                }

                // TODO: culling etc
                if ( out !== null && this._vf.render &&
                    (!out.useIdList || out.collect) )
                {
                    out.push( [transform, this] );
                }
                
                if (collectNeedsReset)
                    out.collect = false;
            },
            
            transformMatrix: function(transform)
            {
                // uncomment following for pushing position and size of IG to model matrix
                /*
                if (x3dom.isa(this._cf.geometry.node, x3dom.nodeTypes.ImageGeometry))
                {
                    var trafo = x3dom.fields.SFMatrix4f.translation(this._cf.geometry.node.getMin()).
                                    mult(x3dom.fields.SFMatrix4f.scale(this._cf.geometry.node._vf.size));
                    return transform.mult(trafo);
                }
                else
                */
                {
                    return transform;
                }
            },

            getVolume: function(min, max, invalidate) {
				if (this._cf.geometry.node) {
					return this._cf.geometry.node.getVolume(min, max, invalidate);
				}
				else {
					return false;
				}
            },

            getCenter: function() {
				if (this._cf.geometry.node) {
					return this._cf.geometry.node.getCenter();
				}
				else {
					return new x3dom.fields.SFVec3f(0,0,0);
				}
            },

            doIntersect: function(line) {
                return this._cf.geometry.node.doIntersect(line);
            },

            isSolid: function() {
                return this._cf.geometry.node._vf.solid;
            },

            isCCW: function() {
                return this._cf.geometry.node._vf.ccw;
            },

            parentRemoved: function(parent) {
                // Cleans all GL objects for WebGL-based renderer
                if (this._cleanupGLObjects) {
                    this._cleanupGLObjects();
                }
            },
			
			setAllDirty: function () {
			    // vertex attributes
				this._dirty.positions = true;
				this._dirty.normals = true;
				this._dirty.texcoords = true;
				this._dirty.colors =  true;
				// indices/topology
				this._dirty.indexes = true;
				// appearance properties
				this._dirty.texture = true;
				this._dirty.material = true;
				this._dirty.text = true;
				this._dirty.shader = true;
            },
            
            setGeoDirty: function () {
				this._dirty.positions = true;
				this._dirty.normals = true;
				this._dirty.texcoords = true;
				this._dirty.colors =  true;
				this._dirty.indexes = true;
            }
        }
    )
);

/* ### Shape ### */
x3dom.registerNodeType(
    "Shape",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DShapeNode,
        function (ctx) {
            x3dom.nodeTypes.Shape.superClass.call(this, ctx);
        },
        {
            nodeChanged: function () {
                if (!this._cf.appearance.node) {
                    this.addChild(x3dom.nodeTypes.Appearance.defaultNode());
                }
                if (!this._cf.geometry.node) {
                    if (this._DEF)
                    x3dom.debug.logError("No geometry given in Shape/" + this._DEF);
                }
                else if (!this._objectID && this._cf.geometry.node._pickable) {
                    this._objectID = ++x3dom.nodeTypes.Shape.objectID;
                    x3dom.nodeTypes.Shape.idMap.nodeID[this._objectID] = this;
                }
            }
        }
    )
);

/** Static class ID counter (needed for picking) */
x3dom.nodeTypes.Shape.objectID = 0;

/** Map for Shape node IDs (needed for picking) */
x3dom.nodeTypes.Shape.idMap = {
    nodeID: {},
    remove: function(obj) {
        for (var prop in this.nodeID) {
            if (this.nodeID.hasOwnProperty(prop)) {
                var val = this.nodeID[prop];
                if (val._objectID  && obj._objectID &&
                    val._objectID === obj._objectID)
                {
                    delete this.nodeID[prop];
                    x3dom.debug.logInfo("Unreg " + val._objectID);
                    // FIXME; handle node removal to unreg from map,
                    // and put free'd ID back to ID pool for reuse
                }
            }
        }
    }
};
