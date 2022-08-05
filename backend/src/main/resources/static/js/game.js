
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

/*
 TODO 
 - add username hovering above character
 - add environment interaction
*/

class GameController {
    constructor() {
        this.loaded  = 0
        this.display = new Display(document.getElementById("game"))
        this.map     = new Map("/images/untitled.png")
        this.pc      = new Entity(0, 0, 56, 56, this.load.bind(this))
        this.pc.animation.addSpriteSheet("/images/char_red_1.png", [6, 8, 8, 16, 4, 12, 8, 3, 3, 10], 8)
        this.pc.animation.addSpriteSheet("/images/char_red_2.png", [12, 8, 10], 8)
        this.pc.animation.setRepeat(true, 0, 2)
    }
    start() {
        //Interval at which the update displays (frame rate is 30 fps)
        this.dispInterval = setInterval(this.update.bind(this), 33)
        //Interval at which image animations advance
        this.animInterval = setInterval(this.pc.animation.advance.bind(this.pc.animation), 66)
        //Interval at which positions change (decoupled from frame rate)
        this.moveInterval = setInterval(this.pc.step.bind(this.pc), 33)
    }
    update() {
        this.display.clear() // Clears old visuals
        this.display.center(this.pc.pos) // Centers screen at new player position
        this.display.show(this.map) // Draws the map first
        this.display.show(this.pc) // Draws the player next
    }
    load() {
        if (++this.loaded < 1) return
        this.start()
        if (this.onload) this.onload()
    }
}

class Display {
    constructor(canvas) {
        this.canvas  = canvas
        this.context = canvas.getContext("2d")
        this.pos     = [0, 0]
        this.fit()
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    fit() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }
    center(pos) {
        this.pos[dim.x] = pos[dim.x] - (this.canvas.width >> 1)
        this.pos[dim.y] = pos[dim.y] - (this.canvas.height >> 1)
    }
    drawHUD() {

    }
    /**
     * *NOTE obj must implement 'getShowParams'
     * @param {*} obj 
     */
    show(obj) {
        this.context.save()
        if (obj.modifyContext) obj.modifyContext(this)
        var params = obj.getShowParams()
        var base = 1
        if (params.length > 5) base = 5
        params[base] -= this.pos[dim.x]
        params[base + 1] -= this.pos[dim.y]
        this.context.drawImage(...params)
        this.context.restore()
    }
}

class SpriteSheet {
    constructor(src, info, wrap, width, height, onload = () => {}) {
        this.onload       = onload
        this.image        = new Image()
        this.image.onload = this.load.bind(this, info, wrap, width, height)
        this.image.src    = src
    }
    getNumStates() {
        if (!this.frameLoc) return
        return this.frameLoc.length
    }
    load(info, wrap, width, height) {
        //initializes frameLoc
        this.frameLoc = []
        var verticalPos = 0
        for (var state = 0; state < info.length; state++) {
            this.frameLoc[state] = []
            for (var frame = 0; frame < info[state]; frame++) {
                if (frame != 0 && frame % wrap == 0) verticalPos += height
                this.frameLoc[state][frame] = [(frame % wrap) * width, verticalPos]
            }
            verticalPos += height
        }
        if (this.onload) this.onload()
    }
}

class AnimationManager {
    constructor(width, height, onload = () => {}, update = () => {}) {
        this.sheets = []
        this.repeat = []
        this.loc    = [0, 2]
        this.loaded = 0
        this.width  = width
        this.height = height
        this.frame  = 0
        this.state  = 0
        this.onload = onload
        this.update = update
    }
    getSourceParams() {
        var tmp = this.state
        var i = 0
        for (; i < this.sheets.length && tmp >= this.sheets[i].getNumStates(); i++) {
            tmp -= this.sheets[i].getNumStates()
        }
        return [
            this.sheets[i].image,
            this.sheets[i].frameLoc[tmp][this.frame][dim.x],
            this.sheets[i].frameLoc[tmp][this.frame][dim.y] + 2,
            this.width,
            this.height
        ]
    }
    addSpriteSheet(src, info, wrap) {
        this.sheets.push(new SpriteSheet(src, info, wrap, this.width, this.height, this.load.bind(this)))
    }
    setRepeat(val, ...states) {
        states.forEach(((v) => {this.repeat[v] = val}).bind(this))
    }
    setState(state) {
        this.state = state
        this.frame = 0
    }
    advance() {
        var i = 0
        for (var r = this.state; i < this.sheets.length && r >= this.sheets[i].getNumStates(); i++) {
            r -= this.sheets[i].getNumStates()
        }
        if (++this.frame >= this.sheets[i].frameLoc[this.state].length) {
            this.frame = 0
            if (!this.repeat[this.state]) {
                this.state = 0
                this.update()
            }
        }
        this.loc = this.sheets[i].frameLoc[this.state][this.frame]
    }
    load() {
        if (++this.loaded < this.sheets.length) return
        //precompute data
        if (this.onload) this.onload()
    }
}

class Entity {
    constructor(x, y, width, height, onload = () => {}) {
        this.isFacing    = dir.right
        this.isSprinting = false
        this.onload      = onload
        this.speed       = 10
        this.pos         = [x, y]
        this.vect        = [0, 0]
        this.animation   = new AnimationManager(width, height, this.load.bind(this), this.updateState.bind(this))
        this.width       = width << 1
        this.height      = height << 1
    }
    attack() {
        if (this.animation.state == 0 || this.animation.state == 2) this.animation.setState(1)
    }
    jump() {
        if (this.animation.state == 3) return
        this.setSpeed(this.speed + 4)
        this.next = [this.speed * this.vect[dim.x], this.speed * this.vect[dim.y]]
        this.animation.setState(3)
    }
    /**
     * Modifies display context
     * @param {*} disp the display to modify
     * @returns 
     */
    modifyContext(disp) {
        if (this.isFacing == dir.right) return
        // if (this.vect[dim.x] >= 0) return
        disp.context.translate(disp.canvas.width + this.width, 0)
        disp.context.scale(-1, 1)
    }
    addForce(x, y) {
        this.vect = [this.vect[dim.x] + x, this.vect[dim.y] + y]
        if (this.vect[dim.x] > 0) this.isFacing = dir.right
        if (this.vect[dim.x] < 0) this.isFacing = dir.left
        this.updateState()
    }
    setSpeed(speed) {
        this.speed = speed
    }
    updateState() {
        if (this.animation.state == 1 || this.animation.state == 3) return
        this.setSpeed(10 + 7 * this.isSprinting)
        for (var i = 0; i < dim.num; i++) if (this.vect[i] != 0 ) return this.animation.setState(2)
        this.animation.setState(0)
    }
    step() {
        if (this.animation.state == 1) return
        if (this.animation.state != 3) this.next = [this.speed * this.vect[dim.x], this.speed * this.vect[dim.y]]
        var mult = 0.7071
        for (var i = 0; i < dim.num; i++) if (this.next[i] == 0) mult = 1
        for (var i = 0; i < dim.num; i++) this.pos[i] += mult * this.next[i]
    }
    getShowParams() {
        return [
            ...this.animation.getSourceParams(),
            this.pos[dim.x],
            this.pos[dim.y],
            this.width,
            this.height
        ]
    }
    load() {
        // this.moveInterval  = setInterval(this.takeStep.bind(this), 30)
        // // TODO goes out of sync when user inputs. Try delaying user input to sync
        // this.frameInterval = setInterval(this.animation.advance.bind(this.animation), 132)
        if (this.onload) this.onload()
    }
}

class Map {
    constructor(src, x = 0, y = 0) {
        this.pos = [x, y]
        this.image = new Image()
        this.image.onload = this.load.bind(this)
        this.image.src = src
    }
    getShowParams() {
        return [
            this.image,
            this.pos[dim.x],
            this.pos[dim.y],
            this.image.width,
            this.image.height
        ]
    }
    load() {
        this.width = this.image.width
        this.height = this.image.height
    }
}

class InputManager {
    constructor() {
        this.isPressed = []
        this.schemes   = []
        this.currScheme = 'field'
    }
    addControlScheme(id, scheme) {
        this.schemes[id] = scheme
    }
    keyup(key_code) {
        this.isPressed[key_code] = false
        this.schemes[this.currScheme][key_code](0)
    }
    keydown(key_code) {
        if (this.isPressed[key_code]) return
        console.log(`${key_code} is Pressed.`)
        try{
            this.isPressed[key_code] = true
            this.schemes[this.currScheme][key_code](1)
        } catch (e) {}
    }
}
 
const controller = new GameController()
window.onresize = controller.display.fit.bind(controller.display)

controller.in_manager = new InputManager()
controller.in_manager.addControlScheme('field', {
    "KeyW" : ((flag) => {
        controller.pc.addForce(0, 1 - 2 * flag)
    }),
    "KeyA" : (flag) => {
        controller.pc.addForce(1 - 2 * flag, 0)
    },
    "KeyS" : (flag) => {
        controller.pc.addForce(0, 2 * flag - 1)
    },
    "KeyD" : (flag) => {
        controller.pc.addForce(2 * flag - 1, 0)

    },
    "ShiftLeft" : (flag) => {
        controller.pc.isSprinting = flag
        controller.pc.updateState()
    },
    "KeyV" : (flag) => {
        if (flag == 1) controller.pc.attack()
    },
    "Space" : (flag) => {
        if (flag == 1) controller.pc.jump()
    }
})
document.addEventListener('keydown', (e) => {
    controller.in_manager.keydown(e.code)
})
document.addEventListener('keyup', (e) => {
    controller.in_manager.keyup(e.code)
})

