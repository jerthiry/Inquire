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
