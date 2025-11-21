import { useEffect, useRef } from "react";
import styles from "./Emulation.module.css";

import { Renderer } from "./engine/Renderer";

function Emulation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    new Renderer(canvas);
  });

  return <canvas className={styles.canvas} id="canvas" ref={canvasRef} />;
}

export default Emulation;
