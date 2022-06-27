
const dim = {
    x   : 0,
    y   : 1,
    num : 2
}
const dir = {
    up    : 0,
    down  : 1,
    left  : 2,
    right : 3
}
const terr = {
    grass: 0,
    path : 1,
    wall : 2
}

class Display {
    constructor(canvas) {
        this.canvas      = canvas
        this.context     = canvas.getContext("2d")
        this.interval    = setInterval(this.update.bind(this), 33)
        this.subscribers = []
        this.isPaused    = false
        this.refit()
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    refit() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }
    drawHUD() {

    }
    update() {
        if (this.isPaused) return
        this.clear()
        if (this.background) this.background.show(this)
        this.subscribers.forEach(obj => obj.show(this))
    }
}

class Entity {
    constructor(disp, src, x, y, w, h) {
        this.step       = 10
        this.img        = new Image()
        this.img.src    = src
        this.pos        = [x, y]
        this.vect       = [0, 0]
        this.width      = w
        this.height     = h
        this.img.onload = disp.update.bind(disp)
        this.interval   = setInterval((() => this.pos = this.next()).bind(this), 30)
    }
    next() {
        var result = []
        //sets relative position
        for (var i = 0; i < 2; i++) result[i] = this.step * this.vect[i]
        //slows diagonal movement
        if (result[dim.x] != 0 && result[dim.y] != 0) result = result.map(i => Math.round(i * .7071))
        //bounds
        result[dim.x] = Math.min(Math.max(this.pos[dim.x] + result[dim.x], 0), window.innerWidth - this.width)
        result[dim.y] = Math.min(Math.max(this.pos[dim.y] + result[dim.y], 0), window.innerHeight - this.height)
        return result
    }
    show(disp) {
        // disp.context.fillRect(this.pos[dim.x], this.pos[dim.y], this.width, this.height)
        disp.context.drawImage(this.img, this.pos[dim.x], this.pos[dim.y], this.width, this.height)
    }

}

class Terrain {
    constructor(disp, w, h) {
        this.grid   = Array(h).fill(Array(w).fill(terr.grass))
        this.width  = w
        this.height = h
        this.grass = new Image()
        this.grass.src = "images/grass 1.png"
        this.grass.onload = this.show.bind(this, disp)
    }
    show(disp) {
        for (var r = 0; r < this.height; r++) {
            for (var c = 0; c < this.width; c++) {
                var image
                switch (this.grid[r][c]){
                    case terr.grass: image = this.grass
                    break
                    case terr.path:
                    break
                }
                disp.context.drawImage(image, c * 100, r * 100, 100, 100)
            }
        }
    }
}

const disp = new Display(document.getElementById("game"))
var pc = new Entity(disp, "/images/hero.png", 500, 500, 100, 100)
disp.subscribers.push(pc)
disp.background = new Terrain(disp, 30, 30)


const isPressed = []
const codes = {
    "KeyW" : (flag) => {
        pc.vect[dim.y] += 1 - (flag << 1)
    },
    "KeyA" : (flag) => {
        pc.vect[dim.x] += 1 - (flag << 1)
    },
    "KeyS" : (flag) => {
        pc.vect[dim.y] += (flag << 1) - 1
    },
    "KeyD" : (flag) => {
        pc.vect[dim.x] += (flag << 1) - 1
    },
    "ShiftLeft" : (flag) => {
        pc.step = 10 + (5 * flag)
    }
}







document.addEventListener('keydown', (event) => {
    if (isPressed[event.code]) return
    console.log(`${event.code} is Pressed.`)
    try{
        isPressed[event.code] = true
        codes[event.code](1)
    } catch (e) {
    }
})
document.addEventListener('keyup', (event) => {
    try{
        isPressed[event.code] = false
        codes[event.code](0)
    } catch (e) {
    }
})
window.onresize = disp.refit.bind(disp)
