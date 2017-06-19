// common functions
function validateInteger(silent, value, min, max) {
    let val = Number(value);
    if(!Number.isInteger(val)) {
        if(!silent) {
            throw new Error('Max axis input must be an integer');
        } else {
            val = 0;
        }
    }

    if(min !==undefined && val < min) {
        if(!silent) {
            throw new Error('input value must be greater than or equal to {$min}');
        } else {
            val = min;
        }
    }

    if(max !==undefined && val > max) {
        if(!silent) {
            throw new Error('input value must be less than or equal to {max}');
        } else {
            val = max;
        }
    }

    return val;
}

// get index of direction array
function validateDirection(val) {
    let index = 0;
    let dir = val.trim().toUpperCase();

    switch(dir) {
        case 'N':
        case 'North':
            index = 0; break;
        case 'E':
        case 'East':
            index = 1; break;
        case 'S':
        case 'South':
            index = 2; break;
        case 'W':
        case 'West':
            index = 3; break;
        default:
            throw new Error('Invalid direction');
    }
    return DIRECTION[index];
}

function createAxis(axis, length) {
    let ul = document.createElement('ul');
    if(axis === 'x') ul.className = 'x-axis';
    if(axis === 'y') ul.className = 'y-axis';

    let axisText = '';
    for(let i = 0; i < length; i++) {
        // let axisPoint = document.createElement('li');
        // axisPoint.innerText = i + 1;
        // ul.appendChild(axisPoint);
        axisText += '<li>' + (i + 1) + '</li>';
    }
    ul.innerHTML = axisText;
    return ul;
}

// -----------------------------------------------------------

// direction description
const DIRECTION = ['N', 'E', 'S', 'W'];
const ANGLE = ['0deg', '90deg', '180deg', '-90deg'];
const _ = new WeakMap();

class PlayGround {
    constructor(point, xMax = 10, yMax = 10) {
        if(!point || !(point instanceof Element))
            throw new Error('point is invalid');

        const data = {
            xMax: validateInteger(false, xMax, 1),
            yMax: validateInteger(false, yMax, 1),
            point: point,
            box: null,
            isRender: false,
            x: 0,
            y: 0,
            direction: 'N',
        };

        const updateX = () => {data.box.style.left = (this.x * 50) + 'px';}
        const updateY = () => {data.box.style.top = (this.y * 50) + 'px';}
        const updateDirection = () => {
            let index = DIRECTION.indexOf(this.direction);
            data.box.style.transform = `rotate(${ANGLE[index]})`;
        }
        const updateAll = () => {
            updateX();
            updateY();
            updateDirection();
        }


        // public properties
        Object.defineProperties(this, {
            xMax: {get() {return data.xMax;}},
            yMax: {get() {return data.yMax;}},
            point: {get() {return data.point;}},
            isRender: {get() {return data.isRender;}},
            x: {
                set(xval) {
                    data.x = validateInteger(true, xval, 0, data.xMax - 1);
                    if(this.isRender) {
                        updateX();
                    }
                },
                get() {return data.x;},
            },
            y: {
                set(yval) {
                    data.y = validateInteger(true, yval, 0, data.yMax - 1);
                    if(this.isRender) {
                        updateY();
                    }
                },
                get() {return data.y;},
            },
            direction: {
                set(direct) {
                    data.direction = validateDirection(direct);
                    if(this.isRender) {
                        updateDirection();
                    }
                },
                get() {return data.direction;},
            },
            rotate: {
                set(rotate) {
                    data.rotate = rotate;
                    if(this.isRender) {
                        updateMoveState();
                    }
                },
                get() {return data.rotate},
            }
        });

        _.set(this, {
            data,
            updateX,
            updateY,
            updateDirection,
            updateAll,
        });
    }

    render() {
        if(this.isRender) return;

        let rootDiv = document.createElement('div');
        rootDiv.className = 'drive-box';

        let xAxis = createAxis('x', this.xMax);
        let yAxis = createAxis('y', this.yMax);

        let playgroundDiv = document.createElement('div');
        playgroundDiv.className = 'playground';
        playgroundDiv.style.width = (this.xMax * 50 - 2) + 'px';
        playgroundDiv.style.height = (this.yMax * 50 - 2) + 'px';

        let boxDiv = document.createElement('div');
        boxDiv.className = 'box';

        playgroundDiv.appendChild(boxDiv);
        rootDiv.appendChild(xAxis);
        rootDiv.appendChild(yAxis);
        rootDiv.appendChild(playgroundDiv);

        _.get(this).data.box = boxDiv;
        _.get(this).updateAll();

        this.point.innerHTML='';
        this.point.appendChild(rootDiv);

        _.get(this).data.isRender = true;

    }

    go() {
        switch(this.direction) {
            case 'N':
                this.y--; break;
            case 'E':
                this.x++; break;
            case 'S':
                this.y++; break;
            case 'W':
                this.x--; break;
            default:
                throw new Error("go with error direction"); break;
        }
    }

    turn(dir) {
        const lastIndex = DIRECTION.indexOf(this.direction);
        const len = DIRECTION.length;

        let change = 0;
        switch(dir.trim().toUpperCase()) {
            case 'LEF':
                change = -1; break;
            case 'RIG':
                change = 1; break;
            case 'BAC':
                change = 2; break;
            default:
                throw new Error('Invalid turn command.'); break;
        }
        let newIndex = lastIndex + change;
        if(newIndex >= len) newIndex -= len;
        if(newIndex < 0) newIndex += len;

        this.direction = DIRECTION[newIndex];
    }

    transfer(direction) {
        let direct = direction.trim().toUpperCase();
        if(!direct) return;

        switch(direct) {
            case 'L':
            case 'LEF':
                this.x--; break;
            case 'R':
            case 'RIG':
                this.x++; break;
            case 'T':
            case 'TOP':
                this.y--; break;
            case 'B':
            case 'BOT':
                this.y++; break;
            default:
                throw new Error('travel direction input error');
        }
    }

    move(direction) {
        let direct = direction.trim().toUpperCase();
        if(!direct) return;

        let diff = 0;
        switch(direct) {
            case 'L':
            case 'LEF':
                this.direction = 'W';
                this.x--; break;
            case 'R':
            case 'RIG':
                this.direction = 'E';
                this.x++; break;
            case 'T':
            case 'TOP':
                this.direction = 'N';
                this.y--; break;
            case 'B':
            case 'BOT':
                this.direction = 'S';
                this.y++; break;
            default:
                throw new Error('move direction input error');
        }
    }
}