import { EditorView, minimalSetup } from "codemirror"
import { lineNumbers } from "@codemirror/view"
import { bracketMatching, indentOnInput } from "@codemirror/language"
import { closeBrackets } from "@codemirror/autocomplete"
import { javascript } from "@codemirror/lang-javascript"
import { oneDark } from '@codemirror/theme-one-dark';

const editor_element = document.getElementById("editor");
const editor = new EditorView({
  extensions: [
    minimalSetup,
    bracketMatching(), 
    closeBrackets(), 
    indentOnInput(),
    lineNumbers(),
    javascript(),
    oneDark
  ],
  parent: editor_element,
  dark: true
});

const load_code_options = document.getElementById("load-code-options");
const load_code_dialog = document.getElementById("load-code-dialog");

async function loadCodeTemplate(name) {
  try {
    let response = await fetch("./templates/" + name + ".js");
    if (response.status === 200) {

      let template_code = await response.text();

      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: template_code
        }
      });
      
    } else {
      alert("Could not load code.");
    }
  } catch (error) {
    alert("Something went wrong!");
  }
}

const viewer_container = document.getElementById("viewer-container");
const hide_viewer_button = document.getElementById("toggle-hide-viewer");
const hide_viewer_wording = document.getElementById("toggle-hide-viewer-wording");

hide_viewer_button.addEventListener("click", function() {
  if (viewer_container.classList.contains("hidden")) {
    viewer_container.classList.remove("hidden");
    hide_viewer_wording.innerText = "Hide";
  } else {
    viewer_container.classList.add("hidden");
    hide_viewer_wording.innerText = "Show";
  }
});

const viewer_iframe = document.getElementById("viewer");

let reload_listener_set = false;

let last_editor_content_snapshot = null;

function addLoadCodeTimestampOption(timestamp) {

  let load_code_button = document.createElement("button");
  load_code_button.classList.add("load-code-option");
  load_code_button.setAttribute("data-timestamp", timestamp);
  load_code_button.innerText = timestamp;
  load_code_options.prepend(load_code_button);

  load_code_button.addEventListener("click", function() {

    for (let backup of editor_content_backups) {
      if (backup.timestamp == load_code_button.dataset.timestamp) {
        editor.dispatch({
          changes: {
            from: 0,
            to: editor.state.doc.length,
            insert: backup.content
          }
        });
        load_code_dialog.close();
        break;
      }
    }

  });
}

function saveEditorContent() {
  let current_editor_content = editor.state.doc.toString();
  let now = new Date();
  let now_timestamp = now.getTime();
  if (now_timestamp - last_editor_content_snapshot >= 60000) {
    if (editor_content_backups.length >= 6) {
      editor_content_backups.pop();
      document.querySelector(".load-code-option:nth-child(6)").remove();
    }
  
    let formatted_minutes = now.getMinutes().toString();
    if (formatted_minutes.length < 2) {
      formatted_minutes = "0".concat(formatted_minutes);
    }

    let formatted_timestamp = now.getHours() + ':' + formatted_minutes;
    editor_content_backups.unshift({
      content: current_editor_content,
      timestamp: formatted_timestamp
    });

    addLoadCodeTimestampOption(formatted_timestamp);

    last_editor_content_snapshot = now;

    localStorage.setItem("editor_content_backups", JSON.stringify(editor_content_backups));
  }
  localStorage.setItem("editor_content", current_editor_content);
}

function runUserCode() {

  if (!reload_listener_set) {

    window.addEventListener("message", (event) => {

      if (event.origin !== location.origin) {
        return;
      }

      const message = JSON.parse(event.data);

      if (message.type === "load" && message.loaded) {

        const entered_code = editor.state.doc.toString();
        const script = viewer_iframe.contentWindow.document.createElement("script");
        const script_content = viewer_iframe.contentWindow.document.createTextNode(
          "import { GameBuilder } from './gamebuilder.min.js';\n" +
          entered_code
        );

        script.type = "module";
        
        script.appendChild(script_content);
        viewer_iframe.contentWindow.document.body.appendChild(script);
        viewer_iframe.contentWindow.focus();

      }

    });

  }

  reload_listener_set = true;

  viewer_iframe.contentWindow.location.reload();

}

let editor_keyup_timeout = null;

editor.contentDOM.addEventListener("blur", saveEditorContent);
editor.contentDOM.addEventListener("keyup", function() {
  clearTimeout(editor_keyup_timeout);
  editor_keyup_timeout = setTimeout(saveEditorContent, 500);
});

let stored_editor_content_backups = localStorage.getItem("editor_content_backups");
let latest_editor_content = localStorage.getItem("editor_content");
let editor_content_backups = [];

if (stored_editor_content_backups !== null && stored_editor_content_backups !== "") {

  try {
    editor_content_backups = JSON.parse(stored_editor_content_backups);
    for (let i = editor_content_backups.length - 1; i >= 0; i--) {
      let backup = editor_content_backups[i];
      addLoadCodeTimestampOption(backup.timestamp);
    }
  } catch (e) {
    editor_content_backups = [];
  }

}
if (latest_editor_content !== null && latest_editor_content !== "") {

  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: latest_editor_content
    }
  });

  runUserCode();

  setTimeout(() => {
    editor.scrollDOM.scrollTop = 0;
  }, 100);

} else {
  const query_string = window.location.search;
  const url_params = new URLSearchParams(query_string);
  const code_to_load = url_params.get("code");
  if (code_to_load !== null) {
    switch (code_to_load) {
      case "default": {
        loadCodeTemplate("latest");
        break;
      }
      case "basic": {
        loadCodeTemplate("basic");
        break;
      }
      default: {
        alert("Template not found.");
      }
    }
  } else {
    loadCodeTemplate("basic");
  }
}

document.getElementById("run").addEventListener("click", runUserCode);