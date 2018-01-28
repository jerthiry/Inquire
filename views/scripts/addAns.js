function appendDiv(type, content) {
  if (type=='radio')
  {
    $.get("/../radioanswer.html", function(data) {
      $("#questionbody").html(data);
    });
  }
  else if (type=='check') {
    $.get("/../checkanswer.html", function(data) {
      $("#questionbody").html(data);
    });
  }
  else if (type=='text') {
    $.get("/../textanswer.html", function(data) {
      $("#questionbody").html(data);
    });
  }

}