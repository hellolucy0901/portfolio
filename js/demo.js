(() => {
  "use strict";

  // 이 값들만 바꾸면 움직임과 재질을 조절할 수 있습니다.
  const SETTINGS = {
    shake: 1.0,       // 좌우 떨림: 0 = 없음, 1 = 기본, 1.5 = 강하게
    surface: 0.045,   // 표면 굴곡: 권장 0.02 ~ 0.07
    speed: 0.55,      // 액체 표면이 흐르는 속도
    gloss: 1.0,       // 반사광 강도: 권장 0.6 ~ 1.3
    cycle: 5.8,       // 강한 떨림 사이의 간격(초)
    pixelRatio: 1.5   // 렌더링 해상도 상한
  };

  const root = document.querySelector("#liquid-egg");
  if (!root) return;

  const canvas = root.querySelector("canvas");
  const status = root.querySelector(".egg-status");

  const reduceMotion = matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true
  });

  if (!gl) {
    status.textContent =
      "3D 표현을 사용할 수 없어 정지 형태를 표시합니다.";
    return;
  }

  // ─────────────────────────────
  // 1. 타원형의 형태와 표면 변형
  // ─────────────────────────────

  const vertexSource = `
    precision highp float;

    attribute vec3 aPosition;

    uniform float uTime;
    uniform float uSurface;
    uniform float uRock;
    uniform float uBreath;
    uniform float uAspect;
    uniform float uView;
    uniform float uFloor;

    varying vec3 vNormal;
    varying vec3 vWorld;

    vec3 rotateZ(vec3 p, float a) {
      float c = cos(a);
      float s = sin(a);

      return vec3(
        c * p.x - s * p.y,
        s * p.x + c * p.y,
        p.z
      );
    }

    // 넓은 파동 + 작은 파동으로 말랑한 표면을 만듭니다.
    vec3 egg(vec3 n) {
      float t = uTime;

      vec3 q = n * 3.1;

      q += 0.48 * sin(
        q.yzx * 1.7 + vec3(t, -t * 0.7, t * 0.6)
      );

      float wave =
        sin(q.x + t * 0.8) *
        sin(q.y - t * 0.6) *
        sin(q.z + t * 0.5);

      wave +=
        0.28 *
        sin(2.7 * q.x + t) *
        sin(2.3 * q.z - t * 0.7) *
        sin(2.1 * q.y + t * 0.4);

      // 바닥 근처는 변형을 줄여 접지감을 유지합니다.
      float mask = smoothstep(-0.98, -0.45, n.y);

      float radius = 1.0 + uSurface * wave * mask;

      // 위쪽이 살짝 좁은 타원형
      float taper = 0.94 - 0.075 * n.y;

      vec3 p = vec3(
        n.x * taper,
        n.y * 1.28,
        n.z * taper * 0.94
      ) * radius;

      // 아주 미세한 수축과 팽창
      p.xz *= 1.0 - uBreath * 0.5;
      p.y += (n.y + 1.0) * uBreath;

      return p;
    }

    void main() {
      vec3 p;

      if (uFloor > 0.5) {
        p = aPosition;
        vNormal = vec3(0.0, 1.0, 0.0);
      } else {
        vec3 n = normalize(aPosition);

        vec3 axis = abs(n.y) > 0.95
          ? vec3(1, 0, 0)
          : vec3(0, 1, 0);

        vec3 tangent = normalize(cross(axis, n));
        vec3 bitangent = cross(n, tangent);

        float e = 0.003;

        p = egg(n);

        // 변형된 표면의 방향을 다시 계산합니다.
        vec3 dx =
          egg(normalize(n + tangent * e)) -
          egg(normalize(n - tangent * e));

        vec3 dy =
          egg(normalize(n + bitangent * e)) -
          egg(normalize(n - bitangent * e));

        vNormal = rotateZ(
          normalize(cross(dx, dy)),
          uRock
        );

        // 바닥 접점을 중심으로 흔들립니다.
        p.y += 1.28;
        p = rotateZ(p, uRock);
        p.y -= 1.28;
      }

      vWorld = p;

      // 카메라가 약간 위에서 바라보는 각도
      float c = cos(0.14);
      float s = sin(0.14);

      vec3 view = vec3(
        p.x,
        c * p.y - s * p.z,
        s * p.y + c * p.z
      );

      gl_Position = vec4(
        view.x / (uView * uAspect),
        (view.y - 0.10) / uView,
        -view.z / 8.0,
        1.0
      );
    }
  `;

  // ─────────────────────────────
  // 2. 깊은 검정색, 반사광, 그림자
  // ─────────────────────────────

  const fragmentSource = `
    precision highp float;

    uniform float uFloor;
    uniform float uGloss;

    varying vec3 vNormal;
    varying vec3 vWorld;

    // 표면에 비칠 가상 스튜디오 조명
    float softbox(
      vec3 r,
      vec3 direction,
      vec2 size,
      float blur
    ) {
      vec3 forward = normalize(direction);

      vec3 right = normalize(
        cross(vec3(0, 1, 0), forward)
      );

      vec3 up = cross(forward, right);

      float facing = dot(r, forward);

      vec2 uv = vec2(
        dot(r, right),
        dot(r, up)
      ) / max(facing, 0.001);

      vec2 d = abs(uv) - size;
      float edge = max(d.x, d.y);

      return (
        1.0 - smoothstep(-blur, blur, edge)
      ) * step(0.0, facing);
    }

    vec3 studio(vec3 r) {
      vec3 light = vec3(0.016, 0.018, 0.022);

      // 왼쪽의 넓고 긴 반사광
      light += vec3(7.0, 6.8, 6.5) * softbox(
        r,
        vec3(-0.85, 0.65, 1.0),
        vec2(0.24, 0.68),
        0.13
      );

      // 오른쪽의 좁은 반사광
      light += vec3(3.8, 4.1, 4.5) * softbox(
        r,
        vec3(1.0, 0.15, 0.45),
        vec2(0.12, 0.62),
        0.09
      );

      // 위쪽의 가느다란 반사광
      light += vec3(5.0) * softbox(
        r,
        vec3(0.1, 1.0, 0.1),
        vec2(0.65, 0.10),
        0.09
      );

      // 형태가 완전히 검게 묻히지 않도록 약한 보조광
      light += vec3(0.16) * softbox(
        r,
        vec3(0.0, 0.2, 1.0),
        vec2(0.8, 0.5),
        0.5
      );

      return light;
    }

    void main() {
      if (uFloor > 0.5) {
        vec2 p = vWorld.xz;

        float broad = exp(
          -dot(
            p / vec2(0.90, 0.65),
            p / vec2(0.90, 0.65)
          ) * 2.0
        );

        float contact = exp(
          -dot(
            p / vec2(0.32, 0.24),
            p / vec2(0.32, 0.24)
          ) * 2.0
        );

        float alpha = broad * 0.22 + contact * 0.32;

        gl_FragColor = vec4(
          vec3(0.12, 0.105, 0.09) * alpha,
          alpha
        );

        return;
      }

      vec3 n = normalize(vNormal);

      vec3 eye = normalize(
        vec3(0.0, sin(0.14), cos(0.14))
      );

      vec3 reflected = reflect(-eye, n);

      // 가장자리로 갈수록 반사가 강해지는 효과
      float fresnel =
        0.055 +
        0.945 * pow(
          1.0 - max(dot(n, eye), 0.0),
          5.0
        );

      float diffuse = max(
        dot(n, normalize(vec3(-0.6, 1.0, 0.8))),
        0.0
      );

      // 깊은 블랙의 기본 색상
      vec3 color =
        vec3(0.0016, 0.0019, 0.0024) *
        (0.4 + diffuse);

      color += studio(reflected) * fresnel * uGloss;

      // 과도한 흰색을 압축합니다.
      color = clamp(
        (color * (2.51 * color + 0.03)) /
        (color * (2.43 * color + 0.59) + 0.14),
        0.0,
        1.0
      );

      // 화면용 색상으로 변환
      color = pow(color, vec3(1.0 / 2.2));

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // ─────────────────────────────
  // 3. WebGL 초기화
  // ─────────────────────────────

  function compile(type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message);
    }

    return shader;
  }

  let program;

  try {
    program = gl.createProgram();

    const vs = compile(gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }
  } catch (error) {
    console.error(error);

    status.textContent =
      "3D 표현을 사용할 수 없어 정지 형태를 표시합니다.";

    return;
  }

  gl.useProgram(program);

  const attribute = gl.getAttribLocation(
    program,
    "aPosition"
  );

  const uniforms = {};

  for (const name of [
    "Time",
    "Surface",
    "Rock",
    "Breath",
    "Aspect",
    "View",
    "Floor",
    "Gloss"
  ]) {
    uniforms[name] = gl.getUniformLocation(
      program,
      `u${name}`
    );
  }

  const set = (name, value) => {
    gl.uniform1f(uniforms[name], value);
  };

  function mesh(vertices, indices) {
    const vertex = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex);

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      gl.STATIC_DRAW
    );

    const index = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);

    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );

    return {
      vertex,
      index,
      count: indices.length
    };
  }

  // ─────────────────────────────
  // 4. 구체와 바닥 생성
  // ─────────────────────────────

  const vertices = [];
  const indices = [];

  const columns = 128;
  const rows = 96;

  for (let y = 0; y <= rows; y++) {
    const theta = y / rows * Math.PI;

    for (let x = 0; x <= columns; x++) {
      const phi = x / columns * Math.PI * 2;

      vertices.push(
        Math.sin(theta) * Math.cos(phi),
        Math.cos(theta),
        Math.sin(theta) * Math.sin(phi)
      );

      if (y < rows && x < columns) {
        const a = y * (columns + 1) + x;
        const b = a + columns + 1;

        indices.push(
          a, b, a + 1,
          b, b + 1, a + 1
        );
      }
    }
  }

  const eggMesh = mesh(vertices, indices);

  const floorMesh = mesh(
    [
      -3, -1.285, -3,
       3, -1.285, -3,
       3, -1.285,  3,
      -3, -1.285,  3
    ],
    [0, 1, 2, 0, 2, 3]
  );

  function drawMesh(object) {
    gl.bindBuffer(gl.ARRAY_BUFFER, object.vertex);

    gl.vertexAttribPointer(
      attribute,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.enableVertexAttribArray(attribute);

    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      object.index
    );

    gl.drawElements(
      gl.TRIANGLES,
      object.count,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);

  gl.blendFunc(
    gl.ONE,
    gl.ONE_MINUS_SRC_ALPHA
  );

  gl.clearColor(0, 0, 0, 0);

  // ─────────────────────────────
  // 5. 제자리 진동 애니메이션
  // ─────────────────────────────

  let time = 0;
  let last = 0;
  let frame = 0;

  let paused = reduceMotion.matches;
  let visible = true;
  let lost = false;

  function render() {
    gl.clear(
      gl.COLOR_BUFFER_BIT |
      gl.DEPTH_BUFFER_BIT
    );

    const phase =
      time % Math.max(SETTINGS.cycle, 2.5);

    // 주기마다 두 번 짧게 떨리고 다시 잔잔해집니다.
    const pulse =
      Math.exp(-(((phase - 1.25) / 0.22) ** 2)) +
      0.68 * Math.exp(-(((phase - 1.72) / 0.18) ** 2));

    const rock = SETTINGS.shake * (
      0.006 * Math.sin(time * 1.4) +
      0.026 * pulse * Math.sin(time * 36)
    );

    const breath =
      0.0035 * Math.sin(time * 1.3) +
      0.006 * pulse;

    set("Time", time * SETTINGS.speed);
    set("Surface", SETTINGS.surface);
    set("Rock", rock);
    set("Breath", breath);
    set("Gloss", SETTINGS.gloss);

    // 먼저 바닥 그림자를 그립니다.
    set("Floor", 1);
    gl.depthMask(false);
    drawMesh(floorMesh);

    // 그 위에 타원형을 그립니다.
    gl.depthMask(true);
    set("Floor", 0);
    drawMesh(eggMesh);
  }

  function tick(now) {
    frame = 0;

    if (
      paused ||
      !visible ||
      document.hidden ||
      lost
    ) {
      return;
    }

    if (last) {
      time += Math.min(
        (now - last) / 1000,
        0.05
      );
    }

    last = now;

    render();

    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);

    frame = 0;
    last = 0;



    if (!lost) {
      render();
    }

    if (
      !paused &&
      visible &&
      !document.hidden &&
      !lost
    ) {
      frame = requestAnimationFrame(tick);
    }
  }

  // ─────────────────────────────
  // 6. 반응형 크기와 재생 제어
  // ─────────────────────────────

  function resize() {
    const {
      width,
      height
    } = root.getBoundingClientRect();

    if (!width || !height || lost) return;

    const dpr = Math.min(
      devicePixelRatio || 1,
      SETTINGS.pixelRatio
    );

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    gl.viewport(
      0,
      0,
      canvas.width,
      canvas.height
    );

    set("Aspect", width / height);

    set(
      "View",
      Math.max(1.90, 1.30 / (width / height))
    );

    render();
  }

 

  reduceMotion.addEventListener("change", event => {
    paused = event.matches;
    sync();
  });

  document.addEventListener(
    "visibilitychange",
    sync
  );

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(root);

  new ResizeObserver(resize).observe(root);

  canvas.addEventListener(
    "webglcontextlost",
    event => {
      event.preventDefault();

      lost = true;

      cancelAnimationFrame(frame);

      root.classList.remove("is-ready");

      status.textContent =
        "3D 표현이 중단되었습니다. 새로고침해 다시 실행할 수 있습니다.";
    }
  );

  resize();

  root.classList.add("is-ready");
  button.hidden = false;

  sync();
})();