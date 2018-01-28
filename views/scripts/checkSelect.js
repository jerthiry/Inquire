function checkboxSelect() {
    var opt = document.getElementsByName('checkoption');
    var selected = [];
    for (var i = 0, l = opt.length; i < l; i++) {
        if (opt[i].checked) {
            selected.push(opt[i].value);
        }
    }
    return selected;
}