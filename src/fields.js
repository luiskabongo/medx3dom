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

/** @namespace The x3dom.fields namespace. */
x3dom.fields = {};

x3dom.fields.Eps = 0.000001;

/** SFMatrix4f constructor. 
    @class Represents a SFMatrix4f
    //TODO; use 2-dim array instead of _xx
  */
x3dom.fields.SFMatrix4f = function(	_00, _01, _02, _03, 
									_10, _11, _12, _13, 
									_20, _21, _22, _23, 
									_30, _31, _32, _33) 
{
    if (arguments.length === 0) {
        this._00 = 1; this._01 = 0; this._02 = 0; this._03 = 0;
        this._10 = 0; this._11 = 1; this._12 = 0; this._13 = 0;
        this._20 = 0; this._21 = 0; this._22 = 1; this._23 = 0;
        this._30 = 0; this._31 = 0; this._32 = 0; this._33 = 1;
    }
    else {
        this._00 = _00; this._01 = _01; this._02 = _02; this._03 = _03;
        this._10 = _10; this._11 = _11; this._12 = _12; this._13 = _13;
        this._20 = _20; this._21 = _21; this._22 = _22; this._23 = _23;
        this._30 = _30; this._31 = _31; this._32 = _32; this._33 = _33;
    }
};

/** returns 1st base vector (right) */
x3dom.fields.SFMatrix4f.prototype.e0 = function () {
    var baseVec = new x3dom.fields.SFVec3f(this._00, this._10, this._20);
    return baseVec.normalize();
};

/** returns 2nd base vector (up) */
x3dom.fields.SFMatrix4f.prototype.e1 = function () {
    var baseVec = new x3dom.fields.SFVec3f(this._01, this._11, this._21);
    return baseVec.normalize();
};

/** returns 3rd base vector (fwd) */
x3dom.fields.SFMatrix4f.prototype.e2 = function () {
    var baseVec = new x3dom.fields.SFVec3f(this._02, this._12, this._22);
    return baseVec.normalize();
};

/** returns 4th base vector (pos) */
x3dom.fields.SFMatrix4f.prototype.e3 = function () {
    return new x3dom.fields.SFVec3f(this._03, this._13, this._23);
};

/** Returns a SFMatrix4f identity matrix. */
x3dom.fields.SFMatrix4f.identity = function () {
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
};

x3dom.fields.SFMatrix4f.zeroMatrix = function () {
    return new x3dom.fields.SFMatrix4f(
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    );
};

x3dom.fields.SFMatrix4f.translation = function (vec) {
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, vec.x,
        0, 1, 0, vec.y,
        0, 0, 1, vec.z,
        0, 0, 0, 1
    );
};

x3dom.fields.SFMatrix4f.rotationX = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    );
};

x3dom.fields.SFMatrix4f.rotationY = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4f(
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    );
};

x3dom.fields.SFMatrix4f.rotationZ = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4f(
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
};

x3dom.fields.SFMatrix4f.scale = function (vec) {
    return new x3dom.fields.SFMatrix4f(
        vec.x, 0, 0, 0,
        0, vec.y, 0, 0,
        0, 0, vec.z, 0,
        0, 0, 0, 1
    );
};

x3dom.fields.SFMatrix4f.lookAt = function (from, at, up)
{
    var view = from.subtract(at).normalize();
    var right = up.normalize().cross(view);

    // check if zero vector, i.e. linearly dependent
    if (right.dot(right) < x3dom.fields.Eps) {
        x3dom.debug.logWarning("View matrix is linearly dependent.");
        return x3dom.fields.SFMatrix4f.translation(from);
    }

    var newUp = view.cross(right.normalize()).normalize();

    var tmp = x3dom.fields.SFMatrix4f.identity();
    tmp.setValue(right, newUp, view, from);

    return tmp;
};

x3dom.fields.SFMatrix4f.prototype.setTranslate = function (vec) {
    this._03 = vec.x;
    this._13 = vec.y;
    this._23 = vec.z;
};

x3dom.fields.SFMatrix4f.prototype.setScale = function (vec) {
    this._00 = vec.x;
    this._11 = vec.y;
    this._22 = vec.z;
};

x3dom.fields.SFMatrix4f.parseRotation = function (str) {
    var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec(str);
    var x = +m[1], y = +m[2], z = +m[3], a = +m[4];
    var d = Math.sqrt(x*x + y*y + z*z);
    if (d === 0) {
        x = 1; y = z = 0;
    } else {
        x /= d; y /= d; z /= d;
    }
    var c = Math.cos(a);
    var s = Math.sin(a);
    var t  = 1-c;

    return new x3dom.fields.SFMatrix4f(
        t*x*x+c,   t*x*y+s*z, t*x*z-s*y, 0,
        t*x*y-s*z, t*y*y+c,   t*y*z+s*x, 0,
        t*x*z+s*y, t*y*z-s*x, t*z*z+c,   0,
        0,         0,         0,         1
    ).transpose();
};

x3dom.fields.SFMatrix4f.parse = function (str) {
    var needTranspose = false;
    var val = /matrix.*\((.+)\)/;
    if (val.exec(str)) {
        str = RegExp.$1;
        needTranspose = true;
    }
    var arr = Array.map(str.split(/[,\s]+/), function (n) { return +n; });
    if (arr.length >= 16)
    {
        if (!needTranspose) {
            return new x3dom.fields.SFMatrix4f(
                arr[0],  arr[1],  arr[2],  arr[3], 
                arr[4],  arr[5],  arr[6],  arr[7], 
                arr[8],  arr[9],  arr[10], arr[11], 
                arr[12], arr[13], arr[14], arr[15]
            );
        }
        else {
            return new x3dom.fields.SFMatrix4f(
                arr[0],  arr[4],  arr[8],  arr[12], 
                arr[1],  arr[5],  arr[9],  arr[13], 
                arr[2],  arr[6],  arr[10], arr[14], 
                arr[3],  arr[7],  arr[11], arr[15]
            );
        }
    }
    else if (arr.length === 6) {
        return new x3dom.fields.SFMatrix4f(
            arr[0],  arr[1],  0,  arr[4], 
            arr[2],  arr[3],  0,  arr[5], 
                 0,       0,  1,  0, 
                 0,       0,  0,  1
        );
    }
    else {
        x3dom.debug.logWarning("SFMatrix4f - can't parse string: " + str);
        return x3dom.fields.SFMatrix4f.identity();
    }
};

x3dom.fields.SFMatrix4f.prototype.mult = function (that)  {
    return new x3dom.fields.SFMatrix4f(
        this._00*that._00+this._01*that._10+this._02*that._20+this._03*that._30, 
        this._00*that._01+this._01*that._11+this._02*that._21+this._03*that._31, 
        this._00*that._02+this._01*that._12+this._02*that._22+this._03*that._32, 
        this._00*that._03+this._01*that._13+this._02*that._23+this._03*that._33,
        this._10*that._00+this._11*that._10+this._12*that._20+this._13*that._30, 
        this._10*that._01+this._11*that._11+this._12*that._21+this._13*that._31, 
        this._10*that._02+this._11*that._12+this._12*that._22+this._13*that._32, 
        this._10*that._03+this._11*that._13+this._12*that._23+this._13*that._33,
        this._20*that._00+this._21*that._10+this._22*that._20+this._23*that._30, 
        this._20*that._01+this._21*that._11+this._22*that._21+this._23*that._31, 
        this._20*that._02+this._21*that._12+this._22*that._22+this._23*that._32, 
        this._20*that._03+this._21*that._13+this._22*that._23+this._23*that._33,
        this._30*that._00+this._31*that._10+this._32*that._20+this._33*that._30, 
        this._30*that._01+this._31*that._11+this._32*that._21+this._33*that._31, 
        this._30*that._02+this._31*that._12+this._32*that._22+this._33*that._32, 
        this._30*that._03+this._31*that._13+this._32*that._23+this._33*that._33
    );
};

x3dom.fields.SFMatrix4f.prototype.multMatrixPnt = function (vec) {
    return new x3dom.fields.SFVec3f(
        this._00*vec.x + this._01*vec.y + this._02*vec.z + this._03,
        this._10*vec.x + this._11*vec.y + this._12*vec.z + this._13,
        this._20*vec.x + this._21*vec.y + this._22*vec.z + this._23
    );
};

x3dom.fields.SFMatrix4f.prototype.multMatrixVec = function (vec) {
    return new x3dom.fields.SFVec3f(
        this._00*vec.x + this._01*vec.y + this._02*vec.z,
        this._10*vec.x + this._11*vec.y + this._12*vec.z,
        this._20*vec.x + this._21*vec.y + this._22*vec.z
    );
};

x3dom.fields.SFMatrix4f.prototype.multFullMatrixPnt = function (vec) {
    var w = this._30*vec.x + this._31*vec.y + this._32*vec.z + this._33;
    if (w) { w = 1.0 / w; }
    return new x3dom.fields.SFVec3f(
        (this._00*vec.x + this._01*vec.y + this._02*vec.z + this._03) * w,
        (this._10*vec.x + this._11*vec.y + this._12*vec.z + this._13) * w,
        (this._20*vec.x + this._21*vec.y + this._22*vec.z + this._23) * w
    );
};

x3dom.fields.SFMatrix4f.prototype.transpose = function () {
    return new x3dom.fields.SFMatrix4f(
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    );
};

x3dom.fields.SFMatrix4f.prototype.negate = function () {
    return new x3dom.fields.SFMatrix4f(
        -this._00, -this._01, -this._02, -this._03,
        -this._10, -this._11, -this._12, -this._13,
        -this._20, -this._21, -this._22, -this._23,
        -this._30, -this._31, -this._32, -this._33
    );
};

x3dom.fields.SFMatrix4f.prototype.multiply = function (s) {
    return new x3dom.fields.SFMatrix4f(
        s*this._00, s*this._01, s*this._02, s*this._03,
        s*this._10, s*this._11, s*this._12, s*this._13,
        s*this._20, s*this._21, s*this._22, s*this._23,
        s*this._30, s*this._31, s*this._32, s*this._33
    );
};

x3dom.fields.SFMatrix4f.prototype.add = function (that) {
    return new x3dom.fields.SFMatrix4f(
        this._00+that._00, this._01+that._01, this._02+that._02, this._03+that._03,
        this._10+that._10, this._11+that._11, this._12+that._12, this._13+that._13,
        this._20+that._20, this._21+that._21, this._22+that._22, this._23+that._23,
        this._30+that._30, this._31+that._31, this._32+that._32, this._33+that._33
    );
};

x3dom.fields.SFMatrix4f.prototype.addScaled = function (that, s) {
    return new x3dom.fields.SFMatrix4f(
        this._00+s*that._00, this._01+s*that._01, this._02+s*that._02, this._03+s*that._03,
        this._10+s*that._10, this._11+s*that._11, this._12+s*that._12, this._13+s*that._13,
        this._20+s*that._20, this._21+s*that._21, this._22+s*that._22, this._23+s*that._23,
        this._30+s*that._30, this._31+s*that._31, this._32+s*that._32, this._33+s*that._33
    );
};

x3dom.fields.SFMatrix4f.prototype.setValues = function (that) {
    this._00 = that._00; this._01 = that._01; this._02 = that._02; this._03 = that._03;
    this._10 = that._10; this._11 = that._11; this._12 = that._12; this._13 = that._13;
    this._20 = that._20; this._21 = that._21; this._22 = that._22; this._23 = that._23;
    this._30 = that._30; this._31 = that._31; this._32 = that._32; this._33 = that._33;
};

x3dom.fields.SFMatrix4f.prototype.setValue = function (v1, v2, v3, v4) {
    this._00 = v1.x; this._01 = v2.x; this._02 = v3.x;
    this._10 = v1.y; this._11 = v2.y; this._12 = v3.y;
    this._20 = v1.z; this._21 = v2.z; this._22 = v3.z;
    this._30 = 0;    this._31 = 0;    this._32 = 0;
    
    if (arguments.length > 3) {
        this._03 = v4.x;
        this._13 = v4.y;
        this._23 = v4.z;
        this._33 = 1;
    }
};

x3dom.fields.SFMatrix4f.prototype.toGL = function () {
    return [
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    ];
};

x3dom.fields.SFMatrix4f.prototype.at = function (i, j) {
	var field = "_" + i + j;
	return this[field];
};

x3dom.fields.SFMatrix4f.prototype.sqrt = function () {
    var iX = x3dom.fields.SFMatrix4f.identity(), 
         Y = x3dom.fields.SFMatrix4f.identity(), 
        iY = x3dom.fields.SFMatrix4f.identity(), 
        result = x3dom.fields.SFMatrix4f.identity();
    var i, g, ig;
    
    result.setValues(this);
    
    for (i=0; i<6; i++)
    {
        iX = result.inverse();
        iY = Y.inverse();
        
        g = Math.abs( Math.pow(result.det() * Y.det(), -0.125) );
        ig = 1.0 / g;
        
        result = result.multiply(g);
        result = result.addScaled(iY, ig);
        result = result.multiply(0.5);
        
        Y = Y.multiply(g);
        Y = Y.addScaled(iX, ig);
        Y = Y.multiply(0.5);
    }
    
    return result;
};

x3dom.fields.SFMatrix4f.prototype.normInfinity = function () {
    var t = 0, m = 0;

    if ((t = Math.abs(this._00)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._01)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._02)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._03)) > m) {
        m = t;
    }
        
    if ((t = Math.abs(this._10)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._11)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._12)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._13)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._20)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._21)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._22)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._23)) > m) {
        m = t;
    }
        
    if ((t = Math.abs(this._30)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._31)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._32)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._33)) > m) {
        m = t;
    }

    return m;
};

x3dom.fields.SFMatrix4f.prototype.norm1_3x3 = function() {
    var max, t = 0;
    
    max = Math.abs(this._00) + 
          Math.abs(this._10) +
          Math.abs(this._20);
    
    if((t = Math.abs(this._01) +
            Math.abs(this._11) +
            Math.abs(this._21)  ) > max)
    {
        max = t;
    }
    
    if((t = Math.abs(this._02) +
            Math.abs(this._12) +
            Math.abs(this._22)  ) > max)
    {
        max = t;
    }
    
    return max;
};

x3dom.fields.SFMatrix4f.prototype.normInf_3x3 = function() {
    var max, t = 0;
    
    max = Math.abs(this._00) + 
          Math.abs(this._01) +
          Math.abs(this._02);
    
    if((t = Math.abs(this._10) +
            Math.abs(this._11) +
            Math.abs(this._12)  ) > max)
    {
        max = t;
    }
    
    if((t = Math.abs(this._20) +
            Math.abs(this._21) +
            Math.abs(this._22)  ) > max)
    {
        max = t;
    }
    
    return max;
};

x3dom.fields.SFMatrix4f.prototype.adjointT_3x3 = function () {
	var result = x3dom.fields.SFMatrix4f.identity();
	
    result._00 = this._11 * this._22 - this._12 * this._21;
    result._01 = this._12 * this._20 - this._10 * this._22;
    result._02 = this._10 * this._21 - this._11 * this._20;
    
    result._10 = this._21 * this._02 - this._22 * this._01;
    result._11 = this._22 * this._00 - this._20 * this._02;
    result._12 = this._20 * this._01 - this._21 * this._00;
    
    result._20 = this._01 * this._12 - this._02 * this._11;
    result._21 = this._02 * this._10 - this._00 * this._12;
    result._22 = this._00 * this._11 - this._01 * this._10;
	
	return result;
};

x3dom.fields.SFMatrix4f.prototype.equals = function (that) {
    var eps = 0.000000000001;
    return Math.abs(this._00-that._00) < eps && Math.abs(this._01-that._01) < eps && 
           Math.abs(this._02-that._02) < eps && Math.abs(this._03-that._03) < eps &&
           Math.abs(this._10-that._10) < eps && Math.abs(this._11-that._11) < eps && 
           Math.abs(this._12-that._12) < eps && Math.abs(this._13-that._13) < eps &&
           Math.abs(this._20-that._20) < eps && Math.abs(this._21-that._21) < eps && 
           Math.abs(this._22-that._22) < eps && Math.abs(this._23-that._23) < eps &&
           Math.abs(this._30-that._30) < eps && Math.abs(this._31-that._31) < eps && 
           Math.abs(this._32-that._32) < eps && Math.abs(this._33-that._33) < eps;
};

/** Decomposes the matrix into a translation, rotation, scale,
 *  and scale orientation. Any projection information is discarded.
 *  The decomposition depends upon choice of center point for
 *  rotation and scaling, which is optional as the last parameter.
 *  (Note that quaternions need to be converted via .toAxisAngle()
 *  to an axis/angle pair for being used in the x3d dom tree.)
 */
x3dom.fields.SFMatrix4f.prototype.getTransform = function(
				translation, rotation, scaleFactor, scaleOrientation, center) 
{
	var m = x3dom.fields.SFMatrix4f.identity();
	
	if (arguments.length > 4) {
		m = x3dom.fields.SFMatrix4f.translation(center.negate());
		m = m.mult(this);
		
		var c = x3dom.fields.SFMatrix4f.translation(center);
		m = m.mult(c);
	}
	else {
		m.setValues(this);
	}
	
	var flip = m.decompose(translation, rotation, scaleFactor, scaleOrientation);
	
	scaleFactor.setValues(scaleFactor.multiply(flip));
};

x3dom.fields.SFMatrix4f.prototype.decompose = function(t, r, s, so) 
{
	var A = x3dom.fields.SFMatrix4f.identity();
	A.setValues(this);
	
    var Q  = x3dom.fields.SFMatrix4f.identity(),
		S  = x3dom.fields.SFMatrix4f.identity(),
		SO = x3dom.fields.SFMatrix4f.identity();
	
	t.x = A._03;
    t.y = A._13;
    t.z = A._23;
    
    A._03 = 0.0;
    A._13 = 0.0;
    A._23 = 0.0;
    
    A._30 = 0.0;
    A._31 = 0.0;
    A._32 = 0.0;
	
	var det = A.polarDecompose(Q, S);
	   
    var f = 1.0;

    if (det < 0.0) {
        Q = Q.negate();
        f = -1.0;
    }
    else {
        f = 1.0;
    }
    
    r.setValue(Q);
    
    S.spectralDecompose(SO, s);
    
    so.setValue(SO);
	
	return f;
};

x3dom.fields.SFMatrix4f.prototype.polarDecompose = function(Q, S)
{
    var TOL = 0.000001;  //1.0e-6
	
    var Mk = this.transpose();
    
    var Ek = x3dom.fields.SFMatrix4f.identity(); 
	var MkAdjT;
	
    var Mk_one = Mk.norm1_3x3();
    var Mk_inf = Mk.normInf_3x3();
    
    var MkAdjT_one, MkAdjT_inf;
    var Ek_one, Mk_det;
       
    do
    {
        // compute transpose of adjoint
		MkAdjT = Mk.adjointT_3x3();
        
        // Mk_det = det(Mk) -- computed from the adjoint        
        Mk_det = Mk._00 * MkAdjT._00 + 
                 Mk._01 * MkAdjT._01 +
                 Mk._02 * MkAdjT._02;
        
        // should this be a close to zero test ?
        if(Mk_det === 0)
        {
            x3dom.debug.logWarning("polarDecompose: Mk_det == 0.0");
            break;
        }
        
        MkAdjT_one = MkAdjT.norm1_3x3();
        MkAdjT_inf = MkAdjT.normInf_3x3();
        
        // compute update factors
        var gamma = Math.sqrt( Math.sqrt((MkAdjT_one * MkAdjT_inf) / 
							  (Mk_one * Mk_inf)) / Math.abs(Mk_det) );
        
        var g1 = 0.5 * gamma;
        var g2 = 0.5 / (gamma * Mk_det);
           
        Ek.setValues(Mk);
        Mk = Mk.multiply (g1);         // this does:
        Mk = Mk.addScaled(MkAdjT, g2); // Mk = g1 * Mk + g2 * MkAdjT
        Ek = Ek.addScaled(Mk, -1.0);   // Ek -= Mk;
        
        Ek_one = Ek.norm1_3x3();
        Mk_one = Mk.norm1_3x3();
        Mk_inf = Mk.normInf_3x3();
        
    } while (Ek_one > (Mk_one * TOL));
    
    Q.setValues(Mk.transpose());
    S.setValues(Mk.mult(this));

    for (var i = 0; i < 3; ++i)
    {
        for (var j = i; j < 3; ++j)
        {
            S['_'+j+i] = 0.5 * (S['_'+j+i] + S['_'+i+j]);
			S['_'+i+j] = 0.5 * (S['_'+j+i] + S['_'+i+j]);
        }
    }
    
    return Mk_det;
};

x3dom.fields.SFMatrix4f.prototype.spectralDecompose = function(SO, k)
{
    var next = [1, 2, 0];
    var maxIterations = 20;
    var iter, i, j;
    var diag = [], offDiag = [];
    
    diag[0] = this._00;
    diag[1] = this._11;
    diag[2] = this._22;
    
    offDiag[0] = this._12;
    offDiag[1] = this._20;
    offDiag[2] = this._01;
    
    for (iter = 0; iter < maxIterations; ++iter)
    {
        var sm = Math.abs(offDiag[0]) +  Math.abs(offDiag[1]) +  Math.abs(offDiag[2]);
        
        if (sm === 0) {        
            break;
        }
        
        for (i = 2; i >= 0; --i)
        {
            var p = next[i];
            var q = next[p];
            
            var absOffDiag = Math.abs(offDiag[i]);
            var g          = 100.0 * absOffDiag; 
            
            if (absOffDiag > 0.0)
            {
                var t, h = diag[q] - diag[p];
                var absh = Math.abs(h);
                
                if (absh + g == absh)
                {
                    t = offDiag[i] / h;
                }
                else
                {
                    var theta = 0.5 * h / offDiag[i];
                    t = 1.0 / (Math.abs(theta) + Math.sqrt(theta * theta + 1.0));
                    
                    t = theta < 0.0 ? -t : t;
                }
            
                var c = 1.0 / Math.sqrt(t * t + 1.0);
                var s = t * c;
                
                var tau = s / (c + 1.0);
                var ta  = t * offDiag[i];
                
                offDiag[i] = 0.0;
                
                diag[p] -= ta;
                diag[q] += ta;
                
                var offDiagq = offDiag[q];
                
                offDiag[q] -= s * (offDiag[p] + tau * offDiagq);
                offDiag[p] += s * (offDiagq - tau * offDiag[p]);
                
                for (j = 2; j >= 0; --j)
                {
                    var a = SO['_'+j+p];
                    var b = SO['_'+j+q];
                    
                    SO['_'+j+p] -= s * (b + tau * a);
                    SO['_'+j+q] += s * (a - tau * b);
                }
            }
        }
    }
    
    k.x = diag[0];
    k.y = diag[1];
    k.z = diag[2];
};

x3dom.fields.SFMatrix4f.prototype.log = function () {
    var maxiter = 12;
    var k = 0, i = 0;
    var eps = 0.000000000001;
    var A = x3dom.fields.SFMatrix4f.identity(), 
        Z = x3dom.fields.SFMatrix4f.identity(), 
        result = x3dom.fields.SFMatrix4f.identity();

    // Take repeated square roots to reduce spectral radius
    A.setValues(this);
    Z.setValues(this);

    Z._00 -= 1;
    Z._11 -= 1;
    Z._22 -= 1;
    Z._33 -= 1;

    while (Z.normInfinity() > 0.5)
    {
        A = A.sqrt( );
        Z.setValues(A);

        Z._00 -= 1;
        Z._11 -= 1;
        Z._22 -= 1;
        Z._33 -= 1;

        k++;
    }

    A._00 -= 1;
    A._11 -= 1;
    A._22 -= 1;
    A._33 -= 1;

    A = A.negate();
    result.setValues(A);
    Z.setValues(A);

    i = 1;

    while (Z.normInfinity() > eps && i < maxiter)
    {
        Z = Z.mult(A);

        i++;

        result = result.addScaled(Z, (1.0 / i));
    }

    result = result.multiply((-1.0) * (1 << k));
    
    return result;
};

x3dom.fields.SFMatrix4f.prototype.exp = function () {
    var q = 6;
    var A = x3dom.fields.SFMatrix4f.identity(), 
        D = x3dom.fields.SFMatrix4f.identity(), 
        N = x3dom.fields.SFMatrix4f.identity(), 
        result = x3dom.fields.SFMatrix4f.identity();
    var j = 1, k = 0, c = 1.0;
    
    A.setValues(this);

    j += Math.floor(Math.log(A.normInfinity() / 0.693));
    
    if (j < 0) {
        j = 0;
    }

    A = A.multiply(1.0 / (1 << j));

    for (k = 1; k <= q; k++)
    {
        c *= (q - k + 1) / (k * (2 * q - k + 1));

        result = A.mult(result);

        N = N.addScaled(result, c);

        if (k % 2) 
        {
            D = D.addScaled(result, -c);
        }
        else
        {
            D = D.addScaled(result, c);
        }
    }
    
    result = D.inverse().mult(N);

    for (k = 0; k < j; k++)
    {
        result = result.mult(result);
    }
    
    return result;
};

x3dom.fields.SFMatrix4f.prototype.det3 = function (
                a1, a2, a3, b1, b2, b3, c1, c2, c3) {
    var d = (a1 * b2 * c3) + (a2 * b3 * c1) + (a3 * b1 * c2) -
            (a1 * b3 * c2) - (a2 * b1 * c3) - (a3 * b2 * c1);
    return d;
};

x3dom.fields.SFMatrix4f.prototype.det = function () {
    var a1, a2, a3, a4,
        b1, b2, b3, b4,
        c1, c2, c3, c4,
        d1, d2, d3, d4;

    a1 = this._00;
    b1 = this._10;
    c1 = this._20;
    d1 = this._30;

    a2 = this._01;
    b2 = this._11;
    c2 = this._21;
    d2 = this._31;

    a3 = this._02;
    b3 = this._12;
    c3 = this._22;
    d3 = this._32;

    a4 = this._03;
    b4 = this._13;
    c4 = this._23;
    d4 = this._33;
    
    var d = + a1 * this.det3(b2, b3, b4, c2, c3, c4, d2, d3, d4) - 
        b1 * this.det3(a2, a3, a4, c2, c3, c4, d2, d3, d4) + 
        c1 * this.det3(a2, a3, a4, b2, b3, b4, d2, d3, d4) - 
        d1 * this.det3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
    return d;
};

x3dom.fields.SFMatrix4f.prototype.inverse = function () {
    var a1, a2, a3, a4,
        b1, b2, b3, b4,
        c1, c2, c3, c4,
        d1, d2, d3, d4;

    a1 = this._00;
    b1 = this._10;
    c1 = this._20;
    d1 = this._30;

    a2 = this._01;
    b2 = this._11;
    c2 = this._21;
    d2 = this._31;

    a3 = this._02;
    b3 = this._12;
    c3 = this._22;
    d3 = this._32;

    a4 = this._03;
    b4 = this._13;
    c4 = this._23;
    d4 = this._33;

    var rDet = this.det();

    //if (Math.abs(rDet) < x3dom.fields.Eps)
    if (Math.abs(rDet) === 0)
    {
        x3dom.debug.logWarning("Invert matrix: singular matrix, no inverse!");
        return x3dom.fields.SFMatrix4f.identity();
    }

    rDet = 1.0 / rDet;

    return new x3dom.fields.SFMatrix4f(
    +this.det3(b2, b3, b4, c2, c3, c4, d2, d3, d4) * rDet,
    -this.det3(a2, a3, a4, c2, c3, c4, d2, d3, d4) * rDet,
    +this.det3(a2, a3, a4, b2, b3, b4, d2, d3, d4) * rDet,
    -this.det3(a2, a3, a4, b2, b3, b4, c2, c3, c4) * rDet,
    -this.det3(b1, b3, b4, c1, c3, c4, d1, d3, d4) * rDet,
    +this.det3(a1, a3, a4, c1, c3, c4, d1, d3, d4) * rDet,
    -this.det3(a1, a3, a4, b1, b3, b4, d1, d3, d4) * rDet,
    +this.det3(a1, a3, a4, b1, b3, b4, c1, c3, c4) * rDet,
    +this.det3(b1, b2, b4, c1, c2, c4, d1, d2, d4) * rDet,
    -this.det3(a1, a2, a4, c1, c2, c4, d1, d2, d4) * rDet,
    +this.det3(a1, a2, a4, b1, b2, b4, d1, d2, d4) * rDet,
    -this.det3(a1, a2, a4, b1, b2, b4, c1, c2, c4) * rDet,
    -this.det3(b1, b2, b3, c1, c2, c3, d1, d2, d3) * rDet,
    +this.det3(a1, a2, a3, c1, c2, c3, d1, d2, d3) * rDet,
    -this.det3(a1, a2, a3, b1, b2, b3, d1, d2, d3) * rDet,
    +this.det3(a1, a2, a3, b1, b2, b3, c1, c2, c3) * rDet
    );
};

x3dom.fields.SFMatrix4f.prototype.toString = function () {
    return '[SFMatrix4f \n' +
		this._00.toFixed(6)+', '+this._01.toFixed(6)+', '+
		this._02.toFixed(6)+', '+this._03.toFixed(6)+', \n'+
        this._10.toFixed(6)+', '+this._11.toFixed(6)+', '+
		this._12.toFixed(6)+', '+this._13.toFixed(6)+', \n'+
        this._20.toFixed(6)+', '+this._21.toFixed(6)+', '+
		this._22.toFixed(6)+', '+this._23.toFixed(6)+', \n'+
        this._30.toFixed(6)+', '+this._31.toFixed(6)+', '+
		this._32.toFixed(6)+', '+this._33.toFixed(6)+']';
};

x3dom.fields.SFMatrix4f.prototype.setValueByStr = function(str) {
    var needTranspose = false;
    var val = /matrix.*\((.+)\)/;
    if (val.exec(str)) {
        str = RegExp.$1;
        needTranspose = true;
    }
    var arr = Array.map(str.split(/[,\s]+/), function (n) { return +n; });
    if (arr.length >= 16)
    {
        if (!needTranspose) {
            this._00 = arr[0];  this._01 = arr[1];  this._02 = arr[2];  this._03 = arr[3];
            this._10 = arr[4];  this._11 = arr[5];  this._12 = arr[6];  this._13 = arr[7];
            this._20 = arr[8];  this._21 = arr[9];  this._22 = arr[10]; this._23 = arr[11];
            this._30 = arr[12]; this._31 = arr[13]; this._32 = arr[14]; this._33 = arr[15];
        }
        else {
            this._00 = arr[0];  this._01 = arr[4];  this._02 = arr[8];  this._03 = arr[12];
            this._10 = arr[1];  this._11 = arr[5];  this._12 = arr[9];  this._13 = arr[13];
            this._20 = arr[2];  this._21 = arr[6];  this._22 = arr[10]; this._23 = arr[14];
            this._30 = arr[3];  this._31 = arr[7];  this._32 = arr[11]; this._33 = arr[15];
        }
    }
    else if (arr.length === 6) {
        this._00 = arr[0]; this._01 = arr[1]; this._02 = 0; this._03 = arr[4];
        this._10 = arr[2]; this._11 = arr[3]; this._12 = 0; this._13 = arr[5];
        this._20 = 0; this._21 = 0; this._22 = 1; this._23 = 0;
        this._30 = 0; this._31 = 0; this._32 = 0; this._33 = 1;
    }
    else {
        x3dom.debug.logWarning("SFMatrix4f - can't parse string: " + str);
    }
    return this;
};


/** SFVec2f constructor.
    @class Represents a SFVec2f
  */
x3dom.fields.SFVec2f = function(x, y) {
    if (arguments.length === 0) {
        this.x = this.y = 0;
    }
    else {
        this.x = x;
        this.y = y;
    }
};

x3dom.fields.SFVec2f.parse = function (str) {
    var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec(str);
    return new x3dom.fields.SFVec2f(+m[1], +m[2]);
};

x3dom.fields.SFVec2f.prototype.setValues = function (that) {
    this.x = that.x;
    this.y = that.y;
};

x3dom.fields.SFVec2f.prototype.add = function (that) {
    return new x3dom.fields.SFVec2f(this.x+that.x, this.y+that.y);
};

x3dom.fields.SFVec2f.prototype.subtract = function (that) {
    return new x3dom.fields.SFVec2f(this.x-that.x, this.y-that.y);
};

x3dom.fields.SFVec2f.prototype.negate = function () {
    return new x3dom.fields.SFVec2f(-this.x, -this.y);
};

x3dom.fields.SFVec2f.prototype.dot = function (that) {
    return this.x * that.x + this.y * that.y;
};

x3dom.fields.SFVec2f.prototype.reflect = function (n) {
    var d2 = this.dot(n)*2;
    return new x3dom.fields.SFVec2f(this.x-d2*n.x, this.y-d2*n.y);
};

x3dom.fields.SFVec2f.prototype.normalize = function (that) {
    var n = this.length();
    if (n) { n = 1.0 / n; }
    return new x3dom.fields.SFVec2f(this.x*n, this.y*n);
};

x3dom.fields.SFVec2f.prototype.multComponents = function (that) {
    return new x3dom.fields.SFVec2f(this.x*that.x, this.y*that.y);
};

x3dom.fields.SFVec2f.prototype.multiply = function (n) {
    return new x3dom.fields.SFVec2f(this.x*n, this.y*n);
};

x3dom.fields.SFVec2f.prototype.divide = function (n) {
    var denom = n ? (1.0 / n) : 1.0;
    return new x3dom.fields.SFVec2f(this.x*denom, this.y*denom);
};

x3dom.fields.SFVec2f.prototype.equals = function (that, eps) {
    return Math.abs(this.x - that.x) < eps && 
           Math.abs(this.y - that.y) < eps;
};

x3dom.fields.SFVec2f.prototype.length = function() {
    return Math.sqrt((this.x*this.x) + (this.y*this.y));
};

x3dom.fields.SFVec2f.prototype.toGL = function () {
    return [ this.x, this.y ];
};

x3dom.fields.SFVec2f.prototype.toString = function () {
    return "{ x " + this.x + " y " + this.y + " }";
};

x3dom.fields.SFVec2f.prototype.setValueByStr = function(str) {
    var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec(str);
    this.x = +m[1];
    this.y = +m[2];
    return this;
};


/** SFVec3f constructor.
    @class Represents a SFVec3f
  */
x3dom.fields.SFVec3f = function(x, y, z) {
    if (arguments.length === 0) {
        this.x = this.y = this.z = 0;
    }
    else {
        this.x = x;
        this.y = y;
        this.z = z;
    }
};

x3dom.fields.SFVec3f.copy = function(v) {
    return new x3dom.fields.SFVec3f(v.x, v.y, v.z);
};

x3dom.fields.SFVec3f.MIN = function() {
    return new x3dom.fields.SFVec3f(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
};

x3dom.fields.SFVec3f.MAX = function() {
    return new x3dom.fields.SFVec3f(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
};

x3dom.fields.SFVec3f.parse = function (str) {
    try {
        var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec(str);
        return new x3dom.fields.SFVec3f(+m[1], +m[2], +m[3]);
    }
    catch (e) {
        // allow automatic type conversion as is convenient for shaders
        var c = x3dom.fields.SFColor.colorParse(str);
        return new x3dom.fields.SFVec3f(c.r, c.g, c.b);
    }
};

x3dom.fields.SFVec3f.prototype.setValues = function (that) {
    this.x = that.x;
    this.y = that.y;
    this.z = that.z;   
};

x3dom.fields.SFVec3f.prototype.add = function (that) {
    return new x3dom.fields.SFVec3f(this.x + that.x, this.y + that.y, this.z + that.z);
};

x3dom.fields.SFVec3f.prototype.addScaled = function (that, s) {
    return new x3dom.fields.SFVec3f(this.x + s*that.x, this.y + s*that.y, this.z + s*that.z);
};

x3dom.fields.SFVec3f.prototype.subtract = function (that) {
    return new x3dom.fields.SFVec3f(this.x - that.x, this.y - that.y, this.z - that.z);
};

x3dom.fields.SFVec3f.prototype.negate = function () {
    return new x3dom.fields.SFVec3f(-this.x, -this.y, -this.z);
};

x3dom.fields.SFVec3f.prototype.dot = function (that) {
    return (this.x*that.x + this.y*that.y + this.z*that.z);
};

x3dom.fields.SFVec3f.prototype.cross = function (that) {
    return new x3dom.fields.SFVec3f( this.y*that.z - this.z*that.y, 
                                    this.z*that.x - this.x*that.z, 
                                    this.x*that.y - this.y*that.x );
};

x3dom.fields.SFVec3f.prototype.reflect = function (n) {
    var d2 = this.dot(n)*2;
    return new x3dom.fields.SFVec3f(this.x - d2*n.x, this.y - d2*n.y, this.z - d2*n.z);
};

x3dom.fields.SFVec3f.prototype.length = function() {
    return Math.sqrt((this.x*this.x) + (this.y*this.y) + (this.z*this.z));
};

x3dom.fields.SFVec3f.prototype.normalize = function (that) {
    var n = this.length();
    if (n) { n = 1.0 / n; }
    return new x3dom.fields.SFVec3f(this.x*n, this.y*n, this.z*n);
};

x3dom.fields.SFVec3f.prototype.multComponents = function (that) {
    return new x3dom.fields.SFVec3f(this.x*that.x, this.y*that.y, this.z*that.z);
};

x3dom.fields.SFVec3f.prototype.multiply = function (n) {
    return new x3dom.fields.SFVec3f(this.x*n, this.y*n, this.z*n);
};

x3dom.fields.SFVec3f.prototype.divide = function (n) {
    var denom = n ? (1.0 / n) : 1.0;
    return new x3dom.fields.SFVec3f(this.x*denom, this.y*denom, this.z*denom);
};

x3dom.fields.SFVec3f.prototype.equals = function (that, eps) {
    return Math.abs(this.x - that.x) < eps && 
           Math.abs(this.y - that.y) < eps &&
           Math.abs(this.z - that.z) < eps;
};

x3dom.fields.SFVec3f.prototype.toGL = function () {
    return [ this.x, this.y, this.z ];
};

x3dom.fields.SFVec3f.prototype.toString = function () {
    return "{ x " + this.x + " y " + this.y + " z " + this.z + " }";
};

x3dom.fields.SFVec3f.prototype.setValueByStr = function(str) {
    try {
        var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec(str);
        this.x = +m[1];
        this.y = +m[2];
        this.z = +m[3];
    }
    catch (e) {
        // allow automatic type conversion as is convenient for shaders
        var c = x3dom.fields.SFColor.colorParse(str);
        this.x = c.r;
        this.y = c.g;
        this.z = c.b;
    }
    return this;
};


/** Quaternion constructor.
    @class Represents a Quaternion
  */
x3dom.fields.Quaternion = function(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
};

x3dom.fields.Quaternion.prototype.multiply = function (that) {
    return new x3dom.fields.Quaternion(
        this.w*that.x + this.x*that.w + this.y*that.z - this.z*that.y,
        this.w*that.y + this.y*that.w + this.z*that.x - this.x*that.z,
        this.w*that.z + this.z*that.w + this.x*that.y - this.y*that.x,
        this.w*that.w - this.x*that.x - this.y*that.y - this.z*that.z
    );
};

x3dom.fields.Quaternion.parseAxisAngle = function (str) {
    var m = /^\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*$/.exec(str);
    return x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(+m[1], +m[2], +m[3]), +m[4]);
};

x3dom.fields.Quaternion.axisAngle = function (axis, a) {
    var t = axis.length();
    
    if (t > x3dom.fields.Eps)
    {
        var s = Math.sin(a/2) / t;
        var c = Math.cos(a/2);
        return new x3dom.fields.Quaternion(axis.x*s, axis.y*s, axis.z*s, c);
    }
    else
    {
        return new x3dom.fields.Quaternion(0, 0, 0, 1);
    }
};

x3dom.fields.Quaternion.prototype.toMatrix = function () {
    var xx = this.x * this.x;
    var xy = this.x * this.y;
    var xz = this.x * this.z;
    var yy = this.y * this.y;
    var yz = this.y * this.z;
    var zz = this.z * this.z;
    var wx = this.w * this.x;
    var wy = this.w * this.y;
    var wz = this.w * this.z;

    return new x3dom.fields.SFMatrix4f(
        1 - 2 * (yy + zz), 2 * (xy - wz), 2 * (xz + wy), 0,
        2 * (xy + wz), 1 - 2 * (xx + zz), 2 * (yz - wx), 0,
        2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (xx + yy), 0,
        0, 0, 0, 1
    );
};

x3dom.fields.Quaternion.prototype.toAxisAngle = function()
{
    var x = 0, y = 0, z = 0;
    var s = 0, a = 0;
    var that = this;
    
    if ( this.w > 1 )
    {
        that = x3dom.fields.Quaternion.normalize( this );
    }
    
    a = 2 * Math.acos( that.w );
    s = Math.sqrt( 1 - that.w * that.w );
    
    if ( s === 0 ) //< x3dom.fields.Eps )
    {
        x = that.x;
        y = that.y;
        z = that.z;
    }
    else
    {
        x = that.x / s;
        y = that.y / s;
        z = that.z / s;
    }
    
    return [ new x3dom.fields.SFVec3f(x,y,z), a ];
};

x3dom.fields.Quaternion.prototype.angle = function()
{
    return 2 * Math.acos(this.w);
};

x3dom.fields.Quaternion.prototype.setValue = function(matrix)
{
    var tr, s = 1;
    var qt = [0, 0, 0];

    var i = 0, j = 0, k = 0;
    var nxt = [1, 2, 0];

    tr = matrix._00 + matrix._11 + matrix._22;
	
    if (tr > 0.0)
    {
        s = Math.sqrt(tr + 1.0);

        this.w = s * 0.5;

        s = 0.5 / s;

        this.x = (matrix._21 - matrix._12) * s;
        this.y = (matrix._02 - matrix._20) * s;
        this.z = (matrix._10 - matrix._01) * s;
    }
    else
    {
        if (matrix._11 > matrix._00) {
            i = 1;
		}
        else {
            i = 0;
		}

        if (matrix._22 > matrix.at(i, i)) {
            i = 2;
		}

        j = nxt[i];
        k = nxt[j];

        s = Math.sqrt(matrix.at(i, i) - (matrix.at(j, j) + matrix.at(k, k)) + 1.0);

        qt[i] = s * 0.5;
        s     = 0.5 / s;

        this.w = (matrix.at(k, j) - matrix.at(j, k)) * s;

        qt[j] = (matrix.at(j, i) + matrix.at(i, j)) * s;
        qt[k] = (matrix.at(k, i) + matrix.at(i, k)) * s;

        this.x = qt[0];
        this.y = qt[1];
        this.z = qt[2];
    }

    if (this.w > 1.0 || this.w < -1.0)
    {
        var errThreshold = 1 + (x3dom.fields.Eps * 100);

        if (this.w > errThreshold || this.w < -errThreshold)
        {
			// When copying, then everything, incl. the famous OpenSG MatToQuat bug
            x3dom.debug.logInfo("MatToQuat: BUG: |quat[4]| (" + this.w +") >> 1.0 !");
        }

        if (this.w > 1.0) {
            this.w = 1.0;
        }
        else {
            this.w = -1.0;
        }
    }
};

x3dom.fields.Quaternion.prototype.dot = function (that) {
    return this.x*that.x + this.y*that.y + this.z*that.z + this.w*that.w;
};

x3dom.fields.Quaternion.prototype.add = function (that) {
    return new x3dom.fields.Quaternion(this.x + that.x, this.y + that.y, this.z + that.z, this.w + that.w);
};

x3dom.fields.Quaternion.prototype.subtract = function (that) {
    return new x3dom.fields.Quaternion(this.x - that.x, this.y - that.y, this.z - that.z, this.w - that.w);
};

x3dom.fields.Quaternion.prototype.setValues = function (that) { 
    this.x = that.x;
    this.y = that.y;
    this.z = that.z;
    this.w = that.w;
};

x3dom.fields.Quaternion.prototype.equals = function (that, eps) {
    return Math.abs(this.x - that.x) < eps && 
           Math.abs(this.y - that.y) < eps &&
           Math.abs(this.z - that.z) < eps && 
           Math.abs(this.w - that.w) < eps;
};

x3dom.fields.Quaternion.prototype.multScalar = function (s) {
    return new x3dom.fields.Quaternion(this.x*s, this.y*s, this.z*s, this.w*s);
};

x3dom.fields.Quaternion.prototype.normalize = function (that) {
    var d2 = this.dot(that);
    var id = 1.0;
    if (d2) { id = 1.0 / Math.sqrt(d2); }
    return new x3dom.fields.Quaternion(this.x*id, this.y*id, this.z*id, this.w*id);
};

x3dom.fields.Quaternion.prototype.negate = function() {
    return new x3dom.fields.Quaternion(-this.x, -this.y, -this.z, -this.w);
};

x3dom.fields.Quaternion.prototype.inverse = function () {
    return new x3dom.fields.Quaternion(-this.x, -this.y, -this.z, this.w);
};

x3dom.fields.Quaternion.prototype.slerp = function (that, t) {
    // calculate the cosine
    var cosom = this.dot(that);
    var rot1;

    // adjust signs if necessary
    if (cosom < 0.0)
    {
        cosom = -cosom;
        rot1 = that.negate();
    }
    else
    {
        rot1 = new x3dom.fields.Quaternion(that.x, that.y, that.z, that.w);
    }

    // calculate interpolating coeffs
    var scalerot0, scalerot1;
    
    if ((1.0 - cosom) > 0.00001)
    {
        // standard case
        var omega = Math.acos(cosom);
        var sinom = Math.sin(omega);
        scalerot0 = Math.sin((1.0 - t) * omega) / sinom;
        scalerot1 = Math.sin(t * omega) / sinom;
    }
    else
    {
        // rot0 and rot1 very close - just do linear interp.
        scalerot0 = 1.0 - t;
        scalerot1 = t;
    }

    // build the new quaternion
    return this.multScalar(scalerot0).add(rot1.multScalar(scalerot1));
};

x3dom.fields.Quaternion.rotateFromTo = function (fromVec, toVec) {
    var from = fromVec.normalize();
    var to   = toVec.normalize();
    var cost = from.dot(to);

    // check for degeneracies
    if (cost > 0.99999)
    {
        // vectors are parallel
        return new x3dom.fields.Quaternion(0, 0, 0, 1);
    }
    else if (cost < -0.99999)
    {
        // vectors are opposite
        // find an axis to rotate around, which should be
        // perpendicular to the original axis
        // Try cross product with (1,0,0) first, if that's one of our
        // original vectors then try  (0,1,0).
        var cAxis = new x3dom.fields.SFVec3f(1, 0, 0);

        var tmp = from.cross(cAxis);

        if (tmp.length() < 0.00001)
        {
            cAxis.x = 0;
            cAxis.y = 1;
            cAxis.z = 0;

            tmp = from.cross(cAxis);
        }
        tmp = tmp.normalize();

        return x3dom.fields.Quaternion.axisAngle(tmp, Math.PI);
    }

    var axis = fromVec.cross(toVec);
    axis = axis.normalize();

    // use half-angle formulae
    // sin^2 t = ( 1 - cos (2t) ) / 2
    var s = Math.sqrt(0.5 * (1.0 - cost));
    axis = axis.multiply(s);

    // scale the axis by the sine of half the rotation angle to get
    // the normalized quaternion
    // cos^2 t = ( 1 + cos (2t) ) / 2
    // w part is cosine of half the rotation angle
    s = Math.sqrt(0.5 * (1.0 + cost));
    
    return new x3dom.fields.Quaternion(axis.x, axis.y, axis.z, s);
};

x3dom.fields.Quaternion.prototype.toGL = function () {
    var val = this.toAxisAngle();
    return [ val[0].x, val[0].y, val[0].z, val[1] ];
};

x3dom.fields.Quaternion.prototype.toString = function () {
    return '((' + this.x + ', ' + this.y + ', ' + this.z + '), ' + this.w + ')';
};

x3dom.fields.Quaternion.prototype.setValueByStr = function(str) {
    var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec(str);
    var quat = x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(+m[1], +m[2], +m[3]), +m[4]);
    this.x = quat.x;
    this.y = quat.y;
    this.z = quat.z;
    this.w = quat.w;
    return this;
};


/** SFColor constructor.
    @class Represents a SFColor
  */
x3dom.fields.SFColor = function(r, g, b) {
    if (arguments.length === 0) {
        this.r = this.g = this.b = 0;
    }
    else {
        this.r = r;
        this.g = g;
        this.b = b;
    }
};

x3dom.fields.SFColor.parse = function(str) {
    try {
        var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec(str);
        return new x3dom.fields.SFColor( +m[1], +m[2], +m[3] );
    }
    catch (e) {
        return x3dom.fields.SFColor.colorParse(str);
    }
};

x3dom.fields.SFColor.prototype.setHSV = function (h, s, v) {
    x3dom.debug.logWarning("SFColor.setHSV() NYI");
};

x3dom.fields.SFColor.prototype.getHSV = function () {
    var h = 0, s = 0, v = 0;
    x3dom.debug.logWarning("SFColor.getHSV() NYI");
    return [ h, s, v ];
};

x3dom.fields.SFColor.prototype.setValues = function (color) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;   
};

x3dom.fields.SFColor.prototype.equals = function (that, eps) {
    return Math.abs(this.r - that.r) < eps && 
           Math.abs(this.g - that.g) < eps &&
           Math.abs(this.b - that.b) < eps;
};

x3dom.fields.SFColor.prototype.add = function (that) {
    return new x3dom.fields.SFColor(this.r + that.r, this.g + that.g, this.b + that.b);
};

x3dom.fields.SFColor.prototype.subtract = function (that) {
    return new x3dom.fields.SFColor(this.r - that.r, this.g - that.g, this.b - that.b);
};

x3dom.fields.SFColor.prototype.multiply = function (n) {
    return new x3dom.fields.SFColor(this.r*n, this.g*n, this.b*n);
};

x3dom.fields.SFColor.prototype.toGL = function () {
    return [ this.r, this.g, this.b ];
};

x3dom.fields.SFColor.prototype.toString = function() {
    return "{ r " + this.r + " g " + this.g + " b " + this.b + " }";
};

x3dom.fields.SFColor.prototype.setValueByStr = function(str) {
    try {
        var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec(str);
        this.r = +m[1];
        this.g = +m[2];
        this.b = +m[3];
    }
    catch (e) {
        var c = x3dom.fields.SFColor.colorParse(str);
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
    }
    return this;
};

x3dom.fields.SFColor.colorParse = function(color) {
    var red = 0, green = 0, blue = 0;
    
    // definition of css color names
    var color_names = {
        aliceblue: 'f0f8ff',    antiquewhite: 'faebd7', aqua: '00ffff',
        aquamarine: '7fffd4',   azure: 'f0ffff',        beige: 'f5f5dc',
        bisque: 'ffe4c4',       black: '000000',        blanchedalmond: 'ffebcd',
        blue: '0000ff',         blueviolet: '8a2be2',   brown: 'a52a2a',
        burlywood: 'deb887',    cadetblue: '5f9ea0',    chartreuse: '7fff00',
        chocolate: 'd2691e',    coral: 'ff7f50',        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',     crimson: 'dc143c',      cyan: '00ffff',
        darkblue: '00008b',     darkcyan: '008b8b',     darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',     darkgreen: '006400',    darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',  darkolivegreen: '556b2f',darkorange: 'ff8c00',
        darkorchid: '9932cc',   darkred: '8b0000',      darksalmon: 'e9967a',
        darkseagreen: '8fbc8f', darkslateblue: '483d8b',darkslategray: '2f4f4f',
        darkturquoise: '00ced1',darkviolet: '9400d3',   deeppink: 'ff1493',
        deepskyblue: '00bfff',  dimgray: '696969',      dodgerblue: '1e90ff',
        feldspar: 'd19275',     firebrick: 'b22222',    floralwhite: 'fffaf0',
        forestgreen: '228b22',  fuchsia: 'ff00ff',      gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',   gold: 'ffd700',         goldenrod: 'daa520',
        gray: '808080',         green: '008000',        greenyellow: 'adff2f',
        honeydew: 'f0fff0',     hotpink: 'ff69b4',      indianred : 'cd5c5c',
        indigo : '4b0082',      ivory: 'fffff0',        khaki: 'f0e68c',
        lavender: 'e6e6fa',     lavenderblush: 'fff0f5',lawngreen: '7cfc00',
        lemonchiffon: 'fffacd', lightblue: 'add8e6',    lightcoral: 'f08080',
        lightcyan: 'e0ffff',    lightgoldenrodyellow: 'fafad2', lightgrey: 'd3d3d3',
        lightgreen: '90ee90',   lightpink: 'ffb6c1',    lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',lightskyblue: '87cefa', lightslateblue: '8470ff',
        lightslategray: '778899',lightsteelblue: 'b0c4de',lightyellow: 'ffffe0',
        lime: '00ff00',         limegreen: '32cd32',    linen: 'faf0e6',
        magenta: 'ff00ff',      maroon: '800000',       mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',   mediumorchid: 'ba55d3', mediumpurple: '9370d8',
        mediumseagreen: '3cb371',mediumslateblue: '7b68ee', mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',mediumvioletred: 'c71585',midnightblue: '191970',
        mintcream: 'f5fffa',    mistyrose: 'ffe4e1',    moccasin: 'ffe4b5',
        navajowhite: 'ffdead',  navy: '000080',         oldlace: 'fdf5e6',
        olive: '808000',        olivedrab: '6b8e23',    orange: 'ffa500',
        orangered: 'ff4500',    orchid: 'da70d6',       palegoldenrod: 'eee8aa',
        palegreen: '98fb98',    paleturquoise: 'afeeee',palevioletred: 'd87093',
        papayawhip: 'ffefd5',   peachpuff: 'ffdab9',    peru: 'cd853f',
        pink: 'ffc0cb',         plum: 'dda0dd',         powderblue: 'b0e0e6',
        purple: '800080',       red: 'ff0000',          rosybrown: 'bc8f8f',
        royalblue: '4169e1',    saddlebrown: '8b4513',  salmon: 'fa8072',
        sandybrown: 'f4a460',   seagreen: '2e8b57',     seashell: 'fff5ee',
        sienna: 'a0522d',       silver: 'c0c0c0',       skyblue: '87ceeb',
        slateblue: '6a5acd',    slategray: '708090',    snow: 'fffafa',
        springgreen: '00ff7f',  steelblue: '4682b4',    tan: 'd2b48c',
        teal: '008080',         thistle: 'd8bfd8',      tomato: 'ff6347',
        turquoise: '40e0d0',    violet: 'ee82ee',       violetred: 'd02090',
        wheat: 'f5deb3',        white: 'ffffff',        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',       yellowgreen: '9acd32'
    };
    
    if (color_names[color]) {
        // first check if color is given as colorname
        color = "#" + color_names[color];
    }
    
    if (color.substr && color.substr(0,1) === "#") {
        color = color.substr(1);
        var len = color.length;
        
        if (len === 6) {
            red   = parseInt("0x"+color.substr(0,2), 16) / 255.0;
            green = parseInt("0x"+color.substr(2,2), 16) / 255.0;
            blue  = parseInt("0x"+color.substr(4,2), 16) / 255.0;
        }
        else if (len === 3) {
            red   = parseInt("0x"+color.substr(0,1), 16) / 15.0;
            green = parseInt("0x"+color.substr(1,1), 16) / 15.0;
            blue  = parseInt("0x"+color.substr(2,1), 16) / 15.0;
        }
    }
    
    return new x3dom.fields.SFColor( red, green, blue );
};


/** SFColor constructor.
    @class Represents a SFColor
  */
x3dom.fields.SFImage = function(w, h, c, arr) {
    if (arguments.length === 0) {
        this.width = this.height = this.comp = 0;
        this.array = [];
    }
    else {
        this.width = w;
        this.height = h;
        this.comp = c;
        arr.map( function(v) { this.array.push(v); }, this.array );
    }
};

x3dom.fields.SFImage.parse = function(str) {
    var img = new x3dom.fields.SFImage();
    img.setValueByStr(str);
    return img;
};

x3dom.fields.SFImage.prototype.setValueByStr = function(str) {
    var mc = str.match(/(\w+)/g);
    var n = mc.length;
    var c2 = 0;
    var hex = "0123456789ABCDEF";
    
    this.array = [];
    
    if (n > 2) {
        this.width = +mc[0];
        this.height = +mc[1];
        this.comp = +mc[2];
        c2 = 2 * this.comp;
    } else {
        this.width = 0;
        this.height = 0;
        this.comp = 0;
        return;
    }
    
    var len, i;
    for (i=3; i<n; i++) {
        if (!mc[i].substr) {
            continue;
        }
        
        if (mc[i].substr(1,1).toLowerCase() !== "x") {
            // TODO; optimize by directly parsing value!
            var out = "";
            var inp = parseInt(mc[i], 10);
            
            while (inp !== 0) {
              out = hex.charAt(inp%16) + out;
              inp = inp >> 4;
            }
            len = out.length;
            while (out.length < c2) {
                out = "0" + out;
            }
            mc[i] = "0x" + out;
        }
        
        if (mc[i].substr(1,1).toLowerCase() === "x") {
            mc[i] = mc[i].substr(2);
            len = mc[i].length;
            var r, g, b, a;
            
            if (len === c2) {
                if (this.comp === 1) {
                    r = parseInt("0x"+mc[i].substr(0,2), 16);
                    this.array.push( r );
                }
                else if (this.comp === 2) {
                    r = parseInt("0x"+mc[i].substr(0,2), 16);
                    g = parseInt("0x"+mc[i].substr(2,2), 16);
                    this.array.push( r, g );
                }
                else if (this.comp === 3) {
                    r = parseInt("0x"+mc[i].substr(0,2), 16);
                    g = parseInt("0x"+mc[i].substr(2,2), 16);
                    b = parseInt("0x"+mc[i].substr(4,2), 16);
                    this.array.push( r, g, b );
                }
                else if (this.comp === 4) {
                    r = parseInt("0x"+mc[i].substr(0,2), 16);
                    g = parseInt("0x"+mc[i].substr(2,2), 16);
                    b = parseInt("0x"+mc[i].substr(4,2), 16);
                    a = parseInt("0x"+mc[i].substr(6,2), 16);
                    this.array.push( r, g, b, a );
                }
            }
        }
    }
};

x3dom.fields.SFImage.prototype.toGL = function() {
    var a = [];

    Array.map( this.array, function(c) {
        a.push(c);       
    });

    return a;
};


/** MFColor constructor.
    @class Represents a MFColor
  */
x3dom.fields.MFColor = function(colorArray) {

    if (arguments.length === 0) {
    } else {
        var that = this;
        colorArray.map( function(c) { that.push(c); }, this );
    }
};

x3dom.fields.MFColor.prototype = x3dom.extend([]);

x3dom.fields.MFColor.parse = function(str) {
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    var colors = [];
    for (var i=0, n=mc?mc.length:0; i<n; i+=3) {
        colors.push( new x3dom.fields.SFColor(+mc[i+0], +mc[i+1], +mc[i+2]) );
    }
    
    return new x3dom.fields.MFColor( colors );
};

x3dom.fields.MFColor.prototype.setValueByStr = function(str) {
    while (this.length) {
        this.pop();
    }
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    for (var i=0, n=mc?mc.length:0; i<n; i+=3) {
        this.push( new x3dom.fields.SFColor(+mc[i+0], +mc[i+1], +mc[i+2]) );
    }
};

x3dom.fields.MFColor.prototype.toGL = function() {
    var a = [];

    Array.map( this, function(c) {
        a.push(c.r);
        a.push(c.g);
        a.push(c.b);        
    });

    return a;
};


/** SFColorRGBA constructor.
    @class Represents a SFColorRGBA
  */
x3dom.fields.SFColorRGBA = function(r, g, b, a) {
    if (arguments.length === 0) {
        this.r = this.g = this.b = this.a = 0;
    }
    else {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }    
};

x3dom.fields.SFColorRGBA.parse = function(str) {
    try {
        var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec(str);
        return new x3dom.fields.SFColorRGBA( +m[1], +m[2], +m[3], +m[4] );
    }
    catch (e) {
        return x3dom.fields.SFColorRGBA.colorParse(str);
    }
};

x3dom.fields.SFColorRGBA.prototype.setValues = function (color) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;   
    this.a = color.a;   
};

x3dom.fields.SFColorRGBA.prototype.equals = function (that, eps) {
    return Math.abs(this.r - that.r) < eps && 
           Math.abs(this.g - that.g) < eps &&
           Math.abs(this.b - that.b) < eps &&
           Math.abs(this.a - that.a) < eps;
};

x3dom.fields.SFColorRGBA.prototype.toGL = function () {
    return [ this.r, this.g, this.b, this.a ];
};

x3dom.fields.SFColorRGBA.prototype.toString = function() {
    return "{ r " + this.r + " g " + this.g + " b " + this.b + " a " + this.a + " }";
};

x3dom.fields.SFColorRGBA.prototype.setValueByStr = function(str) {
    try {
        var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec(str);
        this.r = +m[1];
        this.g = +m[2];
        this.b = +m[3];
        this.a = +m[4];
    }
    catch (e) {
        var c = x3dom.fields.SFColorRGBA.colorParse(str);
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
        this.a = c.a;
    }
    return this;
};


/** MFColorRGBA constructor.
    @class Represents a MFColorRGBA
  */
x3dom.fields.MFColorRGBA = function(colorArray) {
    if (arguments.length === 0) {
    }
    else {
        var that = this;
        colorArray.map( function(c) { that.push(c); }, this );
    }
};

x3dom.fields.MFColorRGBA.prototype = x3dom.extend([]);

x3dom.fields.MFColorRGBA.parse = function(str) {
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    var colors = [];
    for (var i=0, n=mc?mc.length:0; i<n; i+=4) {
        colors.push( new x3dom.fields.SFColorRGBA(+mc[i+0], +mc[i+1], +mc[i+2], +mc[i+3]) );
    }
    
    return new x3dom.fields.MFColorRGBA( colors );
};

x3dom.fields.MFColorRGBA.prototype.setValueByStr = function(str) {
    while (this.length) {
        this.pop();
    }
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    for (var i=0, n=mc?mc.length:0; i<n; i+=4) {
        this.push( new x3dom.fields.SFColor(+mc[i+0], +mc[i+1], +mc[i+2], +mc[i+3]) );
    }
};

x3dom.fields.MFColorRGBA.prototype.toGL = function() {
    var a = [];

    Array.map( this, function(c) {
        a.push(c.r);
        a.push(c.g);
        a.push(c.b);
        a.push(c.a);    
    });

    return a;
};


/** MFRotation constructor.
    @class Represents a MFRotation
  */
x3dom.fields.MFRotation = function(rotArray) {
    if (arguments.length === 0) {        
    }
    else {
        var that = this;
        rotArray.map( function(v) { that.push(v); }, this );
    }
};

x3dom.fields.MFRotation.prototype = x3dom.extend([]);

x3dom.fields.MFRotation.parse = function(str) {
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    var vecs = [];
    for (var i=0, n=mc?mc.length:0; i<n; i+=4) {
        vecs.push( x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(+mc[i+0], +mc[i+1], +mc[i+2]), +mc[i+3]) );
    }
    
    // holds the quaternion representation as needed by interpolators etc.
    return new x3dom.fields.MFRotation( vecs );    
};

x3dom.fields.MFRotation.prototype.setValueByStr = function(str) {
    while (this.length) {
        this.pop();
    }
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    for (var i=0, n=mc?mc.length:0; i<n; i+=4) {
        this.push( x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(+mc[i+0], +mc[i+1], +mc[i+2]), +mc[i+3]) );
    }
};

x3dom.fields.MFRotation.prototype.toGL = function() {
    var a = [];

    Array.map( this, function(c) {
        var val = c.toAxisAngle();
        a.push(val[0].x);
        a.push(val[0].y);
        a.push(val[0].z);
        a.push(val[1]);
    });

    return a;
};


/** MFVec3f constructor.
    @class Represents a MFVec3f
  */
x3dom.fields.MFVec3f = function(vec3Array) {
    if (arguments.length === 0) {        
    }
    else {
        var that = this;
        vec3Array.map( function(v) { that.push(v); }, this );
    }
};

x3dom.fields.MFVec3f.copy = function(vec3Array) {
    var destination = new x3dom.fields.MFVec3f();
    vec3Array.map( function(v) { destination.push(x3dom.fields.SFVec3f.copy(v)); }, this );
    return destination;
};

x3dom.fields.MFVec3f.prototype = x3dom.extend([]);

x3dom.fields.MFVec3f.parse = function(str) {
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    var vecs = [];
    for (var i=0, n=mc?mc.length:0; i<n; i+=3) {
        vecs.push( new x3dom.fields.SFVec3f(+mc[i+0], +mc[i+1], +mc[i+2]) );
    }
    
    return new x3dom.fields.MFVec3f( vecs );    
};

x3dom.fields.MFVec3f.prototype.setValueByStr = function(str) {
    while (this.length) {
        this.pop();
    }
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    for (var i=0, n=mc?mc.length:0; i<n; i+=3) {
        this.push( new x3dom.fields.SFVec3f(+mc[i+0], +mc[i+1], +mc[i+2]) );
    }
};

x3dom.fields.MFVec3f.prototype.toGL = function() {
    var a = [];

    Array.map( this, function(c) {
        a.push(c.x);
        a.push(c.y);
        a.push(c.z);        
    });

    return a;
};



/** MFVec2f constructor.
    @class Represents a MFVec2f
  */
x3dom.fields.MFVec2f = function(vec2Array) {
    if (arguments.length === 0) {        
    }
    else {
        var that = this;
        vec2Array.map( function(v) { that.push(v); }, this );
    }
};

x3dom.fields.MFVec2f.prototype = x3dom.extend([]);

x3dom.fields.MFVec2f.parse = function(str) {
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    var vecs = [];
    for (var i=0, n=mc?mc.length:0; i<n; i+=2) {
        vecs.push( new x3dom.fields.SFVec2f(+mc[i+0], +mc[i+1]) );
    }

    return new x3dom.fields.MFVec2f( vecs );    
};

x3dom.fields.MFVec2f.prototype.setValueByStr = function(str) {
    while (this.length) {
        this.pop();
    }
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    for (var i=0, n=mc?mc.length:0; i<n; i+=2) {
        this.push( new x3dom.fields.SFVec2f(+mc[i+0], +mc[i+1]) );
    }
};

x3dom.fields.MFVec2f.prototype.toGL = function() {
    var a = [];

    Array.map( this, function(v) {
        a.push(v.x);
        a.push(v.y);    
    });

    return a;
};


/** MFInt32 constructor.
    @class Represents a MFInt32
  */
x3dom.fields.MFInt32 = function(array) {
    if (arguments.length === 0) {
    }
    else {
        var that = this;
        array.map( function(v) { that.push(v); }, this );
    }
};

x3dom.fields.MFInt32.prototype = x3dom.extend([]);

x3dom.fields.MFInt32.parse = function(str) {
    var mc = str.match(/([+\-]?\d+\s*){1},?\s*/g);
    var vals = [];
    for (var i=0, n=mc?mc.length:0; i<n; ++i) {
        vals.push( parseInt(mc[i], 10) );
    }
    
    return new x3dom.fields.MFInt32( vals );
};

x3dom.fields.MFInt32.prototype.setValueByStr = function(str) {
    while (this.length) {
        this.pop();
    }
    var mc = str.match(/([+\-]?\d+\s*){1},?\s*/g);
    for (var i=0, n=mc?mc.length:0; i<n; ++i) {
        this.push( parseInt(mc[i], 10) );
    }
};

x3dom.fields.MFInt32.prototype.toGL = function() {
    var a = [];

    Array.map( this, function(v) {
        a.push(v);
    });

    return a;
};


/** MFFloat constructor.
    @class Represents a MFFloat
  */
x3dom.fields.MFFloat = function(array) {
    if (arguments.length === 0) {
    }
    else {
        var that = this;
        array.map( function(v) { that.push(v); }, this );
    }
};

x3dom.fields.MFFloat.prototype = x3dom.extend([]);

x3dom.fields.MFFloat.parse = function(str) {
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    var vals = [];
    for (var i=0, n=mc?mc.length:0; i<n; i++) {
        vals.push( +mc[i] );
    }
    
    return new x3dom.fields.MFFloat( vals );    
};

x3dom.fields.MFFloat.prototype.setValueByStr = function(str) {
    while (this.length) {
        this.pop();
    }
    var mc = str.match(/([+\-0-9eE\.]+)/g);
    for (var i=0, n=mc?mc.length:0; i<n; i++) {
        this.push( +mc[i] );
    }
};

x3dom.fields.MFFloat.prototype.toGL = function() {
    var a = [];

    Array.map( this, function(v) {
        a.push(v);
    });

    return a;
};


/** MFString constructor.
    @class Represents a MFString
  */
x3dom.fields.MFString = function(strArray) {
    if (arguments.length === 0) {
    }
    else {
        var that = this;
        strArray.map( function(v) { that.push(v); }, this );
    }
};

x3dom.fields.MFString.parse = function(str) {
    var arr = [];
    // TODO: ignore leading whitespace?
    if (str.length && str[0] == '"') {
        var m, re = /"((?:[^\\"]|\\\\|\\")*)"/g;
        while ((m = re.exec(str))) {
            var s = m[1].replace(/\\([\\"])/, "$1");
            if (s !== undefined) {
                arr.push(s);
            }
        }
    }
    else {
        arr.push(str);
    }
    return new x3dom.fields.MFString( arr );
};

x3dom.fields.MFString.prototype = x3dom.extend([]);

x3dom.fields.MFString.prototype.setValueByStr = function(str) {
    var arr = this;
    while (arr.length) {
        arr.pop();
    }
    // TODO: ignore leading whitespace?
    if (str.length && str[0] == '"') {
        var m, re = /"((?:[^\\"]|\\\\|\\")*)"/g;
        while ((m = re.exec(str))) {
            var s = m[1].replace(/\\([\\"])/, "$1");
            if (s !== undefined) {
                arr.push(s);
            }
        }
    }
    else {
        arr.push(str);
    }
    return this;
};

x3dom.fields.MFString.prototype.toString = function () {
    var str = "";
    for (var i=0; i<this.length; i++) {
		 str = str + this[i] + " ";
    }
    return str;
};


/** SFNode constructor.
    @class Represents a SFNode
  */
x3dom.fields.SFNode = function(type) {
    this.type = type;
    this.node = null;
};

x3dom.fields.SFNode.prototype.hasLink = function(node) {
    return (node ? (this.node === node) : this.node);
};

x3dom.fields.SFNode.prototype.addLink = function(node) {
    this.node = node;
    return true;
};

x3dom.fields.SFNode.prototype.rmLink = function(node) {
    if (this.node === node) {
        this.node = null;
        return true;
    }
    else {
        return false;
    }
};

/** MFNode constructor.
    @class Represents a MFNode
  */
x3dom.fields.MFNode = function(type) {
    this.type = type;
    this.nodes = [];
};

x3dom.fields.MFNode.prototype.hasLink = function(node) {
    if (node) {
        for (var i = 0, n = this.nodes.length; i < n; i++) {
            if (this.nodes[i] === node) {
                return true;
            }
        }
    }
    else {
        return (this.length > 0);
    }
    return false;
};

x3dom.fields.MFNode.prototype.addLink = function(node) {
    this.nodes.push (node);
    return true;
};

x3dom.fields.MFNode.prototype.rmLink = function(node) {
    for (var i = 0, n = this.nodes.length; i < n; i++) {
        if (this.nodes[i] === node) {
            this.nodes.splice(i,1);
            return true;
        }
    }
    return false;
};

x3dom.fields.MFNode.prototype.length = function() {
    return this.nodes.length;
};


/** Line constructor.
    @class Represents a Line (as internal helper).
  */
x3dom.fields.Line = function(pos, dir) 
{
    if (arguments.length === 0) 
    {
        this.pos = new x3dom.fields.SFVec3f(0, 0, 0);
        this.dir = new x3dom.fields.SFVec3f(0, 0, 1);
    } 
    else 
    {
        this.pos = new x3dom.fields.SFVec3f(pos.x, pos.y, pos.z);
        
        var n = dir.length();
        if (n) { n = 1.0 / n; }
        
        this.dir = new x3dom.fields.SFVec3f(dir.x*n, dir.y*n, dir.z*n);
    }
    
    this.enter = 0;
    this.exit  = 0;
    this.hitObject = null;
    this.hitPoint  = {};
    this.dist = Number.MAX_VALUE;
};

x3dom.fields.Line.prototype.toString = function () {
    var str = 'Line: [' + this.pos.toString() + '; ' + this.dir.toString() + ']';
    return str;
};

/** intersect line with box volume given by low and high */
x3dom.fields.Line.prototype.intersect = function(low, high)
{
    var isect = 0.0;
    var out = Number.MAX_VALUE;
    var r, te, tl;
    
    if (this.dir.x > x3dom.fields.Eps)
    {
        r = 1.0 / this.dir.x;
    
        te = (low.x - this.pos.x) * r;
        tl = (high.x - this.pos.x) * r;
    
        if (tl < out){ 
            out = tl;
        }
    
        if (te > isect){ 
            isect  = te;
        }
    }
    else if (this.dir.x < -x3dom.fields.Eps)
    {
        r = 1.0 / this.dir.x;
    
        te = (high.x - this.pos.x) * r;
        tl = (low.x - this.pos.x) * r;
    
        if (tl < out){
            out = tl;
        }
    
        if (te > isect)   {
            isect = te;
        }
    }
    else if (this.pos.x < low.x || this.pos.x > high.x)
    {
        return false;
    }
    
    if (this.dir.y > x3dom.fields.Eps)
    {
        r = 1.0 / this.dir.y;
    
        te = (low.y - this.pos.y) * r;
        tl = (high.y - this.pos.y) * r;
    
        if (tl < out){ 
            out = tl;
        }
    
        if (te > isect) {
            isect = te;
        }
    
        if (isect-out >= x3dom.fields.Eps) {
            return false;
        }
    }
    else if (this.dir.y < -x3dom.fields.Eps)
    {
        r = 1.0 / this.dir.y;
    
        te = (high.y - this.pos.y) * r;
        tl = (low.y - this.pos.y) * r;
    
        if (tl < out){ 
            out = tl;
        }
    
        if (te > isect) {
            isect = te;
        }
    
        if (isect-out >= x3dom.fields.Eps) {
            return false;
        }
    }
    else if (this.pos.y < low.y || this.pos.y > high.y)
    {
        return false;
    }
    
    if (this.dir.z > x3dom.fields.Eps)
    {
        r = 1.0 / this.dir.z;
    
        te = (low.z - this.pos.z) * r;
        tl = (high.z - this.pos.z) * r;
    
        if (tl < out) {
            out = tl;
        }
    
        if (te > isect) {
            isect = te;
        }
    }
    else if (this.dir.z < -x3dom.fields.Eps)
    {
        r = 1.0 / this.dir.z;
    
        te = (high.z - this.pos.z) * r;
        tl = (low.z - this.pos.z) * r;
    
        if (tl < out) {
            out = tl;
        }
    
        if (te > isect) {
            isect = te;
        }
    }
    else if (this.pos.z < low.z || this.pos.z > high.z)
    {
        return false;
    }
    
    this.enter = isect;
    this.exit  = out;

    return (isect-out < x3dom.fields.Eps);
};
