var _includePath = './';
var key = 'Shift-Return';
var me = 'web-online';
var gMemFs = [];
var gProcessor = null;
var editor = null;
var customShapes = null;

var browser = 'unknown';
if (navigator.userAgent.match(/(opera|chrome|safari|firefox|msie)/i)) {
  browser = RegExp.$1.toLowerCase();
}

var requireModel = function(fileUrl) {
  var requiredModel = $.ajax({
    url: fileUrl,
    cache: false,
    async: false
  }).responseText;

  return 'function(){\n' + requiredModel + '\nreturn main();\n}()';
};

var findRequires = function(source) {
  source = source.toString().split('\n');
  var requires = source.filter(function(line) {
    // The last part checks if the line is not commented
    // Kind of....
    // How about multiline comments? (/*  */)
    return line.match(/require/) && !line.match(/\/\//);
  });
  return requires;
};

var insertRequiredModel = function(model, source) {
  var loadedModel = requireModel(model.match(/require\(['"+](.*)['"+]\)/)[1]);
  source = source.toString().split('\n');

  var lineIndex = source.indexOf(model);
  source[lineIndex] = source[lineIndex].match(/(.*)=/)[0] + loadedModel;

  return source.join('\n');
};

window.onload = function() {
  $('#viewer').height($(window).height());

  $(window).resize(function() { // adjust the relevant divs
    $('#viewer').width($(window).width());
    $('#viewer').height($(window).height());
  });

  var exec = function(editor) {
    var time = new Date();
    var src = editor.getValue();
    var requires = findRequires(src);

    if (requires) {
      for (var i = 0, l = requires.length; i<l; i++) {
        src = insertRequiredModel(requires[i], src);
      }
    }

    if (src.match(/^\/\/\!OpenSCAD/i)) {
      editor.getSession().setMode('ace/mode/scad');
      src = openscadOpenJscadParser.parse(src);
    } else {
      editor.getSession().setMode('ace/mode/javascript');
    }

    // When the model is rendered, displey the time needed to render it
    gProcessor.onchange = function() {
      var newTime = ((new Date()) - time) / 1000;
      $('#statusspan').html('Ready in ' + newTime + 's');
    };

    if (customShapes) {
      src = customShapes + src;
    }
    gProcessor.setJsCad(src);
  };

  editor = ace.edit('editor');
  editor.setTheme('ace/theme/chrome');
  editor.getSession().setMode('ace/mode/javascript');
  editor.commands.addCommand({
    name: 'myCommand',
    bindKey: {
      win: key,
      mac: key
    },
    exec: exec
  });

  gProcessor = new OpenJsCad.Processor($('#viewer')[0]);

  if (document.location.search) {
    var urls = document.location.search.split('&');
    var modelUrl = urls.filter(function(url){
      return url.indexOf('model') > -1;
    })[0].split('=').pop();

    var csUrl = urls.filter(function(url){
      return url.indexOf('custom-shape') > -1;
    })[0].split('=').pop();

    console.log(modelUrl, 'm');
    console.log(csUrl, 'c');
    if (csUrl) {
      $.ajax({
        url: csUrl
      }).done(function(data) {
        customShapes = data;
        $.ajax({
          url: modelUrl
        }).done(function(data) {
          editor.setValue(data, 1);
          exec(editor);
          editor.blur();
        });
      });
    } else {
      $.ajax({
        url: modelUrl
      }).done(function(data) {
        editor.setValue(data, 1);
        exec(editor);
        editor.blur();
      });
    }

    var cameraSettings = window.sessionStorage.getItem('camera');
    if (cameraSettings) {
      cameraSettings = JSON.parse(cameraSettings);
      for (var attr in cameraSettings) {
        gProcessor.viewer[attr] = cameraSettings[attr];
      }
      gProcessor.viewer.onDraw();
    }
  } else {
    // rund efault project
    exec(editor);
  }
};

document.body.addEventListener('mouseup', function(e) {
  window.sessionStorage.setItem('camera', JSON.stringify({
    angleX: gProcessor.viewer.angleX,
    angleY: gProcessor.viewer.angleY,
    angleZ: gProcessor.viewer.angleZ,
    viewpointX: gProcessor.viewer.viewpointX,
    viewpointY: gProcessor.viewer.viewpointY,
    viewpointZ: gProcessor.viewer.viewpointZ
  }));
});
