/* =====================================================
STar IDE Ultimate
app.js
===================================================== */

let editor = null;



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
function waitEditorReady() {
    const timer = setInterval(() => {
        if (editor) {
            clearInterval(timer);

            editor.onDidChangeModelContent(() => {
                clearTimeout(saveTimer);

                saveTimer = setTimeout(() => {
                    saveCurrentFile();
                    saveFiles();
                }, 500);
            });
        }
    }, 50);
}
/* =====================================================
LOADING
===================================================== */

window.addEventListener("load", () => {

initMonaco();
waitEditorReady();
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
function initHelp() {
    const helpBtn = document.getElementById("helpBtn");
    const helpPanel = document.getElementById("helpPanel");
    const closeHelp = document.getElementById("closeHelp");

    if (!helpBtn || !helpPanel || !closeHelp) {
        console.warn("help UI not found");
        return;
    }

    helpBtn.addEventListener("click", () => {
        helpPanel.classList.add("open");
    });

    closeHelp.addEventListener("click", () => {
        helpPanel.classList.remove("open");
    });
}

window.addEventListener("load", initHelp);

window.addEventListener("load", initHelp);
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
            minimap: { enabled: true }
        }
    );

    attachEditorEvents(); // ← これだけ
});

}
function initFiles() {
const saved = JSON.parse(localStorage.getItem("star_files") || "[]");

files = saved;

if (files.length === 0) {
    files = [{
        id: crypto.randomUUID(),
        name: "main.star",
        content: ""
    }];
}

activeFile = files[0];

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
    const tab = document.createElement("div");

    tab.className =
        "tab" + (activeFile?.id === file.id ? " active" : "");

    // ファイル名
    const name = document.createElement("span");
    name.textContent = file.name;
    name.onclick = () => openFile(file.id);

    // ×ボタン
    const close = document.createElement("span");
    close.textContent = " ×";
    close.style.marginLeft = "8px";
    close.style.cursor = "pointer";
    close.style.color = "#aaa";

    close.onclick = (e) => {
        e.stopPropagation();
        closeFile(file.id);
    };

    tab.appendChild(name);
    tab.appendChild(close);

    tabs.appendChild(tab);
});

}
function closeFile(id) {
if (files.length <= 1) {
alert("最後のファイルは閉じられません");
return;
}

const index = files.findIndex(f => f.id === id);
if (index === -1) return;

const isActive = activeFile?.id === id;

// ファイル削除（閉じる＝非表示扱い）
files.splice(index, 1);

// アクティブ調整
if (isActive) {
    const newIndex = Math.max(0, index - 1);
    activeFile = files[newIndex] || files[0];
    editor.setValue(activeFile?.content || "");
}

saveFiles();
renderTabs();
renderTree();

}




/* =====================================================
FILE SYSTEM (STar IDE)
===================================================== */
let files = JSON.parse(localStorage.getItem("star_files") || "[]");
let activeFile = null;

/* 保存 */
function saveFiles() {
localStorage.setItem("star_files", JSON.stringify(files));
}

/* 新規作成 */
function createFile(name = "untitled.star") {
const file = {
id: crypto.randomUUID(),
name,
content: ""
};

files.push(file);
activeFile = file;

editor.setValue("");

saveFiles();
renderTabs();
renderTree();

}

/* 開く */
function openFile(id) {
const file = files.find(f => f.id === id);
if (!file) return;

saveCurrentFile();

activeFile = file;
editor.setValue(file.content);

renderTabs();
renderTree();

}

function saveCurrentFile() {
if (!activeFile || !editor) return;

// エディタ内容を現在のファイルへ保存
activeFile.content = editor.getValue();

// files全体を更新（重要）
const index = files.findIndex(f => f.id === activeFile.id);
if (index !== -1) {
    files[index] = activeFile;
}

// localStorageへ保存
localStorage.setItem("star_files", JSON.stringify(files));

}
/* 名前変更 */
function renameFile(id, newName) {
const file = files.find(f => f.id === id);
if (!file) return;

file.name = newName;

saveFiles();
renderTabs();
renderTree();

}

/* 削除 */
function deleteFile(id) {
files = files.filter(f => f.id !== id);

if (activeFile?.id === id) {
    activeFile = files[0] || null;
    editor.setValue(activeFile?.content || "");
}

saveFiles();
renderTabs();
renderTree();

}




/* Tree */
function renderTree() {
fileTree.innerHTML = "";

files.forEach(file => {
    const item = document.createElement("div");

    item.className = "file";
    item.textContent = file.name;

    item.onclick = () => openFile(file.id);

    item.oncontextmenu = (e) => {
        e.preventDefault();

        const action = prompt("rename / delete");

        if (action === "rename") {
            const name = prompt("new name");
            if (name) renameFile(file.id, name);
        }

        if (action === "delete") {
            deleteFile(file.id);
        }
    };

    fileTree.appendChild(item);
});

}

let saveTimer;

function attachEditorEvents() {
    if (!editor) return;

    editor.onDidChangeModelContent(() => {
        clearTimeout(saveTimer);

        saveTimer = setTimeout(() => {
            saveCurrentFile();
            saveFiles();
        }, 500);
    });
}
    

/* 初期化 */
window.addEventListener("load", () => {
renderTabs();
initFiles();
renderTree();
});
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
STar Runtime
===================================================== */

function runSTar(code) {

    clearConsole();

    const lines = code.split("\n");
    const vars = {};

    for (let i = 0; i < lines.length; i++) {

        let line = lines[i].trim();
        if (!line) continue;
        if (line.startsWith("#")) continue;

        /* =========================
           ① 変数宣言
        ========================= */
        if (line.startsWith("let ")) {

            const parts = line.substring(4).split("=");

            const key = parts[0].trim();
            let value = parts[1]?.trim();

            if (value?.startsWith('"')) {
                value = value.slice(1, -1);
            }

            vars[key] = value;
        }

        /* =========================
           ② 再代入（🔥追加）
        ========================= */
        else if (line.includes("=")) {

    const parts = line.split("=");

    const key = parts[0].trim();
    let value = parts[1]?.trim();

    if (value?.startsWith('"')) {
        value = value.slice(1, -1);
    } else {
        value = evalExpr(value, vars);
    }

    vars[key] = value;
}

        /* =========================
           ③ print
        ========================= */
        else if (line.startsWith("print ")) {

            let value = line.substring(6).trim();

            if (value.startsWith('"')) {
                log(value.slice(1, -1));
            } else {
                log(vars[value] ?? value);
            }
        }
    }
}
function evalExpr(expr, vars) {

    // 変数を式に置換
    for (const key in vars) {
        const regex = new RegExp(`\\b${key}\\b`, "g");
        expr = expr.replace(regex, vars[key]);
    }

    try {
        return Function("return " + expr)();
    } catch (e) {
        return expr;
    }
}
/* =====================================================
COMPILE
===================================================== */

function compileToJS(code) {

let js = "";

const lines = code.split("\n");

for (let line of lines) {

    line = line.trim();
    if (!line) continue;

    if (line.startsWith("print ")) {

        const value = line.slice(6).trim();

        if (value.startsWith('"')) {
            js += `console.log(${value});\n`;
        } else {
            js += `console.log(${value});\n`;
        }
    }

    if (line.startsWith("let ")) {

    const parts = line.substring(4).split("=");

    const key = parts[0].trim();
    let value = parts[1]?.trim();

    if (value?.startsWith('"')) {
        value = value.slice(1, -1);
    } else {
        value = evalExpr(value, vars);
    }

    vars[key] = value;
}
}

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

fileInput.addEventListener("change", e => {
const file = e.target.files[0];
if (!file) return;

const reader = new FileReader();

reader.onload = () => {
    const newFile = {
        id: crypto.randomUUID(),
        name: file.name,
        content: reader.result
    };

    files.push(newFile);
    activeFile = newFile;

    editor.setValue(newFile.content);

    saveFiles();
    renderTabs();
    renderTree();
};

reader.readAsText(file);

});

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
window.addEventListener("load", () => {
    const helpBtn = document.getElementById("helpBtn");
    const helpPanel = document.getElementById("helpPanel");
    const closeHelp = document.getElementById("closeHelp");

    if (!helpBtn || !helpPanel || !closeHelp) return;

    helpBtn.onclick = () => {
        helpPanel.classList.add("open");
    };

    closeHelp.onclick = () => {
        helpPanel.classList.remove("open");
    };
});
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

/*const helpBtn =
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
*/
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.getElementById("helpPanel")?.classList.remove("open");
    }
});
