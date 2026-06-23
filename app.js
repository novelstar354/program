/* =====================================================
STar IDE Ultimate
app.js
===================================================== */

let editor = null;

const functions = {};
const consts = {};
const keys = {};
let mouseX = 0;
let mouseY = 0;
let saveTimer = null;
const classes = {};
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

const sidebar =
    document.getElementById("fileSidebar");

const resizer =
    document.getElementById("sidebarResizer");

let resizing = false;

resizer.addEventListener(
    "mousedown",
    () => {
        resizing = true;
    }
);

document.addEventListener(
    "mousemove",
    (e) => {

        if (!resizing) return;

        let width = e.clientX;

        width = Math.max(
            180,
            Math.min(
                600,
                width
            )
        );

        sidebar.style.width =
            width + "px";
    }
);

document.addEventListener(
    "mouseup",
    () => {
        resizing = false;
    }
);
/* =====================================================
SEARCH
===================================================== */




function escapeHtml(text) {

    text = String(text);

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
/* =====================================================
LOG
===================================================== */

function log(text) {
    consoleEl.innerHTML += `<div>${escapeHtml(text)}</div>`;
}

function logError(err) {
    const div = document.createElement("div");
    div.className = "error";

    div.innerHTML = `
    <div class="err-title">[Line ${err.lineNumber}] ${escapeHtml(err.error)}</div>
    ${err.raw ? `<div class="raw">→ ${escapeHtml(err.raw)}</div>` : ""}
`;

    div.style.cursor = "pointer";

    div.onclick = () => {
        jumpToLine(err.lineNumber);
    };

    consoleEl.appendChild(div);
}
function jumpToLine(lineNumber) {
    if (!editor) return;

    editor.revealLineInCenter(lineNumber);
    editor.setPosition({
        lineNumber,
        column: 1
    });
    editor.focus();
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
    const helpSearch = document.getElementById("helpSearch");
    const helpContent = document.querySelector("#helpContent pre");

    if (!helpBtn || !helpPanel || !closeHelp || !helpSearch || !helpContent) {
        console.warn("help UI not found");
        return;
    }

    const originalText = helpContent.textContent;

    helpBtn.onclick = () => helpPanel.classList.add("open");
    closeHelp.onclick = () => helpPanel.classList.remove("open");

    helpSearch.addEventListener("input", () => {
        const keyword = helpSearch.value.trim().toLowerCase();

        if (!keyword) {
            helpContent.innerHTML =
                escapeHtml(originalText).replace(/\n/g, "<br>");
            return;
        }

        const lines = originalText.split("\n");

        helpContent.innerHTML = lines.map(line => {
            return line.toLowerCase().includes(keyword)
                ? `<span class="searchHit">${escapeHtml(line)}</span>`
                : escapeHtml(line);
        }).join("<br>");
    });
}

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
function createFile() {

    const name =
        prompt("ファイル名を入力", "main.star");

    if (!name) return;

    const file = {
        id: crypto.randomUUID(),
        name: name,
        content: ""
    };

    files.push(file);
    activeFile = file;
if (!editor) return;

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

        const name = document.createElement("span");
        name.textContent = file.name;

        const renameBtn = document.createElement("button");
        renameBtn.textContent = "変更";
        renameBtn.className = "renameBtn";

        renameBtn.onclick = (e) => {
            e.stopPropagation();

            const newName = prompt(
                "新しいファイル名",
                file.name
            );

            if (newName) {
                renameFile(file.id, newName);
            }
        };

        item.appendChild(name);
        item.appendChild(renameBtn);

        item.onclick = () => openFile(file.id);

        fileTree.appendChild(item);
    });
}


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
    initFiles();
    renderTabs();
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

async function runSTar(code, vars = {}, baseLine = 1) {

    const lines = code.split("\n");

    function getBlock(startIndex) {

        const block = [];
        let depth = 1;
        let i = startIndex;

        while (i < lines.length && depth > 0) {

            const current = lines[i].trim();

            if (current.endsWith("{"))
                depth++;

            if (current === "}") {

                depth--;

                if (depth === 0)
                    break;
            }

            if (depth > 0)
                block.push(lines[i]);

            i++;
        }

        return {
            block: block.join("\n"),
            end: i
        };
    }

    for (let i = 0; i < lines.length; i++) {

    const lineNumber = baseLine + i;
    let line = lines[i].trim();

    if (!line) continue;
    if (line.startsWith("#")) continue;
/* =========================
   break
========================= */
if (line === "break") {

    vars.__break__ = true;

    return vars;
}
        /* =========================
           con
        ========================= */
        if (line.startsWith("con ")) {

            const parts = line.substring(4).split("=");

            const key = parts[0].trim();

            let value = parts[1]?.trim();

            if (value?.startsWith('"')) {
                value = value.slice(1, -1);
            } else {
                value = evalExpr(value, vars);
            }

            consts[key] = value;
            continue;
        }
        if (line.startsWith("wait ")) {

    let arg = line.substring(5).trim();

    // まず式として評価（変数・計算対応）
    let evaluated = evalExpr(arg, vars);

    let ms;

    // -------------------------
    // ① 数値ならそのまま
    // -------------------------
    if (typeof evaluated === "number") {
        ms = evaluated;
    } else {

        let str = String(evaluated).trim();

        // -------------------------
        // ② 単位対応
        // -------------------------
        if (str.endsWith("ms")) {
            ms = Number(str.slice(0, -2));
        }
        else if (str.endsWith("s")) {
            ms = Number(str.slice(0, -1)) * 1000;
        }
        else if (str.endsWith("m")) {
            ms = Number(str.slice(0, -1)) * 60000;
        }
        else {
            ms = Number(str);
        }
    }

    // -------------------------
    // ③ バリデーション
    // -------------------------
    if (!Number.isFinite(ms)) {
        runtimeError("Invalid wait value", lineNumber, line);
        continue;
    }

    await new Promise(r => setTimeout(r, ms));
    continue;
}
/* =========================
   func
========================= */
if (line.startsWith("func ")) {

    const match =
        line.match(
            /^func\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)\s*\{$/
        );

    if (!match) {
        log("Syntax Error: func");
        continue;
    }

    const funcName = match[1];

    const params =
        match[2]
            .split(",")
            .map(v => v.trim())
            .filter(v => v);

    const block = [];

    let depth = 1;
    i++;

    while (i < lines.length && depth > 0) {

        const current =
            lines[i].trim();

        if (current.endsWith("{"))
            depth++;

        if (current === "}") {

            depth--;

            if (depth === 0)
                break;
        }

        if (depth > 0)
            block.push(lines[i]);

        i++;
    }

    functions[funcName] = {
        params,
        body: block.join("\n")
    };

    continue;
}
       if (line.startsWith("class ")) {

    const match =
        line.match(
            /^class\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\{$/
        );

    if (!match) {
        runtimeError(
            "Syntax Error (class)",
            lineNumber,
            line
        );
        continue;
    }

    const className = match[1];

    const result =
        getBlock(i + 1);

    const cls = {
        fields: {},
        methods: {}
    };

    const classLines =
        result.block.split("\n");

    for (let j = 0; j < classLines.length; j++) {

        let cl =
            classLines[j].trim();

        if (!cl) continue;

        if (cl.startsWith("let ")) {

            const m =
                cl.match(
                    /^let\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/
                );

            if (m) {

                cls.fields[
                    m[1].trim()
                ] = m[2].trim();
            }
        }
        if (cl.startsWith("func ")) {

    const funcMatch =
        cl.match(
            /^func\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)\s*\{$/
        );

    if (funcMatch) {

        const methodName = funcMatch[1];

        const params =
            funcMatch[2]
                .split(",")
                .map(v => v.trim())
                .filter(v => v);

        let depth = 1;
        const body = [];

        j++;

        while (
            j < classLines.length &&
            depth > 0
        ) {

            const current =
                classLines[j].trim();

            if (current.endsWith("{"))
                depth++;

            if (current === "}") {

                depth--;

                if (depth === 0)
                    break;
            }

            if (depth > 0)
                body.push(classLines[j]);

            j++;
        }

        cls.methods[methodName] = {
            params,
            body: body.join("\n")
        };
    }
}
    }

    classes[className] = cls;

    i = result.end;
    continue;
}
           /*===================================
           clear
           ====================================*/
        if (line === "clear") {
    clearConsole();
    continue;
}
        /* =========================
           repeat
        ========================= */
        if (line.startsWith("repeat ")) {

    const match =
        line.match(
            /^repeat\s+(.+?)\s*\{$/
        );

if (!match) {
    runtimeError("Syntax Error (repeat)", lineNumber, line);
    continue;
}

    const count =
        Number(
            evalExpr(
                match[1],
                vars
            )
        );

    const result =
        getBlock(i + 1);

    for (
        let r = 0;
        r < count;
        r++
    ) {

        vars.count = r + 1;

        const loopResult = await runSTar(result.block, vars, lineNumber);

        if (
            loopResult.__continue__
        ) {

            delete vars.__continue__;
            continue;
        }

        if (
            loopResult.__break__
        ) {

            delete vars.__break__;
            break;
        }
    }

    i = result.end;
    continue;
}

        /* =========================
           while
        ========================= */
        if (line.startsWith("while ")) {

    const match =
        line.match(
            /^while\s+(.+?)\s*\{$/
        );

   if (!match) {
    runtimeError("Syntax Error (while)", lineNumber, line);
    continue;
}

    const condition =
        match[1];

    const result =
        getBlock(i + 1);

    while (
        evalExpr(
            condition,
            vars
        )
    ) {

        const loopResult = await runSTar(result.block, vars, lineNumber);

        if (
            loopResult.__continue__
        ) {

            delete vars.__continue__;
            continue;
        }

        if (
            loopResult.__break__
        ) {

            delete vars.__break__;
            break;
        }
    }

    i = result.end;
    continue;
}
/* =========================
   continue
========================= */
if (line === "continue") {
    vars.__continue__ = true;
    continue;
}
        /* =========================
           if / eif / else
        ========================= */
        if (line.startsWith("if ")) {

            let executed = false;

            const match =
                line.match(/^if\s+(.+?)\s*\{$/);

            if (!match) {
                log("Syntax Error: if");
                continue;
            }

            const result =
                getBlock(i + 1);

            if (
                evalExpr(
                    match[1],
                    vars
                )
            ) {

                executed = true;

                await runSTar(
                    result.block,
                    vars
                );
            }

            i = result.end;

            while (
                i + 1 < lines.length &&
                lines[i + 1].trim().startsWith("eif ")
            ) {

                i++;

                const eifLine =
                    lines[i].trim();

                const eifMatch =
                    eifLine.match(
                        /^eif\s+(.+?)\s*\{$/
                    );

                const eifResult =
                    getBlock(i + 1);

                if (
                    !executed &&
                    evalExpr(
                        eifMatch[1],
                        vars
                    )
                ) {

                    executed = true;

                    await runSTar(
                        eifResult.block,
                        vars
                    );
                }

                i = eifResult.end;
            }

            if (
                i + 1 < lines.length &&
                lines[i + 1].trim() === "else{"
            ) {

                i++;

                const elseResult =
                    getBlock(i + 1);

                if (!executed) {

                    await runSTar(
                        elseResult.block,
                        vars
                    );
                }

                i = elseResult.end;
            }

            continue;
        }
/* =========================
   input
========================= */
if (line.startsWith("input ")) {

    const match =
        line.match(
         /^input\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+"([^"]*)")?(?:\s*=\s*(.+))?$/
        );

    if (!match) {
    runtimeError("Syntax Error (input)", lineNumber, line);
    continue;
}

    const varName = match[1];
    const message = match[2];
    let defaultValue = match[3];

    if (varName in consts) {
        log(`Constant Error: ${varName}`);
        continue;
    }

    if (defaultValue !== undefined) {

        defaultValue =
            defaultValue.trim();

        if (
            defaultValue.startsWith('"') &&
            defaultValue.endsWith('"')
        ) {
            defaultValue =
                defaultValue.slice(1, -1);
        } else {
            defaultValue =
                evalExpr(
                    defaultValue,
                    vars
                );
        }
    }

    const promptText =
        message ||
        `${varName} =`;

    const value =
    prompt(
        promptText,
        defaultValue ?? ""
    );

if (
    value === null ||
    value.trim() === ""
) {

    if (defaultValue !== undefined) {

        vars[varName] =
            defaultValue;

    } else {

        vars[varName] = "";
    }

    continue;
}

    const num =
        Number(value);

    vars[varName] =
        value.trim() !== "" &&
        !isNaN(num)
            ? num
            : value;

    continue;
}
        const methodCall =
    line.match(
        /^call\s+([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\((.*?)\)$/
    );

if (methodCall) {

    const obj =
        vars[methodCall[1]];

    if (!obj?.__class__) {

        runtimeError(
            "Object Error",
            lineNumber,
            line
        );

        continue;
    }

    const method =
        obj.__class__.methods[
            methodCall[2]
        ];

    if (!method) {

        runtimeError(
            `Method Error: ${methodCall[2]}`,
            lineNumber,
            line
        );

        continue;
    }

    const localVars = {
        ...vars,
        this: obj
    };

    const args =
        methodCall[3]
            .split(",")
            .map(v => v.trim())
            .filter(v => v);

    method.params.forEach(
        (p, index) => {

            localVars[p] =
                evalExpr(
                    args[index] ?? "undefined",
                    vars
                );
        }
    );

    await runSTar(
        method.body,
        localVars,
        lineNumber
    );

    continue;
}
 /* =========================
   let x = call func()
========================= */
if (
    line.startsWith("let ") &&
    line.includes("call ")
) {

    const match =
        line.match(
            /^let\s+(.+?)\s*=\s*call\s+([a-zA-Z_][a-zA-Z0-9_]*)\((.*?)\)$/
        );

    if (match) {

        const varName =
            match[1].trim();

        const funcName =
            match[2];

        const func =
            functions[funcName];

        if (!func) {

            log(
                `Function Error: ${funcName}`
            );

            continue;
        }

        const localVars =
            { ...vars };

        const args =
            match[3]
                .split(",")
                .map(v => v.trim())
                .filter(v => v);

        func.params.forEach(
            (p, index) => {

                const arg =
                    args[index];

                if (
                    arg?.startsWith('"') &&
                    arg?.endsWith('"')
                ) {

                    localVars[p] =
                        arg.slice(1, -1);

                } else {

                    localVars[p] =
                        evalExpr(
                            arg ?? "undefined",
                            vars
                        );
                }
            }
        );

        const result =
            await runSTar(
                func.body,
                localVars
            );

        vars[varName] =
            result.__return__;

        continue;
    }
}
        if (
    line.startsWith("let ") &&
    line.includes("new ")
) {

    const match =
        line.match(
            /^let\s+(.+?)\s*=\s*new\s+([a-zA-Z_][a-zA-Z0-9_]*)\((.*?)\)$/
        );

    if (match) {

        const varName = match[1];
        const className = match[2];
const argText = match[3];

const args =
    argText
        .split(",")
        .map(v => v.trim())
        .filter(v => v);
        const cls =
    classes[className];

        if (!cls) {
            runtimeError(
                `Class Error: ${className}`,
                lineNumber,
                line
            );
            continue;
        }

        const obj = {};

for (const k in cls.fields) {

    obj[k] =
        evalExpr(
            cls.fields[k],
            {
                ...vars,
                this: obj
            }
        );
}

obj.__class__ = cls;
        const ctor =
    cls.methods.constructor;

if (ctor) {

    const localVars = {
        ...vars,
        this: obj
    };

    ctor.params.forEach(
        (p, index) => {

            const arg =
                args[index];

            if (
                arg?.startsWith('"') &&
                arg?.endsWith('"')
            ) {

                localVars[p] =
                    arg.slice(1, -1);

            } else {

                localVars[p] =
                    evalExpr(
                        arg ?? "undefined",
                        vars
                    );
            }
        }
    );

    await runSTar(
        ctor.body,
        localVars,
        lineNumber
    );
}

        vars[varName] = obj;

        continue;
    }
}
        /* =========================
           let
        ========================= */
        if (line.startsWith("let ")) {

            const parts =
                line.substring(4).split("=");

            const key =
                parts[0].trim();

            let value =
                parts[1]?.trim();

            if (value?.startsWith('"')) {

                value =
                    value.slice(1, -1);

            } else {

                value =
                    evalExpr(
                        value,
                        vars
                    );
            }

            vars[key] = value;
            continue;
        }
        if (line.includes(".push(")) {

    const pushMatch =
        line.match(
            /^([a-zA-Z_][a-zA-Z0-9_]*)\.push\((.*?)\)$/
        );

    if (pushMatch) {

        const arr = vars[pushMatch[1]];

        if (!Array.isArray(arr)) {

            runtimeError(
                `${pushMatch[1]} is not array`,
                lineNumber,
                line
            );

            continue;
        }

        arr.push(
            evalExpr(
                pushMatch[2],
                vars
            )
        );

        continue;
    }
} 
if (line.endsWith(".pop()")) {

    const popMatch =
    line.match(
        /^([a-zA-Z_][a-zA-Z0-9_]*)\.pop\(\)$/
    );

if (popMatch) {

    const arr = vars[popMatch[1]];

    if (!Array.isArray(arr)) {

        runtimeError(
            `${popMatch[1]} is not array`,
            lineNumber,
            line
        );

        continue;
    }

    arr.pop();

    continue;
}
}
/* =========================
   call
========================= */
if (line.startsWith("call ")) {

    const match =
        line.match(
            /^call\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\((.*?)\))?$/
        );

    if (!match) {

        log("Syntax Error: call");
        continue;
    }

    const funcName =
        match[1];

    const func =
        functions[funcName];

    if (!func) {

        log(
            `Function Error: ${funcName}`
        );

        continue;
    }

    const localVars =
        { ...vars };

    const args =
        (match[2] || "")
            .split(",")
            .map(v => v.trim())
            .filter(v => v);

    func.params.forEach(
        (p, index) => {

            const arg =
                args[index];

            if (
                arg?.startsWith('"') &&
                arg?.endsWith('"')
            ) {

                localVars[p] =
                    arg.slice(1, -1);

            } else {

                localVars[p] =
                    evalExpr(
                        arg ?? "undefined",
                        vars
                    );
            }
        }
    );

    const result =
        await runSTar(
            func.body,
            localVars
        );

    vars.__return__ =
        result.__return__;

    continue;
}
        /* =========================
   return
========================= */
if (line.startsWith("return ")) {

    vars.__return__ =
        evalExpr(
            line.substring(7).trim(),
            vars
        );

    return vars;
}
        /* =========================
           print
        ========================= */
        if (line.startsWith("print ")) {

    const expr =
        line.substring(6).trim();

    const value =
        expr.startsWith('"')
            ? expr.slice(1,-1)
            : evalExpr(expr, vars);

    log(value);
    continue;
}
if (line.startsWith("switch ")) {

    const match =
        line.match(
            /^switch\s+(.+?)\s*\{$/
        );

    if (!match) {

        log("Syntax Error: switch");
        continue;
    }

    const switchValue =
        evalExpr(
            match[1],
            vars
        );

    const result =
        getBlock(i + 1);

    const blockLines =
        result.block.split("\n");

    let executing = false;
    let found = false;

    for (
        let j = 0;
        j < blockLines.length;
        j++
    ) {

        const current =
            blockLines[j].trim();

        if (
            current.startsWith("case ")
        ) {

            const caseValue =
                current
                    .replace("case","")
                    .replace(":","")
                    .trim();

            executing =
                switchValue ==
                evalExpr(
                    caseValue,
                    vars
                );

            if (executing)
                found = true;

            continue;
        }

        if (
            current === "default:"
        ) {

            executing =
                !found;

            continue;
        }

        if (
            current === "break"
        ) {

            if (executing)
                break;

            continue;
        }

        if (executing) {

            await runSTar(
                current,
                vars
            );
        }
    }

    i = result.end;
    continue;
}
        const thisAssign =
    line.match(
        /^this\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/
    );

if (thisAssign) {

    if (vars.this) {

        vars.this[
            thisAssign[1]
        ] =
            evalExpr(
                thisAssign[2],
                vars
            );
    }

    continue;
}
       const objectAssign =
    line.match(
        /^([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/
    );

if (objectAssign) {

    const obj =
        vars[objectAssign[1]];

    if (
        obj &&
        typeof obj === "object"
    ) {

        obj[objectAssign[2]] =
            evalExpr(
                objectAssign[3],
                vars
            );
    }

    continue;
}
/*===============================================
    配列再代入
  ===============================================*/
const arrayAssign =
    line.match(
        /^([a-zA-Z_][a-zA-Z0-9_]*)\[(.+?)\]\s*=\s*(.+)$/
    );

if (arrayAssign) {

    const arrayName =
        arrayAssign[1];

    const index =
        Number(
            evalExpr(
                arrayAssign[2],
                vars
            )
        );

    const value =
        evalExpr(
            arrayAssign[3],
            vars
        );

    if (
        Array.isArray(
            vars[arrayName]
        )
    ) {

        vars[arrayName][index] =
            value;
    }

    continue;
}
   
        /* =========================
           再代入
        ========================= */
        if (line.includes("=")) {

            const parts =
                line.split("=");

            const key =
                parts[0].trim();

            if (key in consts) {

                log(
                    `Constant Error: ${key}`
                );

                continue;
            }

            let value =
                parts[1]?.trim();

            if (value?.startsWith('"')) {

                value =
                    value.slice(1, -1);

            } else {

                value =
                    evalExpr(
                        value,
                        vars
                    );
            }

            vars[key] = value;
        }
    }

    return vars;
}

function evalExpr(expr, vars) {
expr = expr.replace(
    /\bthis\.([a-zA-Z_][a-zA-Z0-9_]*)\b/g,
    (_, prop) => {

        if (
            vars.this &&
            prop in vars.this
        ) {
            return JSON.stringify(
                vars.this[prop]
            );
        }

        return "undefined";
    }
);
    if (
        expr === undefined ||
        expr === null
    ) {
        return "";
    }

    expr = String(expr).trim();
/* =========================
   string template ``
========================= */
expr = expr.replace(/`([^`]*)`/g, (_, tpl) => {

    return JSON.stringify(
        tpl.replace(/\$\{(.*?)\}/g, (_, code) => {
            return evalExpr(code, vars);
        })
    );

});
    /* =========================
       length
    ========================= */

    expr = expr.replace(
        /([a-zA-Z_][a-zA-Z0-9_]*)\.length/g,
        (_, name) =>
            vars[name]?.length ?? 0
    );

    /* =========================
       upper()
    ========================= */

    expr = expr.replace(
        /([a-zA-Z_][a-zA-Z0-9_]*)\.upper\(\)/g,
        (_, name) =>
            JSON.stringify(
                String(
                    vars[name] ?? ""
                ).toUpperCase()
            )
    );

    /* =========================
       lower()
    ========================= */

    expr = expr.replace(
        /([a-zA-Z_][a-zA-Z0-9_]*)\.lower\(\)/g,
        (_, name) =>
            JSON.stringify(
                String(
                    vars[name] ?? ""
                ).toLowerCase()
            )
    );
/* =========================
   object.property
========================= */

expr = expr.replace(
    /\b(?!this\b)([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\b(?!\s*\()/g,
    (_, objName, prop) => {

        const obj = vars[objName];

        if (
            obj &&
            typeof obj === "object" &&
            prop in obj
        ) {
            return JSON.stringify(
                obj[prop]
            );
        }

        return "undefined";
    }
);
    /* =========================
       random(min,max)
    ========================= */

    expr = expr.replace(
        /random\((.+?),(.+?)\)/g,
        (_, min, max) => {

            min = Number(
                evalExpr(
                    min,
                    vars
                )
            );

            max = Number(
                evalExpr(
                    max,
                    vars
                )
            );

            return Math.floor(
                Math.random() *
                (max - min + 1)
            ) + min;
        }
    );

    /* =========================
       key("x")
    ========================= */

    expr = expr.replace(
        /key\("(.+?)"\)/g,
        (_, keyName) =>
            keys[keyName] === true
    );

    /* =========================
       mouse
    ========================= */

    expr = expr.replace(
        /\bmouseX\b/g,
        mouseX
    );

    expr = expr.replace(
        /\bmouseY\b/g,
        mouseY
    );

    /* =========================
       const
    ========================= */

    for (const key in consts) {

        expr = expr.replace(
            new RegExp(
                `\\b${key}\\b`,
                "g"
            ),
            JSON.stringify(
                consts[key]
            )
        );
    }

    /* =========================
       vars
    ========================= */

    for (const key in vars) {

    const value = vars[key];

    if (
        typeof value === "object" &&
        value !== null
    ) {
        continue;
    }

    expr = expr.replace(
        new RegExp(
            `\\b${key}\\b`,
            "g"
        ),
        JSON.stringify(value)
    );
}

    /* =========================
       実行
    ========================= */

    try {

        return Function(
            `"use strict";
            return (${expr});`
        )();

    } catch (e) {
    log(`[Expression Error] ${expr}`);
    return 0;
}
}
/* =====================================================
COMPILE
===================================================== */

function compileToJS(code, vars) {

let js = "";

const lines = code.split("\n");

for (let line of lines) {

    line = line.trim();
    if (!line) continue;

    if (line.startsWith("print ")) {

    let value =
        line.substring(6).trim();

    if (
        vars.hasOwnProperty(value)
    ) {

        log(vars[value]);

        continue;
    }

    log(
        evalExpr(
            value,
            vars
        )
    );

    continue;
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

runBtn.onclick = async () => {

    clearConsole();

    saveCurrentFile();

    for (const k in functions) {
        delete functions[k];
    }

    await runSTar(
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
if (!editor) return;

renderTabs();
renderTree();

};

clearBtn.onclick =
clearConsole;

fileInput.addEventListener("change", e => {

    saveCurrentFile();

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

        const existing =
            files.find(f => f.name === file.name);

        if (existing) {

            existing.content = reader.result;
            activeFile = existing;

            editor.setValue(existing.content);

        } else {

            const newFile = {
                id: crypto.randomUUID(),
                name: file.name,
                content: reader.result
            };

            files.push(newFile);
            activeFile = newFile;

            editor.setValue(newFile.content);
        }

        saveFiles();
        renderTabs();
        renderTree();

        fileInput.value = "";
    };

    reader.onerror = () => {
        log("ファイル読み込み失敗");
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
function runtimeError(msg, line, raw) {
    log(`[Line ${line}] ${msg}`);
    if (raw !== undefined) {
        log(`→ ${raw}`);
    }
}
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.getElementById("helpPanel")?.classList.remove("open");
    }
});
document.addEventListener(
    "keydown",
    e => {

        keys[e.key] = true;

    }
);

document.addEventListener(
    "keyup",
    e => {

        keys[e.key] = false;

    }
);
document.addEventListener(
    "mousemove",
    e => {

        mouseX = e.clientX;
        mouseY = e.clientY;

    }
);
window.addEventListener("load", () => {

    const sidebar =
        document.getElementById("fileSidebar");

    const resizer =
        document.getElementById("sidebarResizer");

    if (!sidebar || !resizer) return;

    let isDragging = false;

    resizer.addEventListener("mousedown", () => {
        isDragging = true;
        document.body.style.cursor = "ew-resize";
    });

    document.addEventListener("mousemove", (e) => {

        if (!isDragging) return;

        let newWidth = e.clientX;

        if (newWidth < 180) newWidth = 180;
        if (newWidth > 600) newWidth = 600;

        sidebar.style.width = newWidth + "px";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        document.body.style.cursor = "";
    });

});

const editorArea =
    document.getElementById("editor");

editorArea.addEventListener(
    "dragover",
    e => {
        e.preventDefault();
    }
);

editorArea.addEventListener(
    "drop",
    e => {

        e.preventDefault();

        const file =
            e.dataTransfer.files[0];

        if (!file) return;

        const reader =
            new FileReader();

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
    }
);
