<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { specialPrimes } from '../../data/specialPrimes'

// --- 型定義 ---
interface Star {
  num: number
  x: number
  y: number
  // 特殊な性質
  isTwin: boolean
  isEmirp: boolean
  isPalindromic: boolean
  isIrregular: boolean
  // アニメーション用プロパティ
  baseSize: number
  currentSize: number
  baseBrightness: number
  currentBrightness: number
  twinkleSpeed: number
  twinklePhase: number // 星の瞬きの初期位相
  irregularPhase: number // 非正則素数エフェクトの初期位相
  emirpPhase: number // Emirpエフェクトの初期位相
  satelliteAngle: number // 回文素数の衛星角度
}

interface ProgressionHighlight {
  points: { x: number; y: number }[]
  segments: { from: { x: number; y: number }; to: { x: number; y: number } }[]
  life: number
  length?: number // 等差数列の長さ
}

// --- リアクティブ変数 ---
const canvas = ref<HTMLCanvasElement | null>(null)
const showOnlyBackground = ref(false)
const rocketLaunch = ref(false)
const shootingStar = ref<{
  x: number
  y: number
  angle: number
  speed: number
  life: number
} | null>(null)

// REST API(展望台)クリック時の処理
const showOnlyBackgroundView = () => {
  showOnlyBackground.value = true
  setTimeout(() => {
    showOnlyBackground.value = false
  }, 8000) // 8秒後に元に戻る
}

// 流れ星を作成する関数
const createShootingStar = () => {
  if (shootingStar.value && shootingStar.value.life > 0) return

  // 画面の左上1/4あたりから始まるようにする
  const startX = Math.random() * (window.innerWidth * 0.5)
  const startY = Math.random() * (window.innerHeight * 0.3)

  // 右下方向に流れる（角度は右下45度±15度程度）
  const angle = Math.PI / 4 + (Math.random() * 0.3 - 0.15)
  const speed = 5 + Math.random() * 10 // 速さはランダム

  shootingStar.value = {
    x: startX,
    y: startY,
    angle,
    speed,
    life: 1.0,
  }

  console.log('[流れ星] 発生', shootingStar.value)
}

// Express.js(ロケット)クリック時の処理
const launchRocket = () => {
  rocketLaunch.value = true
  setTimeout(() => {
    rocketLaunch.value = false
  }, 6000) // 6秒後に元に戻る
}

// 親コンポーネントに公開するメソッド
defineExpose({
  showOnlyBackgroundView,
  launchRocket,
})

onMounted(() => {
  const ctx = canvas.value?.getContext('2d')
  if (!canvas.value || !ctx) return

  let width = (canvas.value.width = window.innerWidth)
  let height = (canvas.value.height = window.innerHeight)
  let animationFrameId: number

  // --- データ準拠 ---
  const MAX_NUMBER = 5000
  const allPrimes = new Set<number>()
  const arithmeticProgressions: number[][] = []
  const stars: Star[] = []

  const twinPrimesSet = new Set(specialPrimes.twin_primes)
  const emirpsSet = new Set(specialPrimes.emirps)
  const palindromicPrimesSet = new Set(specialPrimes.palindromic_primes)
  const irregularPrimesSet = new Set(specialPrimes.irregular_primes)

  // --- 初期化処理 ---
  const initialize = () => {
    generatePrimes(MAX_NUMBER)
    findProgressions()
    calculateLayout()
  }

  const generatePrimes = (max: number) => {
    const isPrime = Array.from({ length: max + 1 }).fill(true)
    isPrime[0] = isPrime[1] = false
    for (let p = 2; p * p <= max; p++) {
      if (isPrime[p]) {
        for (let i = p * p; i <= max; i += p) isPrime[i] = false
      }
    }
    for (let i = 2; i <= max; i++) {
      if (isPrime[i]) allPrimes.add(i)
    }
  }

  const findProgressions = () => {
    const primeList = Array.from(allPrimes)
    for (let i = 0; i < primeList.length; i++) {
      for (let j = i + 1; j < primeList.length; j++) {
        const p1 = primeList[i]
        const p2 = primeList[j]
        const diff = p2 - p1
        if (diff === 0 || diff > 500) continue
        const progression = [p1, p2]
        let next = p2 + diff
        if (allPrimes.has(next)) {
          progression.push(next)
          next += diff
          while (next <= MAX_NUMBER && allPrimes.has(next)) {
            progression.push(next)
            next += diff
          }
          // より長い等差数列も表示するために上限を10に引き上げる
          if (progression.length >= 4 && progression.length <= 20) {
            arithmeticProgressions.push(progression)
          }
        }
      }
    }
  }

  let COLS = 80
  let CELL_SIZE = width / COLS

  const calculateLayout = () => {
    width = canvas.value!.width = window.innerWidth
    height = canvas.value!.height = window.innerHeight
    CELL_SIZE = Math.max(Math.floor(width / 100), 10)
    COLS = Math.floor(width / CELL_SIZE)

    stars.length = 0
    const ROWS = Math.ceil(MAX_NUMBER / COLS)
    const GRID_WIDTH = COLS * CELL_SIZE
    const GRID_HEIGHT = ROWS * CELL_SIZE
    const offsetX = (width - GRID_WIDTH) / 2
    const offsetY = (height - GRID_HEIGHT) / 2

    allPrimes.forEach((p) => {
      const col = (p - 1) % COLS
      const row = Math.floor((p - 1) / COLS)
      const isTwin = twinPrimesSet.has(p)
      const baseSize = isTwin ? 1.8 : Math.random() * 1 + 0.8
      const baseBrightness = isTwin ? 0.7 : Math.random() * 0.4 + 0.3

      stars.push({
        num: p,
        x: offsetX + col * CELL_SIZE + CELL_SIZE / 2,
        y: offsetY + row * CELL_SIZE + CELL_SIZE / 2,
        isTwin,
        isEmirp: emirpsSet.has(p),
        isPalindromic: palindromicPrimesSet.has(p),
        isIrregular: irregularPrimesSet.has(p),
        baseSize,
        currentSize: baseSize,
        baseBrightness,
        currentBrightness: baseBrightness,
        // アニメーション間隔を2~3倍長くするためにtwinkleSpeedを小さくする
        twinkleSpeed: Math.random() * 0.0015 + 0.0001, // 約2.5倍遅く
        // 各アニメーション効果ごとに独立した初期位相を設定
        twinklePhase: Math.random() * Math.PI * 2,
        irregularPhase: Math.random() * Math.PI * 2,
        emirpPhase: Math.random() * Math.PI * 2,
        satelliteAngle: Math.random() * Math.PI * 2,
      })
    })
  }

  let currentProgression: ProgressionHighlight | null = null

  const highlightRandomProgression = () => {
    if (currentProgression && currentProgression.life > 0) return
    const progression =
      arithmeticProgressions[
        Math.floor(Math.random() * arithmeticProgressions.length)
      ]

    // 等差数列を必ずconsoleに出力（デバッグ・記録用）
    console.log('[素数の等差数列]', {
      progression,
      length: progression.length,
      差: progression.length > 1 ? progression[1] - progression[0] : null,
    })

    const points = progression
      .map((num) => stars.find((s) => s.num === num))
      .filter((p) => p !== undefined) as Star[]
    if (points.length !== progression.length) return

    const gridWidth = COLS * CELL_SIZE
    const gridOffsetX = (width - gridWidth) / 2
    let wrapCount = 0
    const unwrappedPoints = points.map((p, i) => {
      if (i > 0 && p.x < points[i - 1].x) wrapCount++
      return { x: p.x + wrapCount * gridWidth, y: p.y }
    })
    const first = unwrappedPoints[0]
    const last = unwrappedPoints[unwrappedPoints.length - 1]
    const masterSlope = (last.y - first.y) / (last.x - first.x)
    const segments: {
      from: { x: number; y: number }
      to: { x: number; y: number }
    }[] = []
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      if (p2.x < p1.x) {
        const yAtRightEdge =
          p1.y + masterSlope * (gridOffsetX + gridWidth - p1.x)
        segments.push({
          from: p1,
          to: { x: gridOffsetX + gridWidth, y: yAtRightEdge },
        })
        const yAtLeftEdge = p2.y - masterSlope * (p2.x - gridOffsetX)
        segments.push({ from: { x: gridOffsetX, y: yAtLeftEdge }, to: p2 })
      } else {
        segments.push({ from: p1, to: p2 })
      }
    }
    currentProgression = {
      points,
      segments,
      life: 1.0,
      length: progression.length,
    }
  }

  // --- 描画処理 ---
  const draw = () => {
    ctx.clearRect(0, 0, width, height)
    const time = Date.now()

    // 流れ星の描画
    if (shootingStar.value && shootingStar.value.life > 0) {
      const { x, y, angle, speed, life } = shootingStar.value

      // 流れ星の軌跡
      ctx.beginPath()
      ctx.moveTo(x, y)
      const tailLength = speed * 10 * life
      ctx.lineTo(
        x - Math.cos(angle) * tailLength,
        y - Math.sin(angle) * tailLength,
      )

      const gradient = ctx.createLinearGradient(
        x,
        y,
        x - Math.cos(angle) * tailLength,
        y - Math.sin(angle) * tailLength,
      )
      gradient.addColorStop(0, `rgba(255, 255, 255, ${life * 0.8})`)
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.stroke()

      // 流れ星の頭
      ctx.beginPath()
      ctx.fillStyle = `rgba(255, 255, 255, ${life})`
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fill()

      // 位置の更新
      shootingStar.value.x += Math.cos(angle) * speed
      shootingStar.value.y += Math.sin(angle) * speed
      shootingStar.value.life -= 0.01

      // 画面外に出たら消す
      if (x > width + 100 || y > height + 100 || x < -100 || y < -100) {
        shootingStar.value.life = 0
      }
    }

    stars.forEach((star) => {
      // 基本の瞬き - 位相を考慮してよりまばらな瞬きに
      star.currentBrightness =
        star.baseBrightness +
        Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.2
      star.currentSize =
        star.baseSize +
        Math.sin(time * star.twinkleSpeed * 1.5 + star.twinklePhase) * 0.3

      ctx.beginPath()
      ctx.fillStyle = `rgba(255, 255, 255, ${star.currentBrightness})`

      // --- 特殊効果の加算 ---
      if (star.isIrregular) {
        // 各星の独自位相を使用
        ctx.shadowColor = `rgba(100, 150, 255, ${0.5 + Math.sin(time * 0.0005 + star.irregularPhase) * 0.3})`
        ctx.shadowBlur = 5
      }

      ctx.arc(star.x, star.y, star.currentSize, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0 // グロー効果をリセット

      if (star.isEmirp && Math.sin(time * 0.0008 + star.emirpPhase) > 0.98) {
        // Emirpには十字の閃光効果を付ける（星ごとに独自の位相を使用）
        const flareLife =
          (Math.sin(time * 0.0008 + star.emirpPhase) - 0.98) / 0.02
        ctx.strokeStyle = `rgba(255, 255, 200, ${flareLife * 0.8})`
        ctx.lineWidth = 1.5
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 2) * i
          ctx.beginPath()
          ctx.moveTo(star.x, star.y)
          ctx.lineTo(
            star.x + Math.cos(angle) * 10,
            star.y + Math.sin(angle) * 10,
          )
          ctx.stroke()
        }
      }
      if (star.isPalindromic) {
        // 回文素数には衛星を周回させる
        star.satelliteAngle = star.satelliteAngle || Math.random() * Math.PI * 2 // 初期角度がなければランダム設定
        star.satelliteAngle += 0.02
        const satX =
          star.x + Math.cos(star.satelliteAngle) * (star.currentSize + 4)
        const satY =
          star.y + Math.sin(star.satelliteAngle) * (star.currentSize + 4)
        ctx.beginPath()
        ctx.fillStyle = `rgba(200, 200, 255, ${star.currentBrightness * 0.8})`
        ctx.arc(satX, satY, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // 等差数列のハイライト
    if (currentProgression && currentProgression.life > 0) {
      const { points, segments, life, length } = currentProgression
      const progressionLength = length || 4 // デフォルトは4
      const lengthFactor = (progressionLength - 4) / 6 // 4-10の範囲で0-1に正規化

      // アニメーション効果を強化 - 長さに応じて演出を強化
      const startupEffect = 1 - Math.min(1, Math.max(0, life - 0.8) * 5) // 開始時のみのエフェクト(0.8-1.0の間でフェードイン)

      // 長さに応じたエフェクト倍率: 長いほど強化
      const lengthMultiplier =
        progressionLength >= 8 ? 1.5 : progressionLength >= 6 ? 1.2 : 1.0
      const sizeBoost =
        startupEffect * (1.0 + lengthFactor * 0.8) * lengthMultiplier // 長いほど大きい初期効果

      // 線の太さ: 長さに応じて調整、さらに出現時に太くなる
      ctx.lineWidth =
        (1.5 + lengthFactor * 3.0) * (1.0 + sizeBoost * 0.6) * lengthMultiplier

      // 色と透明度: 長さに応じて色が変化、長いほど赤みを増す
      const baseHue = 45 // 黄色 (253, 203, 110) の色相に近い
      // 長さに応じた色の調整: 4-5は黄色、6-7はオレンジ、8以上は赤
      const targetHue =
        progressionLength >= 8 ? 0 : progressionLength >= 6 ? 30 : 45
      const currentHue = baseHue - lengthFactor * (baseHue - targetHue)
      const saturation = 100
      const lightness = 60 - lengthFactor * 10 // 長いほど少し暗めに
      const alpha = life * (0.8 + lengthFactor * 0.2) // 長いほど初期透明度を高く

      ctx.strokeStyle = `hsla(${currentHue}, ${saturation}%, ${lightness}%, ${alpha})`

      segments.forEach((seg) => {
        ctx.beginPath()
        ctx.moveTo(seg.from.x, seg.from.y)
        ctx.lineTo(seg.to.x, seg.to.y)
        ctx.stroke()
      })

      // 点の描画
      points.forEach((p) => {
        ctx.beginPath()
        // 点のサイズも調整、さらに出現時に大きくなる
        const pointSize = (3.5 + lengthFactor * 2.0) * (1.0 + sizeBoost * 0.7)
        ctx.arc(p.x, p.y, pointSize, 0, Math.PI * 2)

        // 長い等差数列の点は明るくする
        const pointLightness = lightness + lengthFactor * 15
        ctx.fillStyle = `hsla(${currentHue}, ${saturation}%, ${pointLightness}%, ${life})`

        // 影のぼかし具合: 長さに応じて12から30まで変化、出現時はさらに大きく
        ctx.shadowColor = `hsla(${currentHue}, ${saturation}%, ${lightness + 10}%, ${life * 0.6})`
        ctx.shadowBlur = (12 + lengthFactor * 18) * (1.0 + sizeBoost * 0.5)

        // 長い等差数列ほど強い光彩効果
        if (progressionLength >= 6) {
          ctx.shadowColor = `hsla(${currentHue}, ${saturation}%, ${lightness + 20}%, ${life * 0.8})`
          ctx.shadowBlur *= 1.2
          // 2重光彩で特別感を出す
          ctx.fill()
          ctx.shadowColor = `hsla(${currentHue - 15}, ${saturation}%, ${lightness + 30}%, ${life * 0.5})`
          ctx.shadowBlur *= 0.7
        }

        ctx.fill()
      })
      ctx.shadowBlur = 0
      // 長い等差数列ほど、表示時間を長くする
      // 長さに応じたフェード速度の調整: 長いほど遅く消える
      const baseFadeSpeed = 0.008
      const fadeSpeed = baseFadeSpeed - lengthFactor * 0.005 * lengthMultiplier
      currentProgression.life -= fadeSpeed
    }
  }

  // --- メインループ ---
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    draw()
  }

  // --- イベントリスナー ---
  const handleResize = () => calculateLayout()
  window.addEventListener('resize', handleResize)
  const progressionInterval = setInterval(highlightRandomProgression, 10000) // 10秒に1回

  // 流れ星のタイマー処理 - 平均45秒に1回くらいの確率で発生
  const shootingStarInterval = setInterval(() => {
    // 約8%の確率で流れ星発生
    if (Math.random() < 0.08) {
      createShootingStar()
    }
  }, 3500)

  // --- 実行 ---
  initialize()
  animate()

  onUnmounted(() => {
    cancelAnimationFrame(animationFrameId)
    clearInterval(progressionInterval)
    clearInterval(shootingStarInterval)
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<template>
  <canvas ref="canvas" class="background-animation" />
  <div v-if="showOnlyBackground" class="background-overlay">
    <!-- 星空観測モードはテキスト表示なしのシンプル表示に -->
  </div>
  <div v-if="rocketLaunch" class="rocket-animation">
    <div class="rocket">🚀</div>
    <div class="rocket-trail" />
  </div>
</template>

<style scoped>
.background-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-color: #0f172a;
}

/* 背景のみ表示モードはApp.vueで対応 */
.background-overlay {
  display: none; /* 使用しなくなったので非表示に */
}

/* ロケットアニメーション */
.rocket-animation {
  position: fixed;
  bottom: -50px;
  left: 50%;
  z-index: 101;
  height: 100vh;
  width: 10px;
  animation: fadeOut 6s ease-in-out forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.rocket {
  position: absolute;
  bottom: 0;
  left: -15px;
  font-size: 3rem;
  animation: rocketLaunch 6s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
}

@keyframes rocketLaunch {
  0% {
    transform: translate(0, 0) rotate(0);
    opacity: 1;
  }
  10% {
    transform: translate(20vw, -10vh) rotate(15deg);
  }
  30% {
    transform: translate(40vw, -40vh) rotate(35deg);
  }
  60% {
    transform: translate(60vw, -70vh) rotate(45deg);
  }
  100% {
    transform: translate(80vw, -120vh) rotate(55deg);
    opacity: 0;
  }
}

.rocket-trail {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 2px;
  height: 0;
  background: linear-gradient(to top, transparent, rgba(255, 255, 255, 0.7));
  animation: trailGrow 5s ease-out forwards;
  transform-origin: bottom left;
  transform: rotate(45deg); /* ロケットの軌道を右斜め上に */
}

@keyframes trailGrow {
  0% {
    height: 0;
    opacity: 0;
  }
  5% {
    /* ロケットが先に動き始めるように遅延 */
    height: 0;
    opacity: 0;
  }
  15% {
    /* ロケットが通過したところから徐々に表示 */
    height: 10vh;
    opacity: 0.7;
  }
  40% {
    height: 40vh;
    opacity: 0.9;
  }
  70% {
    height: 70vh;
    opacity: 0.7;
  }
  100% {
    height: 100vh;
    opacity: 0;
  }
}
</style>
