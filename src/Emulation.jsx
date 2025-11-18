import { useEffect, useRef } from "react";
import styles from "./Emulation.module.css";

function Emulation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "blue";
    ctx.fillRect(50, 50, 100, 100);
  }, []);

  return <canvas className={styles.canvas} id="canvas" ref={canvasRef} />;
}

export default Emulation;
