/* =====================================================
   STar IDE Ultimate
   app.js
   ===================================================== */

let editor = null;

const files = [];
let activeFile = null;

/* =====================================================
   DOM
   ===================================================== */

const fileTree = document.getElementById("fileTree");
const tabs = document.getElementById("tabs");
const consoleEl = document.getElementById("console");

const fileInput = document.getElementById("fileInput");

const runBtn = document.getElementById("runBtn");
const saveBtn = document.getElementById("saveFileBtn");
const openBtn = document.getElementById("openFileBtn");
const newBtn = document.getElementById("newFileBtn");
const clearBtn = document.getElementById("clearConsoleBtn");
const themeBtn = document.getElementById("themeBtn");

/* =====================================================
   LOG
   ===================================================== */

function log(text) {
    consoleEl.textContent += text + "\n";
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function clearConsole() {
    consoleEl.textContent = "";
}

/* =====================================================
   LOADING
   ===================================================== */

window.addEventListener("load", () => {

    initMonaco();

    setTimeout(() => {

        const loading =
            document.getElementById("loadingScreen");

        if (loading)
            loading.remove();

    }, 500);

});

/* =====================================================
   MONACO
   ===================================================== */

function initMonaco() {

    require.config({
        paths: {
            vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
        }
    });

    require(["vs/editor/editor.main"], () => {

        editor = monaco.editor.create(
            document.getElementById("editor"),
            {
                value:
`print "Hello STar"

let name = "World"

print name`,
                language: "javascript",
                theme: "vs-dark",
                automaticLayout: true,
                fontSize: 15,
                minimap: {
                    enabled: true
                }
            }
        );

        createNewFile();

    });

}

/* =====================================================
   FILE
   ===================================================== */

function createNewFile() {

    const file = {
        id: crypto.randomUUID(),
        name: "main.star",
        content: ""
    };

    files.push(file);

    activeFile = file;

    renderTabs();
    renderTree();

}

function renderTabs() {

    tabs.innerHTML = "";

    files.forEach(file => {

        const tab =
            document.createElement("div");

        tab.className =
            "tab" +
            (activeFile?.id === file.id
                ? " active"
                : "");

        tab.textContent = file.name;

        tab.onclick = () => {

            saveCurrentFile();

            activeFile = file;

            editor.setValue(
                file.content
            );

            renderTabs();

        };

        tabs.appendChild(tab);

    });

}

function renderTree() {

    fileTree.innerHTML = "";

    files.forEach(file => {

        const item =
            document.createElement("div");

        item.className = "file";

        item.textContent = file.name;

        item.onclick = () => {

            saveCurrentFile();

            activeFile = file;

            editor.setValue(
                file.content
            );

            renderTabs();

        };

        fileTree.appendChild(item);

    });

}

function saveCurrentFile() {

    if (!activeFile || !editor)
        return;

    activeFile.content =
        editor.getValue();

}

/* =====================================================
   SAVE
   ===================================================== */

function saveFile() {

    saveCurrentFile();

    const blob =
        new Blob(
            [activeFile.content],
            {
                type:
                    "text/plain"
            }
        );

    const a =
        document.createElement("a");

    a.href =
        URL.createObjectURL(blob);

    a.download =
        activeFile.name;

    a.click();
}

/* =====================================================
   OPEN
   ===================================================== */

function openFile(file) {

    const reader =
        new FileReader();

    reader.onload = e => {

        const newFile = {

            id: crypto.randomUUID(),

            name: file.name,

            content:
                e.target.result
        };

        files.push(newFile);

        activeFile = newFile;

        editor.setValue(
            newFile.content
        );

        renderTabs();
        renderTree();
    };

    reader.readAsText(file);

}

/* =====================================================
   STar Runtime
   ===================================================== */

function runSTar(code) {

    clearConsole();

    const lines =
        code.split("\n");

    const vars = {};

    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        let line =
            lines[i].trim();

        if (!line)
            continue;

        if (
            line.startsWith("#")
        )
            continue;

        if (
            line.startsWith("let ")
        ) {

            const parts =
                line
                    .substring(4)
                    .split("=");

            const key =
                parts[0].trim();

            let value =
                parts[1]?.trim();

            if (
                value?.startsWith('"')
            ) {

                value =
                    value.slice(
                        1,
                        -1
                    );

            }

            vars[key] = value;

        }

        else if (
            line.startsWith(
                "print "
            )
        ) {

            let value =
                line
                    .substring(6)
                    .trim();

            if (
                value.startsWith('"')
            ) {

                log(
                    value.slice(
                        1,
                        -1
                    )
                );

            }

            else {

                log(
                    vars[value]
                        ?? value
                );

            }

        }

    }

}

/* =====================================================
   COMPILE
   ===================================================== */

function compileToJS(code) {

    let js = code;

    js = js.replaceAll(
        /print\s+"([^"]+)"/g,
        'console.log("$1")'
    );

    js = js.replaceAll(
        /let\s+/g,
        "let "
    );

    return js;

}

/* =====================================================
   EVENTS
   ===================================================== */

runBtn.onclick = () => {

    saveCurrentFile();

    runSTar(
        editor.getValue()
    );

};

saveBtn.onclick = saveFile;

openBtn.onclick = () => {
    fileInput.click();
};

newBtn.onclick = () => {

    saveCurrentFile();

    const name =
        prompt(
            "ファイル名"
        ) || "new.star";

    const file = {

        id:
            crypto.randomUUID(),

        name,

        content: ""
    };

    files.push(file);

    activeFile = file;

    editor.setValue("");

    renderTabs();
    renderTree();

};

clearBtn.onclick =
    clearConsole;

fileInput.addEventListener(
    "change",
    e => {

        const file =
            e.target.files[0];

        if (file)
            openFile(file);

    }
);

themeBtn.onclick = () => {

    document.body
        .classList
        .toggle("light");

    monaco.editor
        .setTheme(
            document.body
                .classList
                .contains("light")
                ? "vs"
                : "vs-dark"
        );

};

/* =====================================================
   CTRL+S
   ===================================================== */

window.addEventListener(
    "keydown",
    e => {

        if (
            e.ctrlKey &&
            e.key === "s"
        ) {

            e.preventDefault();

            saveFile();

        }

    }
);
/* =====================================================
   HELP
   ===================================================== */

const helpBtn =
    document.getElementById(
        "helpBtn"
    );

const helpPanel =
    document.getElementById(
        "helpPanel"
    );

const closeHelp =
    document.getElementById(
        "closeHelp"
    );

helpBtn.onclick = () => {

    helpPanel.classList.add(
        "open"
    );

};

closeHelp.onclick = () => {

    helpPanel.classList.remove(
        "open"
    );

};
