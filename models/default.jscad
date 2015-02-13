
// title: OpenJSCAD.org Logo
// author: Rene K. Mueller 
// license: Creative Commons CC BY
// URL: http://openjscad.org/#examples/logo.jscad
// revision: 0.003
// tags: Logo,Intersection,Sphere,Cube

function main() {
  var l = vector_text(0,0,"SEOJC.oPP");   // l contains a list of polylines to be drawn
  var o = [];
  l.forEach(function(pl) {                   // pl = polyline (not closed)
     o.push(rectangular_extrude(pl, {w: 6, h: 5}));   // extrude it to 3D
  });
  return union(o).rotateX(60).scale(0.5).rotateZ(45).translate([-10, -40, 0]);
}
