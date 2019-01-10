import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    //key controllers
    const KEY_CODE_LEFT = 37;
    const KEY_CODE_RIGHT = 39;
    const KEY_CODE_SPACE = 32;

    //game window settings
    const GAME_WIDTH:number = 650;
    const GAME_HEIGHT:number = 600;

    //hero settings
    const hero_WIDTH = 50;
    const hero_MAX_SPEED = 450.0;
    const rocket_MAX_SPEED = 300.0;
    const rocket_COOLDOWN = 0.5;

    //enemies settings
    const ENEMIES_PER_ROW = 10;
    const ENEMY_HORIZONTAL_PADDING = 50;
    const ENEMY_VERTICAL_PADDING = 70;
    const ENEMY_VERTICAL_SPACING = 80;
    const ENEMY_COOLDOWN = 5.0;
    const ENEMY_POINTS = 20;

    const GAME_STATE = {
      lastTime: Date.now(),
      leftPressed: false,
      rightPressed: false,
      spacePressed: false,
      heroX: 0,
      heroY: 0,
      heroCooldown: 0,
      rockets: [],
      enemies: [],
      enemyRockets: [],
      gameOver: false
    };

    function collisionController(obj1, obj2) {
      return !(
        obj2.left > obj1.right ||
        obj2.right < obj1.left ||
        obj2.top > obj1.bottom ||
        obj2.bottom < obj1.top
      );
    }

    function setPosition(obj:HTMLElement, x:number, y:number) {
      obj.style.transform = `translate(${x}px, ${y}px)`
      
    }

    function clamp(v, min, max) {
      if (v < min) {
        return min;
      } else if (v > max) {
        return max;
      } else {
        return v;
      }
    }

    function rand(min, max) {
      if (min === undefined) min = 0;
      if (max === undefined) max = 1;
      return min + Math.random() * (max - min);
    }

    //Hero logic
    function createHero($container:HTMLElement) {
      GAME_STATE.heroX = GAME_WIDTH / 2;
      GAME_STATE.heroY = GAME_HEIGHT - 50;
      const $hero = document.createElement("img");
      $hero.src = "./Assets/Sprites/hero.png";
      $hero.className = "hero"
      $container.appendChild($hero);
      setPosition($hero, GAME_STATE.heroX, GAME_STATE.heroY)
    }


    function destroyHero($container:HTMLElement, hero) {

      $container.removeChild(hero);
      GAME_STATE.gameOver = true;
    }

    function updateHero(dt, $container:HTMLElement) {
      if (GAME_STATE.leftPressed) {
        GAME_STATE.heroX -= dt * hero_MAX_SPEED;
      }
      if (GAME_STATE.rightPressed) {
        GAME_STATE.heroX += dt * hero_MAX_SPEED;
      }

      GAME_STATE.heroX = clamp(
        GAME_STATE.heroX,
        hero_WIDTH,
        GAME_WIDTH - hero_WIDTH
      );

      if (GAME_STATE.spacePressed && GAME_STATE.heroCooldown <= 0) {
        createRocket($container, GAME_STATE.heroX, GAME_STATE.heroY);
        GAME_STATE.heroCooldown = rocket_COOLDOWN;
      }
      if (GAME_STATE.heroCooldown > 0) {
        GAME_STATE.heroCooldown -= dt;
      }

      const hero:HTMLElement = document.querySelector(".hero");
      setPosition(hero, GAME_STATE.heroX, GAME_STATE.heroY);
    }

    //Weapon logic
    function createRocket($container:HTMLElement, x, y) {
      const $element = document.createElement("img");
      $element.src = "./Assets/Sprites/rocket.png";
      $element.className = "rocket";
      $container.appendChild($element);
      const rocket = { 
        x,
        y,
        $element };
      GAME_STATE.rockets.push(rocket);
      setPosition($element, x, y);
    }

    function updateRockets(dt, $container:HTMLElement) {
      const rockets = GAME_STATE.rockets;
      for (let i = 0; i < rockets.length; i++) {
        const rocket = rockets[i];
        rocket.y -= dt * rocket_MAX_SPEED;
        if (rocket.y < 0) {
          destroyRocket($container, rocket);
        }
        setPosition(rocket.$element, rocket.x, rocket.y);
        const cm1 = rocket.$element.getBoundingClientRect();
        const enemies = GAME_STATE.enemies;
        for (let j = 0; j < enemies.length; j++) {
          const enemy = enemies[j];
          if (enemy.isDead) continue;
          const cm2 = enemy.$element.getBoundingClientRect();
          if (collisionController(cm1, cm2)) {
            //enemy was hit
            destroyEnemy($container, enemy);
            destroyRocket($container, rocket);
          }
        }
      }
      GAME_STATE.rockets = GAME_STATE.rockets.filter(e => !e.isDead);
    }

    function destroyRocket($container:HTMLElement, rocket) {
      $container.removeChild(rocket.$element);
      rocket.isDead = true;
    }

    //Enemy logic
    function createEnemy($container:HTMLElement, x, y) {
      const $element = document.createElement("img");
      $element.src = "./Assets/Sprites/alien1.png";
      $element.className = "enemy"
      $container.appendChild($element);
      const enemy = {
        x, y, cooldown: rand(0.5, ENEMY_COOLDOWN),
        $element
      };
      GAME_STATE.enemies.push(enemy);
      setPosition($element, x, y);
    }

    function updateEnemy(dt, $container:HTMLElement ) {

      //enemy round similar movment
      const dx = Math.sin(GAME_STATE.lastTime / 1000) * 30; // left-right movement
      const dy = Math.cos(GAME_STATE.lastTime / 1000) * 20; // up-down movement

      const enemies = GAME_STATE.enemies;
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const x = enemy.x + dx;
        const y = enemy.y + dy;
        setPosition(enemy.$element, x, y);
        enemy.cooldown -= dt;
        if (enemy.cooldown <= 0) {
          createEnemyRocket($container, x, y);
          enemy.cooldown = ENEMY_COOLDOWN;
        }
      }
      GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead);
    }

    function destroyEnemy($container:HTMLElement , enemy) {
      setScore(ENEMY_POINTS);
      $container.removeChild(enemy.$element);
      enemy.isDead = true;
    }

    //Enemy weapon logic
    function createEnemyRocket($container: HTMLElement , x, y) {
      const $element = document.createElement("img");
      $element.src = "./Assets/Sprites/enemyRocket.png";
      $element.className = "enemy-laser";
      $container.appendChild($element);
      const rocket = { x, y, $element };
      GAME_STATE.enemyRockets.push(rocket);
      setPosition($element, x, y);
    }

    function updateEnemyRockets(dt, $container:HTMLElement ) {
      const rockets = GAME_STATE.enemyRockets;
      for (let i = 0; i < rockets.length; i++) {
        const rocket = rockets[i];
        rocket.y += dt * rocket_MAX_SPEED;
        if (rocket.y > GAME_HEIGHT) {
          destroyRocket($container, rocket);
        }
        setPosition(rocket.$element, rocket.x, rocket.y);
        const cm1 = rocket.$element.getBoundingClientRect();
        const hero = document.querySelector(".hero");
        const cm2 = hero.getBoundingClientRect();
        if (collisionController(cm1, cm2)) {
          // Hero was hit
          destroyHero($container, hero);
          break;
        }
      }
      GAME_STATE.enemyRockets = GAME_STATE.enemyRockets.filter(e => !e.isDead);
    }

    //main game engine logic part
    function init() {
      const $container:HTMLElement  = document.querySelector(".game");
      createHero($container);

      const enemySpacing = (GAME_WIDTH - ENEMY_HORIZONTAL_PADDING * 1.2) / (ENEMIES_PER_ROW - 1);
      for (let j = 0; j < 3; j++) {
        const y = ENEMY_VERTICAL_PADDING + j * ENEMY_VERTICAL_SPACING;
        for (let i = 0; i < ENEMIES_PER_ROW; i++) {
          const x = i * enemySpacing + ENEMY_HORIZONTAL_PADDING;
          createEnemy($container, x, y);
        }
      }
    }

    function playerWon() {
      return GAME_STATE.enemies.length === 0;
    }

    function update(e) {
      const currTime = Date.now();
      const dt = (currTime - GAME_STATE.lastTime) / 1000.0;

      if (GAME_STATE.gameOver) {
        document.getElementById("game-over").setAttribute("style", "display: block;")
        return;
      }

      if (playerWon()) {
        document.getElementById("congratulations").setAttribute("style", "display: block;")
        return;
      }

      const $container:HTMLElement  = document.querySelector(".game");
      updateHero(dt, $container);
      updateRockets(dt, $container);
      updateEnemy(dt, $container);
      updateEnemyRockets(dt, $container);

      GAME_STATE.lastTime = currTime;
      window.requestAnimationFrame(update);
    }

    function setScore(score) {
      const $element = document.querySelector(".textNumber");
      var temp = parseInt($element.textContent) * 1;
      temp += score * 1;
      $element.innerHTML = temp.toString();
    }

    function onKeyDown(e) {
      if (e.keyCode === KEY_CODE_LEFT) {
        GAME_STATE.leftPressed = true;
      } else if (e.keyCode === KEY_CODE_RIGHT) {
        GAME_STATE.rightPressed = true;
      } else if (e.keyCode === KEY_CODE_SPACE) {
        GAME_STATE.spacePressed = true;
      }
    }

    function onKeyUp(e) {
      if (e.keyCode === KEY_CODE_LEFT) {
        GAME_STATE.leftPressed = false;
      } else if (e.keyCode === KEY_CODE_RIGHT) {
        GAME_STATE.rightPressed = false;
      } else if (e.keyCode === KEY_CODE_SPACE) {
        GAME_STATE.spacePressed = false;
      }
    }

    init();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.requestAnimationFrame(update);
  }



}
