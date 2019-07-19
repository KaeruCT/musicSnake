function Particle(p) {
    p = p || {};
    this.x = p.x || 0;
    this.y = p.y || 0;
    this.r = p.r || 5;
    this.color = p.color;
    this.dx = p.dx || 0;
    this.dy = p.dy || 0;
    this.type = p.type;
    this.customUpdate = p.update || function () {};
}

Particle.prototype.update = function () {
    this.x += this.dx;
    this.y += this.dy;
    this.customUpdate();
}

function Color({h, s, l, a}) {
    this.l_dir = 0;
    this.h = h !== undefined ? h : 0;
    this.s = s !== undefined ? s : 100;
    this.l = l !== undefined ? l : 50;
    this.a = a || 1;

    this.get = () => `hsla(${this.h}, ${this.s}%, ${this.l}%, ${this.a})`;
}