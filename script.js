class Circle {
    #vx = 0
    #vy = 0
    constructor(radius) {
        this.radius = radius
        this.x = randRange(0 + radius, window.innerWidth - radius)
        this.y = randRange(0 + radius, window.innerHeight - radius)
        this.#vx = randRange(-1/2, 1/2)
        this.#vy = randRange(-1/2, 1/2)
    }
    
    move() {
        if(this.x + this.radius > cv.width || this.x - this.radius < 0) {
            this.#vx *= -1
        }
        if(this.y + this.radius > cv.height || this.y - this.radius < 0) {
            this.#vy *= -1
        }

        this.x += this.#vx
        this.y += this.#vy
    }
}

function init() {
    cv = document.getElementById("metaballs")
    
    circles = [...new Array(20)].map(() => new Circle(randRange(30, 80)))

    if(cv.getContext) {
        ctx = document.getElementById("metaballs").getContext('2d')
        window.addEventListener("resize", resizeCanvas, false)
        
        resizeCanvas()
    }    
}

function getGrid(res) {
    let grid = []
    for(let row = 0; row < cv.height / res + 1; ++row) {
        grid.push([])
        for(let col = 0; col < cv.width / res + 1; ++col) {
            let x = col * res
            let y = row * res
            grid[row].push(metaball(circles, x, y))
        }
    }
    return grid
}

function metaball(circles, x, y) {
    let sum = 0
    circles.forEach( c => {
        sum += (c.radius**2 / ((x - c.x)**2 + (y - c.y)**2))
    })
    return sum
}

function colorCells(grid, res) {
    ctx.fillStyle = "rgb(123, 200, 0)"

    grid.forEach((r, ri) => {
        r.forEach((c, ci) => {
            if(c > 1)
                ctx.fillRect(ci*res, ri*res, res, res)
        })
    })
}

function drawGrid(grid, res) {
    ctx.strokeStyle = "rgb(100,100,100)"
    ctx.lineWidth = 1

    grid.forEach((_,row) => {
        ctx.beginPath()
        ctx.moveTo(0, row*res)
        ctx.lineTo(grid[0].length*res, row*res)
        ctx.stroke()
    })

    grid[0].forEach((_,col) => {
        ctx.beginPath()
        ctx.moveTo(col*res, 0)
        ctx.lineTo(col*res, grid.length*res)
        ctx.stroke()
    })
}

function drawContour(grid, res) {
    ctx.strokeStyle = "cyan"
    ctx.lineWidth = 4
    ctx.lineCap = "round"
    
    for(let row = 0; row < grid.length - 1; ++row) {
        for(let col = 0; col < grid[row].length - 1; ++col) {
            let TL = grid[row][col]
            let TR = grid[row][col + 1]
            let BL = grid[row + 1][col]
            let BR = grid[row + 1][col + 1]

            // fully filled cell
            if(TL>=1 && TR>=1 && BL>=1 && BR>=1) {
                continue;
            }

            // empty cell
            if(TL<1 && TR<1 && BL<1 && BR<1) {
                continue;
            }

            // contour cell
            let contourPoints = []
            if(TL>=1 ^ TR>=1) {
                contourPoints.push(
                    {
                        x: col*res + lerp(TL, 0, TR, res, 1),
                        y: row*res
                    })
            } 
            if(TR>=1 ^ BR>=1) {
                contourPoints.push(
                    {
                        x: (col+1)*res,
                        y: row*res + lerp(TR, 0, BR, res, 1)
                    })
            }
            if(BR>=1 ^ BL>=1) {
                contourPoints.push(
                    {
                        x: col*res + lerp(BL, 0, BR, res, 1),
                        y: (row+1)*res
                    })
            }
            if(BL>=1 ^ TL>=1) {
                contourPoints.push(
                    {
                        x: col*res,
                        y: row*res + lerp(TL, 0, BL, res, 1)
                    })
            }


            // if it was a double contour cell, need additional line
            if(contourPoints.length === 4) {
                if(TL>=1 && BR>=1) {
                    ctx.beginPath()
                    ctx.moveTo(contourPoints[0].x, contourPoints[0].y)
                    ctx.lineTo(contourPoints[1].x, contourPoints[1].y)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(contourPoints[2].x, contourPoints[2].y)
                    ctx.lineTo(contourPoints[3].x, contourPoints[3].y)
                    ctx.stroke()
                } else { // TR && BL
                    ctx.beginPath()
                    ctx.moveTo(contourPoints[0].x, contourPoints[0].y)
                    ctx.lineTo(contourPoints[3].x, contourPoints[3].y)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(contourPoints[1].x, contourPoints[1].y)
                    ctx.lineTo(contourPoints[2].x, contourPoints[2].y)
                    ctx.stroke()
                }
            } else {
                ctx.beginPath()
                ctx.moveTo(contourPoints[0].x, contourPoints[0].y)
                ctx.lineTo(contourPoints[1].x, contourPoints[1].y)
                ctx.stroke()
            }
            
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height)
    
    let res = 10
    let grid = getGrid(res)
    // colorCells(grid, res)
    // drawGrid(grid, res)
    drawContour(grid, res)
    
    ctx.strokeStyle = 'rgb(255,255,0)'
    ctx.lineWidth = 1
    circles.forEach(c => {
        // ctx.beginPath()
        // ctx.arc(c.x, c.y, c.radius, 0, 2*Math.PI)
        // ctx.stroke()

        c.move()
    })

    window.requestAnimationFrame(draw)
}

function resizeCanvas() {
    cv.width = window.innerWidth
    cv.height = window.innerHeight

    getGrid()
    draw()
}

const lerp = (x0, y0, x1, y1, x) => {
    if(x0 === x1)
        return null

    return ( (y0*(x1-x) + y1*(x-x0) ) / (x1 - x0) )
}

const randRange = (min, max) => {
    return Math.random() * (max - min) + min
}