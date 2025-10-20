export class StartScreen {
    constructor() {
        this.screen = document.createElement("div");
        Object.assign(this.screen.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            fontFamily: "Arial, sans-serif",
            zIndex: "1000"
        });

        const titleText = document.createElement("div");
        Object.assign(titleText.style, {
            fontSize: "8vw",
            fontWeight: "bold",
            color: "#FFD700",
            textShadow: "0.4vw 0.4vw 0.8vw rgba(0,0,0,0.9)",
            marginBottom: "3vh"
        });
        titleText.textContent = "SUBWAY SURFERS";
        this.screen.appendChild(titleText);

        const controlsContainer = document.createElement("div");
        Object.assign(controlsContainer.style, {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5vh",
            marginBottom: "4vh",
            padding: "3vh"
        });

        const color = "#00D9FF";

        const createKey = (key, icon, action) => {
            const keyCard = document.createElement("div");
            Object.assign(keyCard.style, {
                background: "linear-gradient(135deg, rgba(0,217,255,0.15), rgba(0,217,255,0.05))",
                backdropFilter: "blur(10px)",
                border: `0.15vw solid ${color}`,
                borderRadius: "1.2vw",
                padding: "1.5vh 2vw",
                display: "flex",
                alignItems: "center",
                gap: "1.5vw",
                boxShadow: `0 0.5vh 2vh ${color}40, inset 0 0 1vh rgba(0,217,255,0.1)`,
                minWidth: "22vw"
            });

            const keyBox = document.createElement("div");
            Object.assign(keyBox.style, {
                fontSize: "2.5vw",
                fontWeight: "bold",
                color: color,
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: "0.8vh 1.5vw",
                borderRadius: "0.8vw",
                border: `0.1vw solid ${color}`,
                boxShadow: `0 0 1.2vw ${color}80`,
                minWidth: "5vw",
                textAlign: "center"
            });
            keyBox.textContent = key;

            const iconBox = document.createElement("div");
            Object.assign(iconBox.style, {
                fontSize: "2vw",
                color: color,
                textShadow: `0 0 1vw ${color}`,
                minWidth: "3vw",
                textAlign: "center"
            });
            iconBox.textContent = icon;

            const actionText = document.createElement("div");
            Object.assign(actionText.style, {
                fontSize: "1.8vw",
                fontWeight: "bold",
                color: "white",
                textShadow: "0.15vw 0.15vw 0.5vw rgba(0,0,0,0.8)",
                letterSpacing: "0.1vw",
                flex: "1"
            });
            actionText.textContent = action;

            keyCard.appendChild(keyBox);
            keyCard.appendChild(iconBox);
            keyCard.appendChild(actionText);
            return keyCard;
        };

        const topRow = document.createElement("div");
        Object.assign(topRow.style, {
            display: "flex",
            justifyContent: "center"
        });
        topRow.appendChild(createKey("W", "↑", "SALTAR"));
        controlsContainer.appendChild(topRow);

        const bottomRow = document.createElement("div");
        Object.assign(bottomRow.style, {
            display: "flex",
            gap: "1.5vw"
        });
        bottomRow.appendChild(createKey("A", "←", "IZQUIERDA"));
        bottomRow.appendChild(createKey("S", "↓", "RODAR"));
        bottomRow.appendChild(createKey("D", "→", "DERECHA"));
        controlsContainer.appendChild(bottomRow);

        this.screen.appendChild(controlsContainer);

        const startInstruction = document.createElement("div");
        Object.assign(startInstruction.style, {
            fontSize: "3.5vw",
            fontWeight: "bold",
            color: "white",
            textShadow: "0.25vw 0.25vw 0.75vw rgba(0,0,0,0.9), 0 0 1.5vw #FFD700",
            animation: "pulse 2s infinite",
            marginTop: "1vh",
            padding: "1.5vh 3vw",
            background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.1))",
            borderRadius: "1.2vw",
            border: "0.15vw solid #FFD700"
        });
        startInstruction.textContent = "PRESIONA ESPACIO PARA JUGAR";
        this.screen.appendChild(startInstruction);

        if (!document.getElementById('pulse-animation')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation';
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(this.screen);
    }

    hide() {
        this.screen.style.display = "none";
    }

    show() {
        this.screen.style.display = "flex";
    }

    destroy() {
        if (this.screen && this.screen.parentNode) {
            this.screen.parentNode.removeChild(this.screen);
        }
    }
}

export class GameScreen {
    constructor() {
        this.distance = 0;
        this.lastTime = performance.now();
        this.frames = 0;
        this.fps = 0;

        this.screen = document.createElement("div");
        Object.assign(this.screen.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            color: "white",
            fontFamily: "Arial, sans-serif",
            pointerEvents: "none",
            zIndex: "1000"
        });

        this.distanceEl = document.createElement("div");
        Object.assign(this.distanceEl.style, {
            position: "absolute",
            top: "3vh",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "4vw",
            fontWeight: "bold",
            textShadow: "0.25vw 0.25vw 0.5vw rgba(0,0,0,0.9)"
        });
        this.distanceEl.textContent = "0 m";
        this.screen.appendChild(this.distanceEl);

        this.fpsEl = document.createElement("div");
        Object.assign(this.fpsEl.style, {
            position: "absolute",
            top: "3vh",
            right: "3vw",
            fontSize: "3vw",
            fontWeight: "bold",
            textShadow: "0.25vw 0.25vw 0.5vw rgba(0,0,0,0.9)"
        });
        this.fpsEl.textContent = "FPS: 0";
        this.screen.appendChild(this.fpsEl);

        document.body.appendChild(this.screen);
    }

    update(delta, speed) {
        this.distance += delta * speed;
        this.distanceEl.textContent = `${Math.floor(this.distance)} m`;

        this.frames++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastTime = now;
            this.fpsEl.textContent = `FPS: ${this.fps}`;
        }
    }

    getDistance() {
        return Math.floor(this.distance);
    }

    reset() {
        this.distance = 0;
        this.distanceEl.textContent = "0 m";
    }

    hide() {
        this.screen.style.display = "none";
    }

    show() {
        this.screen.style.display = "block";
    }

    destroy() {
        if (this.screen && this.screen.parentNode) {
            this.screen.parentNode.removeChild(this.screen);
        }
    }
}

export class GameOverScreen {
    constructor(onRestart) {
        this.onRestart = onRestart;

        this.screen = document.createElement("div");
        Object.assign(this.screen.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            display: "none",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            fontFamily: "Arial, sans-serif",
            zIndex: "1001"
        });

        const gameOverText = document.createElement("div");
        Object.assign(gameOverText.style, {
            fontSize: "9vw",
            color: "red",
            fontWeight: "bold",
            textShadow: "0.4vw 0.4vw 0.8vw rgba(0,0,0,0.9)",
            marginBottom: "3vh"
        });
        gameOverText.textContent = "GAME OVER";
        this.screen.appendChild(gameOverText);

        this.finalDistanceEl = document.createElement("div");
        Object.assign(this.finalDistanceEl.style, {
            fontSize: "5vw",
            color: "white",
            fontWeight: "bold",
            textShadow: "0.3vw 0.3vw 0.6vw rgba(0,0,0,0.9)",
            marginBottom: "3vh"
        });
        this.screen.appendChild(this.finalDistanceEl);

        this.restartBtn = document.createElement("button");
        this.restartBtn.textContent = "Reiniciar";
        Object.assign(this.restartBtn.style, {
            fontSize: "3.5vw",
            padding: "1.5vh 4vw",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "1.2vw",
            fontWeight: "bold",
            boxShadow: "0 0.4vh 0.8vh rgba(0,0,0,0.5)",
            pointerEvents: "auto"
        });
        this.restartBtn.addEventListener("click", () => {
            if (this.onRestart) this.onRestart();
        });
        this.restartBtn.addEventListener("mouseenter", () => {
            this.restartBtn.style.backgroundColor = "#45a049";
        });
        this.restartBtn.addEventListener("mouseleave", () => {
            this.restartBtn.style.backgroundColor = "#4CAF50";
        });
        this.screen.appendChild(this.restartBtn);

        document.body.appendChild(this.screen);
    }

    show(distance) {
        this.finalDistanceEl.textContent = `Distancia final: ${distance} m`;
        this.screen.style.display = "flex";
    }

    hide() {
        this.screen.style.display = "none";
    }

    destroy() {
        if (this.screen && this.screen.parentNode) {
            this.screen.parentNode.removeChild(this.screen);
        }
    }
}

export class HUDManager {
    constructor() {
        this.startScreen = new StartScreen();
        this.gameScreen = null;
        this.gameOverScreen = null;
    }

    showStart() {
        if (this.gameScreen) this.gameScreen.hide();
        if (this.gameOverScreen) this.gameOverScreen.hide();
        this.startScreen.show();
    }

    startGame() {
        this.startScreen.hide();
        if (!this.gameScreen) {
            this.gameScreen = new GameScreen();
        } else {
            this.gameScreen.reset();
            this.gameScreen.show();
        }
    }

    update(delta, speed) {
        if (this.gameScreen) {
            this.gameScreen.update(delta, speed);
        }
    }

    showGameOver(onRestart) {
        if (this.gameScreen) this.gameScreen.hide();
        
        const distance = this.gameScreen ? this.gameScreen.getDistance() : 0;
        
        if (!this.gameOverScreen) {
            this.gameOverScreen = new GameOverScreen(onRestart);
        }
        this.gameOverScreen.show(distance);
    }

    destroyAll() {
        if (this.startScreen) this.startScreen.destroy();
        if (this.gameScreen) this.gameScreen.destroy();
        if (this.gameOverScreen) this.gameOverScreen.destroy();
    }
}