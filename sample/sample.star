canvas create 800 500

let x = 375
let y = 400

let enemyX1 = 100
let enemyY1 = 50

let enemyX2 = 400
let enemyY2 = 150

let enemyX3 = 650
let enemyY3 = 0

let bulletX = 0
let bulletY = 0
let bulletActive = 0
let score = 0
let gameOver = 0

canvas animate 60 {

    canvas clear
    canvas background "#111827"
    
    if gameOver == 0 {


        if key("ArrowLeft") {
            x = x - 5
        }

        if key("ArrowRight") {
            x = x + 5
        }

        if key("ArrowUp") {
            y = y - 5
        }

        if key("ArrowDown") {
            y = y + 5
        }


        if x < 0 {
            x = 0
        }

        if x > 750 {
            x = 750
        }

        if y < 0 {
            y = 0
        }

        if y > 450 {
            y = 450
        }


        enemyY1 = enemyY1 + 3
        enemyX1 = enemyX1 + 2
        
        if enemyX1 > 750 {
            enemyX1 = 0
        }

        if enemyY1 > 500 {
            enemyY1 = 0
        }


        enemyY2 = enemyY2 + 4
        enemyX2 = enemyX2 - 2
        
        if enemyX2 < 0 {
            enemyX2 = 750
        }

        if enemyY2 > 500 {
            enemyY2 = 0
        }


        enemyY3 = enemyY3 + 5
        enemyX3 = enemyX3 - 3
        
        if enemyX3 < 0 {
            enemyX3 = 750
        }

        if enemyY3 > 500 {
            enemyY3 = 0
        }


        if key("Space") {

            if bulletActive == 0 {

                bulletX = x + 22
                bulletY = y

                bulletActive = 1
            }
        }


        if bulletActive == 1 {

            bulletY = bulletY - 8

            if bulletY < 0 {
                bulletActive = 0
            }
        }


        if bulletActive == 1 {

            if bulletX > enemyX1 {

                if bulletX < enemyX1 + 50 {

                    if bulletY > enemyY1 {

                        if bulletY < enemyY1 + 50 {

                            score = score + 1
                            
                            bulletActive = 0
                            
                            enemyY1 = 0
                            enemyX1 = 100
                        }
                    }
                }
            }
        }


        if bulletActive == 1 {

            if bulletX > enemyX2 {

                if bulletX < enemyX2 + 50 {

                    if bulletY > enemyY2 {

                        if bulletY < enemyY2 + 50 {

                            score = score + 1
                            
                            bulletActive = 0
                            
                            enemyY2 = 0
                            enemyX2 = 400
                        }
                    }
                }
            }
        }


        if bulletActive == 1 {

            if bulletX > enemyX3 {

                if bulletX < enemyX3 + 50 {

                    if bulletY > enemyY3 {

                        if bulletY < enemyY3 + 50 {

                            score = score + 1
                            
                            bulletActive = 0
                            
                            enemyY3 = 0
                            enemyX3 = 650
                        }
                    }
                }
            }
        }


        if x < enemyX1 + 50 {

            if x + 50 > enemyX1 {

                if y < enemyY1 + 50 {

                    if y + 50 > enemyY1 {

                        gameOver = 1
                    }
                }
            }
        }


        if x < enemyX2 + 50 {

            if x + 50 > enemyX2 {

                if y < enemyY2 + 50 {

                    if y + 50 > enemyY2 {

                        gameOver = 1
                    }
                }
            }
        }


        if x < enemyX3 + 50 {

            if x + 50 > enemyX3 {

                if y < enemyY3 + 50 {

                    if y + 50 > enemyY3 {

                        gameOver = 1
                    }
                }
            }
        }


        canvas fill "#00e5ff"
        canvas fillRect x y 50 50


        canvas fill "#ff3366"
        canvas fillRect enemyX1 enemyY1 50 50


        canvas fill "#ff9900"
        canvas fillRect enemyX2 enemyY2 50 50


        canvas fill "#cc66ff"
        canvas fillRect enemyX3 enemyY3 50 50


        if bulletActive == 1 {

            canvas fill "#ffff00"
            canvas fillRect bulletX bulletY 6 15
        }

    }


    if gameOver == 1 {

        canvas fill "#111827"
        canvas fillRect 200 150 400 200

        canvas fill "#ff3366"
        canvas fillRect 250 180 300 100

        canvas fill "#ffffff"
        canvas fillRect 290 205 25 10
        canvas fillRect 325 205 25 10
        canvas fillRect 360 205 25 10
        canvas fillRect 395 205 25 10
        canvas fillRect 430 205 25 10

        canvas fill "#00e5ff"
        canvas fillRect 300 240 200 10

        canvas text "Game Over" 300 240 20
        canvas text `スコア:${score}` 300 270 20
    }


    if key("KeyR") {

        if gameOver == 1 {

            x = 375
            y = 400

            enemyX1 = 100
            enemyY1 = 50
            
            enemyX2 = 400
            enemyY2 = 150
            
            enemyX3 = 650
            enemyY3 = 0

            bulletX = 0
            bulletY = 0
            bulletActive = 0
            
            score = 0
            gameOver = 0
        }
    }

}
