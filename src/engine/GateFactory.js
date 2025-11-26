export class GateFactory {
  constructor() {
    this.gateWidth = 60;
    this.pinRadius = 5;
    this.pinMargin = 6;
    this.defaultColor = "#BF124D";
    this.defaultStrokeColor = "black";
  }

  createGate(
    ctx,
    name,
    x,
    y,
    ins,
    outs,
    color = this.defaultColor,
    strokeColor = this.defaultStrokeColor
  ) {
    const pinSpacing = this.pinRadius * 3 + 4;
    const height =
      Math.max(ins.length, outs.length) * pinSpacing + 2 * this.pinMargin;

    const x0 = x - this.gateWidth / 2;
    const y0 = y - height / 2;

    ctx.save();

    // Pins
    ctx.fillStyle = color;
    if (ins && ins.length) {
      for (let i = 0; i < ins.length; i++) {
        const py =
          y0 +
          this.pinMargin +
          (i + 1) * ((height - 2 * this.pinMargin) / (ins.length + 1));
        ctx.beginPath();
        ctx.arc(x0, py, this.pinRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    if (outs && outs.length) {
      for (let i = 0; i < outs.length; i++) {
        const py =
          y0 +
          this.pinMargin +
          (i + 1) * ((height - 2 * this.pinMargin) / (outs.length + 1));
        ctx.beginPath();
        ctx.arc(x0 + this.gateWidth, py, this.pinRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Base
    ctx.fillStyle = color;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.fillRect(x0, y0, this.gateWidth, height);
    ctx.strokeRect(x0, y0, this.gateWidth, height);

    // Label (centered)
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, x, y);

    ctx.restore();

    return { x: x0, y: y0, width: this.gateWidth, height };
  }
}
