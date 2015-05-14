// function appendDiv() {
// 	//var Hogan = require("hogan.js");

// 	$.get("/../newquestion.html", function(templates) {
// 		var template = Hogan.compile(templates);
// 		var rendered = template.render();
// 		$("#form").append(rendered);
// 	});

// }

function appendDiv(type) {
  if (type=='done')
  {
    $.get("/../donequestion.html", function(data) {
      $("#questionbody").html(data);
    });
  }
  if (type=='radio')
  {
    $.get("/../radioquestion.html", function(data) {
      $("#questionbody").html(data);
    });
  }
  else if (type=='checkbox') {
    $.get("/../checkquestion.html", function(data) {
      $("#questionbody").html(data);
    });
  }
  else if (type=='textarea') {
    $.get("/../textquestion.html", function(data) {
      $("#questionbody").html(data);
    });
  }

}






















// function appendDiv() {
// 	// $.get("/../newquestion.html", function(data) {
// 	// 	$("#form").append(data);
// 	// });
// }




  // var partialText = "this is text from the partial--the magic number {{foo}} is from a variable";
  // var p = Hogan.compile(partialText);

  // var text = "This template contains a partial ({{>testPartial}})."
  // var t = Hogan.compile(text);

  // var s = t.render({foo: 42}, {testPartial: p});
  // is(s, "This template contains a partial (this is text from the partial--the magic number 42 is from a variable).", "partials work");