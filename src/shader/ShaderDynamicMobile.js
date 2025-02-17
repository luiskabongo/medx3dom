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
 * Generate the final Shader program
 */
x3dom.shader.DynamicMobileShader = function(gl, properties)
{
	this.program = gl.createProgram();
	
	var vertexShader 	= this.generateVertexShader(gl, properties);
	var fragmentShader 	= this.generateFragmentShader(gl, properties);
	
	gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
	gl.linkProgram(this.program);
	
	return this.program;
};

/**
 * Generate the vertex shader
 */
x3dom.shader.DynamicMobileShader.prototype.generateVertexShader = function(gl, properties)
{
	var shader = "";
	
	/*******************************************************************************
	* Generate dynamic attributes & uniforms & varyings
	********************************************************************************/
	
	//Material
	shader += x3dom.shader.material();
	
	//Default Matrices
	shader += "uniform mat4 normalMatrix;\n";
	shader += "uniform mat4 modelViewMatrix;\n";
    shader += "uniform mat4 modelViewProjectionMatrix;\n";
	
	//Positions
	if(properties.POSCOMPONENTS == 3) {
		shader += "attribute vec3 position;\n";
	} else if(properties.POSCOMPONENTS == 4) {
		shader += "attribute vec4 position;\n";
	}
	
	if(properties.IMAGEGEOMETRY) {
		shader += "uniform vec3 IG_bboxMin;\n";
		shader += "uniform vec3 IG_bboxMax;\n";
		shader += "uniform float IG_coordTextureWidth;\n";
		shader += "uniform float IG_coordTextureHeight;\n";
		shader += "uniform float IG_implicitMeshSize;\n";
		
		for( var i = 0; i < properties.IG_PRECISION; i++ ) {
			shader += "uniform sampler2D IG_coordinateTexture" + i + "\n;";
		}
		
		if(properties.IG_INDEXED) {
			shader += "uniform sampler2D IG_indexTexture;\n";
			shader += "uniform float IG_indexTextureWidth;\n";
			shader += "uniform float IG_indexTextureHeight;\n";
		}
	}
	
	//Normals
	if(!properties.POINTLINE2D) {
		if(properties.IMAGEGEOMETRY) {		
			shader += "uniform sampler2D IG_normalTexture;\n";	
		} else {
			if(properties.NORCOMPONENTS == 2) {
				if(properties.POSCOMPONENTS != 4) {
					shader += "attribute vec2 normal;\n";
				}
			} else if(properties.NORCOMPONENTS == 3) {
				shader += "attribute vec3 normal;\n";
			}
		}
	}
	
	//Colors
	shader += "varying vec4 fragColor;\n";
	if(properties.VERTEXCOLOR){
		if(properties.IMAGEGEOMETRY) {
			shader += "uniform sampler2D IG_colorTexture;";
		} else {
			if(properties.COLCOMPONENTS == 3){
				shader += "attribute vec3 color;";
			} else if(properties.COLCOMPONENTS == 4) {
				shader += "attribute vec4 color;";
			}
		}
	}
	
	//Textures
	if(properties.TEXTURED) {
		shader += "varying vec2 fragTexcoord;\n";
		if(properties.IMAGEGEOMETRY) {
			shader += "uniform sampler2D IG_texCoordTexture;";
		} else {
			shader += "attribute vec2 texcoord;\n";
		}
		if(properties.TEXTRAFO){
			shader += "uniform mat4 texTrafoMatrix;\n";
		}
		if(!properties.BLENDING) {
			shader += "varying vec3 fragAmbient;\n";
			shader += "varying vec3 fragDiffuse;\n";
		}
		if(properties.CUBEMAP) {
			shader += "varying vec3 fragViewDir;\n";
			shader += "varying vec3 fragNormal;\n";
			shader += "uniform mat4 viewMatrix;\n";
		}
	}
	
	//Fog
	if(properties.FOG) {
		shader += x3dom.shader.fog();
	}
	
	//Lights
	if(properties.LIGHTS) {
		shader += x3dom.shader.light(properties.LIGHTS);
	}
	
	//Bounding Boxes
	if(properties.REQUIREBBOX) {
		shader += "uniform vec3 bgCenter;\n";
		shader += "uniform vec3 bgSize;\n";
		shader += "uniform float bgPrecisionMax;\n";
	}
	if(properties.REQUIREBBOXNOR) {
		shader += "uniform float bgPrecisionNorMax;\n";
	}
	if(properties.REQUIREBBOXCOL) {
		shader += "uniform float bgPrecisionColMax;\n";
	}
	if(properties.REQUIREBBOXTEX) {
		shader += "uniform float bgPrecisionTexMax;\n";
	}

	/*******************************************************************************
	* Generate main function
	********************************************************************************/
	shader += "void main(void) {\n";
	
	//Set point size
	shader += "gl_PointSize = 2.0;\n";
	
	/*******************************************************************************
	* Start of ImageGeometry switch
	********************************************************************************/
	if(properties.IMAGEGEOMETRY) {
		//Indices
		if(properties.IG_INDEXED) {
			shader += "vec2 halfPixel = vec2(0.5/IG_indexTextureWidth,0.5/IG_indexTextureHeight);\n";
			shader += "vec2 IG_texCoord = vec2(position.x*(IG_implicitMeshSize/IG_indexTextureWidth), position.y*(IG_implicitMeshSize/IG_indexTextureHeight)) + halfPixel;\n";
			shader += "vec2 IG_index = texture2D( IG_indexTexture, IG_texCoord ).rg;\n";
			shader += "halfPixel = vec2(0.5/IG_coordTextureWidth,0.5/IG_coordTextureHeight);\n";
			shader += "IG_texCoord = (IG_index * 0.996108948) + halfPixel;\n";
		} else {
			shader += "vec2 halfPixel = vec2(0.5/IG_coordTextureWidth, 0.5/IG_coordTextureHeight);\n";
			shader += "vec2 IG_texCoord = vec2(position.x*(IG_implicitMeshSize/IG_coordTextureWidth), position.y*(IG_implicitMeshSize/IG_coordTextureHeight)) + halfPixel;\n";
		}
		
		//Positions
		shader += "vec3 temp = vec3(0.0, 0.0, 0.0);\n";
		shader += "vec3 vertPosition = vec3(0.0, 0.0, 0.0);\n";
		
		for(var i=0; i<properties.IG_PRECISION; i++) {
			shader += "temp = 255.0 * texture2D( IG_coordinateTexture" + i + ", IG_texCoord ).rgb;\n";
			shader += "vertPosition *= 256.0;\n";
			shader += "vertPosition += temp;\n";
		}
		
		shader += "vertPosition /= (pow(2.0, 8.0 * " + properties.IG_PRECISION + ".0) - 1.0);\n";
		
		// comment out if transformMatrix() from Shape is used for generating model matrix
		shader += "vertPosition = vertPosition * (IG_bboxMax - IG_bboxMin) + IG_bboxMin;\n";
	
		//Normals
		if(!properties.POINTLINE2D) {
			shader += "vec3 vertNormal = texture2D( IG_normalTexture, IG_texCoord ).rgb;\n";
			shader += "vertNormal = vertNormal * 2.0 - 1.0;\n";
		}
		
		//Colors
		if(properties.VERTEXCOLOR) {
			if(properties.COLCOMPONENTS == 3) {
				shader += "vec3 vertColor = texture2D( IG_colorTexture, IG_texCoord ).rgb;";
			} else if(properties.COLCOMPONENTS  == 4) {
				shader += "vec4 vertColor = texture2D( IG_colorTexture, IG_texCoord ).rgba;";
			}
		}
		
		//TexCoords
		if(properties.TEXTURED) {
			shader += "vec4 IG_doubleTexCoords = texture2D( IG_texCoordTexture, IG_texCoord );\n";
			shader += "vec2 vertTexCoord;";
			shader += "vertTexCoord.r = (IG_doubleTexCoords.r * 0.996108948) + (IG_doubleTexCoords.b * 0.003891051);\n";
			shader += "vertTexCoord.g = (IG_doubleTexCoords.g * 0.996108948) + (IG_doubleTexCoords.a * 0.003891051);\n";
		}
	} else {
		//Positions
		shader += "vec3 vertPosition = position.xyz;\n";
		if(properties.REQUIREBBOX || properties.BITLODGEOMETRY) {
			shader += "vertPosition = bgCenter + bgSize * vertPosition / bgPrecisionMax;\n";
		}
	
		//Normals
		if(!properties.POINTLINE2D) {
			if (properties.NORCOMPONENTS == 2) {
				if (properties.POSCOMPONENTS == 4) {
					// (theta, phi) encoded in low/high byte of position.w
					shader += "vec3 vertNormal = vec3(position.w / 256.0); \n";
					shader += "vertNormal.x = floor(vertNormal.x) / 255.0; \n";
					shader += "vertNormal.y = fract(vertNormal.y) * 1.00392156862745; \n"; //256.0 / 255.0
				} else if (properties.REQUIREBBOXNOR && !properties.BITLODGEOMETRY) {
					shader += "vec3 vertNormal = vec3(normal.xy, 0.0) / bgPrecisionNorMax;\n";
				} else {
					shader += "vec3 vertNormal = vec3(normal.xy, 0.0);\n";
				}
				
				shader += "vec2 thetaPhi = 3.14159265358979 * vec2(vertNormal.x, vertNormal.y*2.0-1.0); \n";

				// Doing approximation with Taylor series and using cos(x) = sin(x+PI/2)
				shader += "vec4 sinCosThetaPhi = vec4(thetaPhi, thetaPhi + 1.5707963267949); \n";

				shader += "vec4 thetaPhiPow2 = sinCosThetaPhi * sinCosThetaPhi; \n";
				shader += "vec4 thetaPhiPow3 =  thetaPhiPow2  * sinCosThetaPhi; \n";
				shader += "vec4 thetaPhiPow5 =  thetaPhiPow3  * thetaPhiPow2; \n";
				shader += "vec4 thetaPhiPow7 =  thetaPhiPow5  * thetaPhiPow2; \n";
				shader += "vec4 thetaPhiPow9 =  thetaPhiPow7  * thetaPhiPow2; \n";

				shader += "sinCosThetaPhi +=  -0.16666666667   * thetaPhiPow3; \n";
				shader += "sinCosThetaPhi +=   0.00833333333   * thetaPhiPow5; \n";
				shader += "sinCosThetaPhi +=  -0.000198412698  * thetaPhiPow7; \n";
				shader += "sinCosThetaPhi +=   0.0000027557319 * thetaPhiPow9; \n";

				shader += "vertNormal.x = sinCosThetaPhi.x * sinCosThetaPhi.w; \n";
				shader += "vertNormal.y = sinCosThetaPhi.x * sinCosThetaPhi.y; \n";
				shader += "vertNormal.z = sinCosThetaPhi.z; \n";
			} else {
				shader += "vec3 vertNormal = normal;\n";
				if (properties.REQUIREBBOXNOR) {
					shader += "vertNormal = vertNormal / bgPrecisionNorMax;\n";
				}
			}
		}
		
		//Colors
		if(properties.VERTEXCOLOR) {
			if(properties.COLCOMPONENTS == 3) {
				shader += "vec3 vertColor = color;";
			} else if(properties.COLCOMPONENTS  == 4) {
				shader += "vec4 vertColor = color;";
			}
			if(properties.REQUIREBBOXNOR) {
				shader += "vertColor = vertColor / bgPrecisionColMax;\n";
			}
		}
		
		//TexCoords
		if(properties.TEXTURED) {
			shader += "vec2 vertTexCoord = texcoord;\n";
			if(properties.REQUIREBBOXTEX) {
				shader += "vertTexCoord = vertTexCoord / bgPrecisionTexMax;\n";
			}
		}
	}
	/*******************************************************************************
	* End of ImageGeometry switch
	********************************************************************************/
	
	//positions to model-view-space
	shader += "vec3 positionMV = (modelViewMatrix * vec4(vertPosition, 1.0)).xyz;\n";
	
	//normals to model-view-space
	if(!properties.POINTLINE2D) {
		shader += "vec3 normalMV = normalize( (normalMatrix * vec4(vertNormal, 0.0)).xyz );\n";
	}
	
	shader += "vec3 eye = -positionMV;\n";
	
	//Colors
	if (properties.VERTEXCOLOR) {
		shader += "vec3 rgb = vertColor.rgb;\n";	
		if(properties.COLCOMPONENTS == 4) {
			shader += "float alpha = vertColor.a;\n";
		} else if(properties.COLCOMPONENTS == 3) {
			shader += "float alpha = 1.0 - transparency;\n";
		}
	} else {
		shader += "vec3 rgb = diffuseColor;\n";
		shader += "float alpha = 1.0 - transparency;\n";
	}
	
	//Calc TexCoords
	if(properties.TEXTURED){
		if(properties.CUBEMAP) {
			shader += "fragViewDir = viewMatrix[3].xyz;\n";
			shader += "fragNormal = normalMV;\n";
		} else if(properties.SPHEREMAPPING) {
			shader += " fragTexcoord = 0.5 + normalMV.xy / 2.0;\n";
		} else if(properties.TEXTRAFO) {
			shader += " fragTexcoord = (texTrafoMatrix * vec4(vertTexCoord, 1.0, 1.0)).xy;\n";
		} else {
			shader += " fragTexcoord = vertTexCoord;\n";
		}
	}
	
	//calc lighting
	if(properties.LIGHTS) {
		shader += "vec3 ambient   = vec3(0.07, 0.07, 0.07);\n";
		shader += "vec3 diffuse   = vec3(0.0, 0.0, 0.0);\n";
		shader += "vec3 specular  = vec3(0.0, 0.0, 0.0);\n";
		
		//Solid
		if(!properties.SOLID) {
			shader += "if (dot(normalMV, eye) < 0.0) {\n";
			shader += "	 normalMV *= -1.0;\n";
			shader += "}\n";
		}
		
		//Calculate lighting
		for(var i=0; i<properties.LIGHTS; i++) {		
			shader += " lighting(light"+i+"_Type," +
								"light"+i+"_Location," +
								"light"+i+"_Direction," +
								"light"+i+"_Color," + 
								"light"+i+"_Attenuation," +
								"light"+i+"_Intensity," + 
								"light"+i+"_AmbientIntensity," +
								"light"+i+"_BeamWidth," +
								"light"+i+"_CutOffAngle," +
								"normalMV, eye, ambient, diffuse, specular);\n";
		}
		
		//Textures & blending
		if(properties.TEXTURED  && !properties.BLENDING) {
			shader += "fragAmbient = ambient;\n";
			shader += "fragDiffuse = diffuse;\n";
			shader += "fragColor.rgb = (emissiveColor + specular*specularColor);\n";
			shader += "fragColor.a = alpha;\n";
		} else {
			shader += "fragColor.rgb = (emissiveColor + ambient*rgb + diffuse*rgb + specular*specularColor);\n";
			shader += "fragColor.a = alpha;\n";
		}
	} else {
		if(properties.TEXTURED && !properties.BLENDING) {
			shader += "fragAmbient = vec3(1.0);\n";
			shader += "fragDiffuse = vec3(1.0);\n";
			shader += "fragColor.rgb = vec3(0.0);\n";
			shader += "fragColor.a = alpha;\n";
		} else {
			shader += "fragColor.rgb = rgb + emissiveColor;\n;\n";
			shader += "fragColor.a = alpha;\n";
		}
	}
	
	//Fog
	if(properties.FOG) {
		shader += "float f0 = calcFog(-positionMV);\n";
		shader += "fragColor.rgb = fogColor * (1.0-f0) + f0 * (fragColor.rgb);\n";
	}

	//Output
	shader += "gl_Position = modelViewProjectionMatrix * vec4(vertPosition, 1.0);\n";
	
	//End of shader
	shader += "}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[DynamicMobileShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.DynamicMobileShader.prototype.generateFragmentShader = function(gl, properties)
{
	shader = "#ifdef GL_ES\n" +
			 "  precision highp float;\n" +
			 "#endif\n\n";
	
	
	/*******************************************************************************
	* Generate dynamic uniforms & varyings
	********************************************************************************/
	//Colors
	shader += "varying vec4 fragColor;\n";
	
	//Textures
	if(properties.TEXTURED) {
		if(properties.CUBEMAP) {
			shader += "uniform samplerCube tex;\n";
			shader += "varying vec3 fragViewDir;\n";
			shader += "varying vec3 fragNormal;\n";
			shader += "uniform mat4 modelViewMatrixInverse;\n";
		} else {
			shader += "uniform sampler2D tex;           \n";
			shader += "varying vec2 fragTexcoord;       \n";
		}
		if(!properties.BLENDING) {
			shader += "varying vec3 fragAmbient;\n";
			shader += "varying vec3 fragDiffuse;\n";
		}
	}
	
	/*******************************************************************************
	* Generate main function
	********************************************************************************/
	shader += "void main(void) {\n";
	
	//Colors
	shader += "vec4 color = fragColor;\n";
	
	//Textures
	if(properties.TEXTURED){
		if(properties.CUBEMAP) {
			shader += "vec3 normal = normalize(fragNormal);\n";
			shader += "vec3 viewDir = normalize(fragViewDir);\n";
			shader += "vec3 reflected = reflect(viewDir, normal);\n"
			shader += "reflected = (modelViewMatrixInverse * vec4(reflected,0.0)).xyz;\n"
			shader += "vec4 texColor = textureCube(tex, reflected);\n";
		} else {
			shader += "vec4 texColor = texture2D(tex, vec2(fragTexcoord.s, 1.0-fragTexcoord.t));\n";
		}
		if(properties.BLENDING) {
			if(properties.CUBEMAP) {
				shader += "color.rgb = mix(color.rgb, texColor.rgb, vec3(0.75));\n";
				shader += "color.a = texColor.a;\n";
			} else {
				shader += "color.rgb *= texColor.rgb;\n";
				shader += "color.a *= texColor.a;\n";
			}
		} else {
			shader += "color.rgb += fragAmbient*texColor.rgb + fragDiffuse*texColor.rgb;\n";
			shader += "color.a *= texColor.a;\n";
		}
	} 
	
	//Kill pixel
	if(properties.TEXT) {
		shader += "if (color.a <= 0.5) discard;\n";
	} else {
		shader += "if (color.a <= 0.1) discard;\n";
	}
	
	//Output
	shader += "gl_FragColor = color;\n";
	
	//End of shader
	shader += "}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[DynamicMobileShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};