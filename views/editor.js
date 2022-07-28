function createEditor(index, value) {
  let editorName = "editor" + index;
  var editor = CodeMirror.fromTextArea(document.getElementById(editorName), {
    model: "python",
    theme: "dracula",
    lineNumbers: true,
    lineWrapping: true,
    autoCloseTags: true,
    spellcheck: true,
    highlightNonMatching: true,
    autoCloseBrackets: true,
    pasteLinesPerSelection: true,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  });
  editor.setOption("extraKeys", {
    Tab: function (cm) {
      var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
      cm.replaceSelection(spaces);
    },
  });
  editor.setValue(value);
  return editor;
}
