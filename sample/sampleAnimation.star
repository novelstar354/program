let x = 400
let y = 250
let angle = 0

canvas create 800 500

canvas animate 120 {

    canvas clear
    canvas background "#111827"

    canvas save

    canvas translate x y
    canvas rotate angle

    canvas fill "#00e5ff"
    canvas fillRect -50 -50 100 100

    canvas restore

    angle = angle + 2
}
