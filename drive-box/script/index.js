function controller(playground) {
    const input = document.getElementById('controller');
    const inputVal = input.value.trim();
    if(!inputVal) return;

    const cmd = inputVal.split(/\s+/);
    switch(cmd[0].toUpperCase()) {
        case 'GO':
            playground.go(); break;
        case 'TUN':
            playground.turn(cmd[1]); break;
        case 'TRA':
            playground.transfer(cmd[1]); break;
        case 'MOV':
            playground.move(cmd[1]); break;
        default: alert('Invalid command');
    }
}

function startPlayground () {
    const point = document.getElementById("mount-point");
    const playground = new PlayGround(point, 10, 10);
    playground.x = Math.ceil(Math.random() * 10);
    playground.y = Math.ceil(Math.random() * 10);
    playground.turn('rig');
    playground.render();

    const execBtn = document.getElementById('execute');
    execBtn.addEventListener('click', function () {
        controller(playground);
    }, false);
}

window.onload = startPlayground;