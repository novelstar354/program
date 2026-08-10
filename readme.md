# STar



 **Language / 言語**

[🇯🇵 日本語](https://github.com/novelstar354/program) | [🇺🇸 English](https://github.com/novelstar354/enstar)

**STar** は、シンプルで分かりやすい構文を目指して開発されているプログラミング言語です。

STar IDE上でコードを書いて実行でき、変数・条件分岐・ループ・関数・クラスなどの基本的なプログラミング機能に加えて、**Canvasを使ったゲームやアニメーションの制作**にも対応しています。

---

## Features

### 基本構文

STarでは、以下のような機能を利用できます。

* 変数
* 再代入
* 配列
* `if / eif / else`
* `repeat`
* `while`
* `break`
* `continue`
* 関数
* クラス
* `call`
* `new`
* `push / pop`
* `wait`
* `input`
* `exit`
* `clear`

---

## Hello World

STarでは、`print`を使って文字を表示できます。

```star
print "Hello STar!"
```

変数も使用できます。

```star
let name = "World"

print name
```

---

## Variables

`let`を使って変数を作成できます。

```star
let x = 100
let y = 200

print x
print y
```

変数は後から変更できます。

```star
let score = 0

score = score + 10

print score
```

---

## Conditions

条件分岐には`if`、`eif`、`else`を使用します。

```star
let score = 80

if score >= 90 {
    print "Excellent!"
}
eif score >= 60 {
    print "Good!"
}
else {
    print "Try again!"
}
```

---

## Loops

### repeat

指定した回数だけ処理を繰り返せます。

```star
repeat 5 {
    print "Hello"
}
```

### while

条件が成立している間、処理を繰り返します。

```star
let x = 0

while x < 10 {
    print x
    x = x + 1
}
```

---

## Functions

`func`を使って関数を作成できます。

```star
func hello {
    print "Hello STar!"
}

call hello
```

---

## Classes

STarではクラスを使用して、オブジェクトを作成できます。

```star
class Player {
    name "Player"
    x 400
    y 250
}
```

`new`などを利用してオブジェクトを扱うことができます。

---

# Canvas

STarの大きな特徴の1つがCanvas機能です。

Canvasを使うことで、図形・文字・アニメーションなどを描画できます。

## Canvasを作成

```star
canvas create 800 500
```

---

## 四角形

```star
canvas fill "#00e5ff"
canvas fillRect 100 100 200 100
```

---

## 円

```star
canvas fill "#ff0000"
canvas fillCircle 400 250 50
```

---

## 線

```star
canvas stroke "#ffffff"
canvas line 100 100 700 400
```

---

## 多角形

座標を指定して多角形を描画できます。

```star
canvas fill "#00ff88"

canvas polygon {
    400 100
    500 300
    300 300
}
```

---

# Canvas Transform

Canvasでは描画位置や角度を変更できます。

### save / restore

```star
canvas save

canvas fill "#00e5ff"
canvas fillRect 100 100 100 100

canvas restore
```

### translate

```star
canvas save

canvas translate 400 250
canvas fillRect -50 -50 100 100

canvas restore
```

### rotate

角度は度数法で指定します。

```star
canvas save

canvas translate 400 250
canvas rotate 45

canvas fill "#00e5ff"
canvas fillRect -50 -50 100 100

canvas restore
```

---

# Canvas Animation

`canvas animate`を使うと、Canvas上でアニメーションを作成できます。

```star
canvas create 800 500

let x = 400
let angle = 0

canvas animate 60 {

    canvas clear
    canvas background "#111827"

    canvas save

    canvas translate x 250
    canvas rotate angle

    canvas fill "#00e5ff"
    canvas fillRect -50 -50 100 100

    canvas restore

    angle = angle + 1
}
```

これによって、回転する四角形などのアニメーションを作成できます。

---

# Mouse

Canvasではマウス入力を利用できます。

マウスの位置やボタン状態を利用することで、ゲームなどのインタラクティブなプログラムを作ることができます。

---

# Game Development

STarは、Canvas機能を利用して簡単なゲームを作ることもできます。

例えば、

* プレイヤーの移動
* 敵
* 弾
* 衝突判定
* マウス操作
* キーボード操作
* アニメーション
* スコア
* ゲームオーバー

などを組み合わせることができます。

---

# Object

Canvas Objectを使用すると、ゲーム内のオブジェクトをまとめて管理できます。

```star
canvas object "player" {
    position 400 250
    angle 0
    opacity 1

    size 100 100
    fill "#00e5ff"
}
```

オブジェクトのプロパティを変更することで、位置・角度・透明度などを操作できます。

---

# Object Animation

STarではオブジェクトのアニメーションも扱えます。

例えば、

```star
player move 600 250 2s
```

のように、オブジェクトを指定した位置へ移動させることができます。

また、回転やフェードなどのアニメーションにも対応しています。

```star
player rotate 360 2s
player fadein 1s
player fadeout 1s
```

---

#  STar IDE

STarには専用のWeb IDEである**STar IDE**があります。

STar IDEでは、

* コード編集
* ファイル管理
* Monaco Editor
* コード実行
* コンソール
* Canvasプレビュー
* ダークテーマ
* ファイルの保存
* Undo / Redo
* 検索
* 全画面表示

などの機能を利用できます。

---

# Getting Started

STar IDEを起動して、新しい`.star`ファイルを作成します。

例えば、

```star
print "Hello STar!"

let x = 10
let y = 20

print x + y
```

コードを入力して**Run**を押すと、STarプログラムを実行できます。

---

# Example

簡単なCanvasプログラムの例です。

```star
canvas create 800 500

let x = 400
let y = 250
let angle = 0

canvas animate 60 {

    canvas clear
    canvas background "#111827"

    canvas save

    canvas translate x y
    canvas rotate angle

    canvas fill "#00e5ff"
    canvas fillRect -50 -50 100 100

    canvas restore

    angle = angle + 1
}
```

この例では、Canvas中央に配置された四角形を毎フレーム回転させています。

---

# Project Structure

```text
STar/
├── index.html
├── style.css
├── app.js
└── README.md
```

### `index.html`

STar IDEのHTML構造を担当します。

### `style.css`

IDEのデザインやレイアウトを担当します。

### `app.js`

STarの実行エンジン、Canvas機能、IDEの動作などを担当します。

---

# Development

STarは現在も開発中です。

新しい構文やCanvas機能、ゲーム制作に必要な機能などを追加していく予定です。

今後さらに、

* サウンド
* より高度なObjectシステム
* ゲーム制作機能
* デバッグ機能
* ドキュメント
* サンプルプログラム
* 3D機能

などの機能を拡張していく予定です。

---

# Contributing

STarについてのお問い合わせ、バグ報告、機能の提案などがありましたら、GitHubのIssuesをご利用ください。

### バグ報告

不具合を見つけた場合は、以下の情報をできるだけ詳しく記載してください。

* 発生した問題
* 実行したSTarコード
* 表示されたエラーメッセージ
* 期待していた動作
* 実際に起きた動作

### 機能提案

「こんな機能が欲しい」「こうしたらもっと使いやすい」といったアイデアも歓迎しています。

### その他のお問い合わせ

STarに関する質問やその他のお問い合わせについても、GitHubのIssuesからお気軽にご連絡ください。

**STarをより良いプログラミング言語にするため、皆さんからのフィードバックをお待ちしています！**


# License

このプロジェクトのライセンスについては、リポジトリ内の`LICENSE`ファイルを確認してください。

---

# STar

**Simple programming. Creative programming.**

STarは、プログラミングをもっとシンプルに、そしてゲームやアニメーションをもっと楽しく作れる言語を目指しています。
