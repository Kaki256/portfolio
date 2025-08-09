<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 天候状態: 'sunny', 'cloudy', 'rainy', 'stormy'
const weatherState = ref('sunny')
const showRainbow = ref(false)
const draggableClouds = ref<HTMLElement[]>([])
const draggableSun = ref<HTMLElement | null>(null)
// ドラッグ管理のための変数
let activeCloud: HTMLElement | null = null
let activeSun: HTMLElement | null = null
let isCloudBeingDragged = false // クラウドのドラッグ状態
let isSunBeingDragged = false // 太陽のドラッグ状態
let offsetX = 0
let offsetY = 0

// シェイク検出用の一時状態（曇天での左右振り判定）
let lastDragLeft = 0
let lastDir = 0 // -1/0/1
let shakeScore = 0
let lastShakeTs = 0

// 虹を表示する関数
const makeRainbow = () => {
  showRainbow.value = true
  setTimeout(() => {
    showRainbow.value = false
  }, 5000) // 5秒後に消える
}

// スナップ: 太陽の下の所定位置に吸着
const trySnapUnderSun = (cloud: HTMLElement) => {
  if (!draggableSun.value) return false
  const sunRect = draggableSun.value.getBoundingClientRect()
  const cloudRect = cloud.getBoundingClientRect()

  // 太陽直下（太陽の中心の少し下）をターゲット
  const targetLeft = sunRect.left + sunRect.width / 2 - cloudRect.width / 2
  const targetTop = sunRect.top + sunRect.height * 0.6 // 少し下

  // 現在位置
  const currentLeft = parseInt(cloud.style.left) || cloudRect.left
  const currentTop = parseInt(cloud.style.top) || cloudRect.top

  const dx = currentLeft - targetLeft
  const dy = currentTop - targetTop
  const dist = Math.hypot(dx, dy)

  // しきい値（吸着半径）
  const SNAP_THRESHOLD = Math.max(80, Math.min(window.innerWidth, window.innerHeight) * 0.08)

  if (dist < SNAP_THRESHOLD) {
    cloud.style.transition = 'left 0.2s ease, top 0.2s ease'
    cloud.style.left = `${targetLeft}px`
    cloud.style.top = `${targetTop}px`
    setTimeout(() => {
      cloud.style.transition = ''
    }, 250)
    // 曇天にする
    setCloudyWeather()
    return true
  }
  return false
}

// クラウドドラッグのイベントハンドラ - 完全に再実装
const startCloudDrag = (event: MouseEvent) => {
  const cloud = event.currentTarget as HTMLElement
  cloud.classList.add('dragging')
  cloud.style.cursor = 'grabbing'
  cloud.style.zIndex = '15'
  
  // アニメーションを一時停止
  if (weatherState.value === 'sunny') {
    cloud.style.animationPlayState = 'paused'
  }
  
  // 要素の現在位置を取得 (スタイルから数値を抽出)
  const currentLeft = parseInt(cloud.style.left) || 0
  const currentTop = parseInt(cloud.style.top) || 0
  
  // クリック位置を取得
  const mouseX = event.clientX
  const mouseY = event.clientY
  
  // マウス位置と要素の現在位置からオフセットを計算
  offsetX = mouseX - currentLeft
  offsetY = mouseY - currentTop
  
  activeCloud = cloud
  isCloudBeingDragged = true
  
  // デバッグ情報を出力
  console.log('クラウドドラッグ開始:', {
    cloud: cloud.className,
    clientX: event.clientX,
    clientY: event.clientY,
    elementCurrentLeft: parseInt(cloud.style.left) || 0,
    elementCurrentTop: parseInt(cloud.style.top) || 0,
    offsetX,
    offsetY
  })
  
  // イベントの伝播を停止して、setupCloudDraggingのリスナーとの競合を避ける
  event.stopPropagation()
  event.preventDefault()
}

const startCloudTouch = (event: TouchEvent) => {
  if (event.touches.length !== 1) return
  
  const touch = event.touches[0]
  const cloud = event.currentTarget as HTMLElement
  cloud.classList.add('dragging')
  cloud.style.cursor = 'grabbing'
  cloud.style.zIndex = '15'
  
  // アニメーションを一時停止
  if (weatherState.value === 'sunny') {
    cloud.style.animationPlayState = 'paused'
  }
  
  // 要素の現在位置を取得 (スタイルから数値を抽出)
  const currentLeft = parseInt(cloud.style.left) || 0
  const currentTop = parseInt(cloud.style.top) || 0
  
  // タッチ位置を取得
  const touchX = touch.clientX
  const touchY = touch.clientY
  
  // タッチ位置と要素の現在位置からオフセットを計算
  offsetX = touchX - currentLeft
  offsetY = touchY - currentTop
  
  activeCloud = cloud
  isCloudBeingDragged = true
  
  // デバッグ情報を出力
  console.log('クラウドタッチドラッグ開始:', {
    cloud: cloud.className,
    clientX: touch.clientX,
    clientY: touch.clientY,
    elementCurrentLeft: parseInt(cloud.style.left) || 0,
    elementCurrentTop: parseInt(cloud.style.top) || 0,
    offsetX,
    offsetY
  })
  
  // イベントの伝播を停止とデフォルト動作を防止
  event.stopPropagation()
  event.preventDefault()
}
// 太陽のドラッグ機能は無効化
// 必要に応じて実装するコードは以下を参考に
/*
const startSunDrag = (event: MouseEvent) => {
  if (!draggableSun.value) return
  
  draggableSun.value.classList.add('dragging')
  draggableSun.value.style.cursor = 'grabbing'
  draggableSun.value.style.zIndex = '5'
  
  activeSun = draggableSun.value
  isSunBeingDragged = true
  offsetX = event.clientX - draggableSun.value.getBoundingClientRect().left
  offsetY = event.clientY - draggableSun.value.getBoundingClientRect().top
}

const startSunTouch = (event: TouchEvent) => {
  if (!draggableSun.value || event.touches.length !== 1) return
  
  const touch = event.touches[0]
  draggableSun.value.classList.add('dragging')
  draggableSun.value.style.zIndex = '5'
  
  activeSun = draggableSun.value
  isSunBeingDragged = true
  offsetX = touch.clientX - draggableSun.value.getBoundingClientRect().left
  offsetY = touch.clientY - draggableSun.value.getBoundingClientRect().top
}
*/

  // クラウドのドラッグ機能の初期化
const setupCloudDragging = () => {
  draggableClouds.value.forEach((cloud) => {
    // 必要なスタイルの初期設定
    cloud.style.cursor = 'grab'
    cloud.style.position = 'absolute' // 位置指定が確実に反映されるよう設定
    cloud.style.zIndex = '10'
    cloud.style.pointerEvents = 'auto' // クリックイベントを確実に受け取るように
    // アニメーションとの親和性を高めるための設定
    cloud.style.transformOrigin = 'center center'
  })
}// 太陽のドラッグ機能は無効化
// 必要に応じて実装するコードは以下を参考に
/*
const enableSunDragging = () => {
  if (!draggableSun.value) return
  
  let sunIsDragging = false
  let sunOffsetX = 0
  let sunOffsetY = 0

  // マウスとタッチの両方でドラッグを開始
  const startDrag = (clientX: number, clientY: number) => {
    sunIsDragging = true
    isSunBeingDragged = true
    sunOffsetX = clientX - draggableSun.value!.getBoundingClientRect().left
    sunOffsetY = clientY - draggableSun.value!.getBoundingClientRect().top
    draggableSun.value!.style.cursor = 'grabbing'
    draggableSun.value!.style.zIndex = '5'
  }

  // ドラッグ中の移動処理
  const moveDrag = (clientX: number, clientY: number) => {
    if (!sunIsDragging) return
    const left = clientX - sunOffsetX
    const top = clientY - sunOffsetY
    draggableSun.value!.style.left = `${left}px`
    draggableSun.value!.style.top = `${top}px`
    
    if (weatherState.value === 'rainy' || weatherState.value === 'stormy') {
      if (Math.random() > 0.7) {
        makeRainbow()
      }
    }
  }

  // ドラッグ終了処理
  const endDrag = () => {
    if (sunIsDragging) {
      sunIsDragging = false
      isSunBeingDragged = false
      draggableSun.value!.style.cursor = 'grab'
      draggableSun.value!.style.zIndex = '2'
    }
  }

  // マウスイベント
  draggableSun.value.addEventListener('mousedown', (e) => {
    const mouseEvent = e as MouseEvent
    startDrag(mouseEvent.clientX, mouseEvent.clientY)
  })

  window.addEventListener('mousemove', (e) => {
    const mouseEvent = e as MouseEvent
    moveDrag(mouseEvent.clientX, mouseEvent.clientY)
  })

  window.addEventListener('mouseup', endDrag)

  // タッチイベント
  draggableSun.value.addEventListener('touchstart', (e) => {
    const touchEvent = e as TouchEvent
    if (touchEvent.touches.length === 1) {
      const touch = touchEvent.touches[0]
      startDrag(touch.clientX, touch.clientY)
      // タッチ開始時のデフォルト動作を防止（スクロールなど）
      e.preventDefault()
    }
  }, { passive: false })

  window.addEventListener('touchmove', (e) => {
    const touchEvent = e as TouchEvent
    if (touchEvent.touches.length === 1 && sunIsDragging) {
      const touch = touchEvent.touches[0]
      moveDrag(touch.clientX, touch.clientY)
      // ドラッグ中のデフォルト動作を防止（スクロールなど）
      e.preventDefault()
    }
  }, { passive: false })

  window.addEventListener('touchend', endDrag)
  window.addEventListener('touchcancel', endDrag)
}
*/

// ランダム雲の設定
const applyRandomCloudStyle = (cloud: HTMLElement) => {
  // ランダムな大きさ
  const w = Math.round(90 + Math.random() * 120) // 90-210px
  const h = Math.round(w * (0.28 + Math.random() * 0.18)) // 高さは幅に応じて
  cloud.style.width = `${w}px`
  cloud.style.height = `${h}px`

  // 雲のかたち（擬似要素）
  const beforeSize = Math.round(h * (1.2 + Math.random() * 0.6))
  const afterSize = Math.round(h * (1.5 + Math.random() * 0.8))
  const beforeTop = -Math.round(beforeSize * (0.45 + Math.random() * 0.25))
  const afterTop = -Math.round(afterSize * (0.45 + Math.random() * 0.25))
  const beforeLeft = Math.round(w * (0.15 + Math.random() * 0.25))
  const afterRight = Math.round(w * (0.08 + Math.random() * 0.2))

  cloud.style.setProperty('--before-w', `${beforeSize}px`)
  cloud.style.setProperty('--before-h', `${beforeSize}px`)
  cloud.style.setProperty('--before-top', `${beforeTop}px`)
  cloud.style.setProperty('--before-left', `${beforeLeft}px`)

  cloud.style.setProperty('--after-w', `${afterSize}px`)
  cloud.style.setProperty('--after-h', `${afterSize}px`)
  cloud.style.setProperty('--after-top', `${afterTop}px`)
  cloud.style.setProperty('--after-right', `${afterRight}px`)

  // 透明度
  cloud.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2)

  // アニメーション速度と遅延
  const duration = Math.round(55 + Math.random() * 55) // 55-110s
  const delay = Math.round(Math.random() * 10) // 0-10s
  cloud.style.animationDuration = `${duration}s`
  cloud.style.animationDelay = `${delay}s`
}

// 天気の切り替え
const setSunnyWeather = () => {
  weatherState.value = 'sunny'
  stopRain()
  stopStorm()
}

const setCloudyWeather = () => {
  weatherState.value = 'cloudy'
  stopRain()
  stopStorm()
}

const startRain = () => {
  if (weatherState.value === 'rainy' || weatherState.value === 'stormy') return
  weatherState.value = 'rainy'
  createRainDrops()
}

const startStorm = () => {
  if (weatherState.value === 'stormy') return
  weatherState.value = 'stormy'
  startRain()
  createLightning()
}

const stopRain = () => {
  const raindrops = document.querySelectorAll('.raindrop')
  raindrops.forEach((drop) => drop.remove())
}

const stopStorm = () => {
  const lightning = document.querySelectorAll('.lightning')
  lightning.forEach((flash) => flash.remove())
}

// 太陽が雲に覆われているかチェック
const isSunCovered = () => {
  if (!draggableSun.value) return false
  const sunRect = draggableSun.value.getBoundingClientRect()
  const sunCenter = {
    x: sunRect.left + sunRect.width / 2,
    y: sunRect.top + sunRect.height / 2,
  }

  for (const cloud of draggableClouds.value) {
    const cloudRect = cloud.getBoundingClientRect()
    if (
      sunCenter.x > cloudRect.left &&
      sunCenter.x < cloudRect.right &&
      sunCenter.y > cloudRect.top &&
      sunCenter.y < cloudRect.bottom
    ) {
      return true
    }
  }
  return false
}

// 太陽が雲の前に出ているかチェック機能は不要なので削除

// 雲を揺らす効果
const shakeCloud = (cloud: HTMLElement) => {
  cloud.classList.add('shaking')
  setTimeout(() => {
    cloud.classList.remove('shaking')
  }, 500)
}

// 雨を作成
const createRainDrops = () => {
  const container = document.querySelector('.light-background') as HTMLElement
  if (!container || weatherState.value !== 'rainy') return

  const createDrop = () => {
    if (weatherState.value !== 'rainy' && weatherState.value !== 'stormy')
      return

    const drop = document.createElement('div')
    drop.className = 'raindrop'
    drop.style.left = `${Math.random() * 100}%`
    drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`
    drop.style.opacity = `${Math.random() * 0.7 + 0.3}`
    container.appendChild(drop)

    setTimeout(() => {
      drop.remove()
    }, 2000)
  }

  // 定期的に雨滴を作成
  const rainInterval = setInterval(() => {
    if (weatherState.value !== 'rainy' && weatherState.value !== 'stormy') {
      clearInterval(rainInterval)
      return
    }

    for (let i = 0; i < 5; i++) {
      createDrop()
    }
  }, 100)
}

// 雷を作成
const createLightning = () => {
  const container = document.querySelector('.light-background') as HTMLElement
  if (!container || weatherState.value !== 'stormy') return

  const flashLightning = () => {
    if (weatherState.value !== 'stormy') return

    const lightning = document.createElement('div')
    lightning.className = 'lightning'
    container.appendChild(lightning)

    setTimeout(() => {
      lightning.remove()
    }, 200)
  }

  const stormInterval = setInterval(() => {
    if (weatherState.value !== 'stormy') {
      clearInterval(stormInterval)
      return
    }

    if (Math.random() > 0.7) {
      flashLightning()
    }
  }, 2000)
}

// 虹を表示
const showRainbowEffect = () => {
  if (weatherState.value === 'sunny' && showRainbow.value === false) {
    showRainbow.value = true
    setTimeout(() => {
      showRainbow.value = false
    }, 60000) // 60秒後に虹を消す
  }
}

// 風のイベント - TailwindCSSのアイコンクリックで晴れに変化
const applyWind = () => {
  // 曇天/雨天/雷雨 いずれからも晴れへ遷移
  if (weatherState.value !== 'sunny') {
    const prev = weatherState.value
    setSunnyWeather()

    // 雨天・雷雨から晴天になった場合のみ虹を表示
    if (prev === 'rainy' || prev === 'stormy') {
      showRainbowEffect()
    }

    // 雲を画面外に飛ばす（退場は画面外で）
    draggableClouds.value.forEach((cloud) => {
      cloud.style.transition = 'transform 2s ease-out, opacity 2s ease-out'
      cloud.style.transform = 'translateX(150vw)'
      cloud.style.opacity = '0'

      setTimeout(() => {
        cloud.style.transition = ''
        cloud.style.transform = ''
        cloud.style.opacity = '0.8'
        // 次の巡回は画面外から入ってくる
        cloud.style.left = `${-300 - Math.round(Math.random() * 250)}px`

        // 時間差で戻す（次のアニメーションに合わせる）
        setTimeout(() => {
          cloud.style.transition = 'left 20s linear'
          cloud.style.left = '100vw'
        }, 800)
      }, 2000)
    })
  }
}

// 雷のイベント - Viteのアイコンクリックで雷雨に変化
const applyLightning = () => {
  if (weatherState.value === 'rainy') {
    startStorm()
  }
}

  // グローバル変数でマウス位置を追跡
let lastMouseX = 0;
let lastMouseY = 0;
// アニメーションフレームのリクエスト用ID
let animationFrameId: number | null = null;
// ドラッグ座標のキャッシュ
let dragCacheX = 0;
let dragCacheY = 0;

// requestAnimationFrameを使用してドラッグ位置を更新する関数
const updateDragPosition = () => {
  animationFrameId = null

  const activeElement = activeCloud || activeSun
  if (!activeElement) return

  // キャッシュされた座標から位置を計算
  const left = dragCacheX - offsetX
  const top = dragCacheY - offsetY

  // スタイルを更新
  activeElement.style.left = `${left}px`
  activeElement.style.top = `${top}px`

  // 雲のシェイク検出（曇天時）
  if (activeCloud) {
    const now = performance.now()
    const dx = left - lastDragLeft
    const absDx = Math.abs(dx)
    // 一定以上の左右移動のみ評価
    if (absDx > 6) {
      const dir = dx > 0 ? 1 : -1
      if (lastDir !== 0 && dir !== lastDir && now - lastShakeTs < 400) {
        shakeScore += 1
      } else {
        // 時間で減衰
        shakeScore *= 0.9
      }
      lastDir = dir
      lastShakeTs = now
      // 一定回数方向転換したら雨を開始
      if (shakeScore >= 3 && weatherState.value === 'cloudy') {
        shakeCloud(activeCloud)
        startRain()
        shakeScore = 0
      }
    }
    lastDragLeft = left
  }

  // ドラッグ中の特殊効果を抑制的に
  if (Math.random() > 0.95) {
    if (activeCloud && weatherState.value === 'cloudy' && Math.random() > 0.7) {
      shakeCloud(activeCloud)
    }
    if (
      activeSun &&
      (weatherState.value === 'rainy' || weatherState.value === 'stormy') &&
      Math.random() > 0.7
    ) {
      makeRainbow()
    }
  }
};

// 共通ドラッグイベントハンドラ
const handleMouseMove = (event: MouseEvent) => {
  // マウスの現在位置を常に記録（ドラッグ後のホバー検出用）
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  
  if (!isCloudBeingDragged && !isSunBeingDragged) return

  // ドラッグ座標をキャッシュ（requestAnimationFrameで使用）
  dragCacheX = event.clientX;
  dragCacheY = event.clientY;
  
  // アニメーションフレームがまだ要求されていなければ要求する
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(() => updateDragPosition());
  }

  // この部分はupdateDragPositionに移動しました
}

const handleTouchMove = (event: TouchEvent) => {
  if (
    (!isCloudBeingDragged && !isSunBeingDragged) ||
    event.touches.length !== 1
  )
    return

  const touch = event.touches[0]
  // タッチ位置を保存
  dragCacheX = touch.clientX;
  dragCacheY = touch.clientY;
  
  // アニメーションフレームがまだ要求されていなければ要求する
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(() => updateDragPosition());
  }
  
  // スクロール防止
  event.preventDefault();

  // スクロール防止
  event.preventDefault()
}

const handleDragEnd = () => {
  if (!isCloudBeingDragged && !isSunBeingDragged) return

  // アニメーションフレームをキャンセル
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (activeCloud) {
    activeCloud.classList.remove('dragging')
    activeCloud.style.cursor = 'grab'
    activeCloud.style.zIndex = '10'

    // 晴れのときのみ、ホバーしていなければアニメーション再開
    if (weatherState.value === 'sunny') {
      const cloudRect = activeCloud.getBoundingClientRect()
      const isMouseOverCloud =
        lastMouseX >= cloudRect.left &&
        lastMouseX <= cloudRect.right &&
        lastMouseY >= cloudRect.top &&
        lastMouseY <= cloudRect.bottom
      if (!isMouseOverCloud) {
        activeCloud.style.animationPlayState = 'running'
      }
    }

    // スナップで曇天化（晴天時のみ）。曇天->晴天の自動復帰はしない。
    if (weatherState.value === 'sunny') {
      if (!trySnapUnderSun(activeCloud)) {
        if (isSunCovered()) {
          setCloudyWeather()
        }
      }
    }
  }

  if (activeSun) {
    activeSun.classList.remove('dragging')
    activeSun.style.cursor = 'grab'
    activeSun.style.zIndex = '2'
  }

  // リセット（シェイク検出も）
  activeCloud = null
  activeSun = null
  isCloudBeingDragged = false
  isSunBeingDragged = false
  lastDir = 0
  shakeScore = 0
}

onMounted(() => {
  // 要素の参照を取得
  draggableClouds.value = Array.from(
    document.querySelectorAll('.draggable-cloud'),
  ) as HTMLElement[]
  draggableSun.value = document.querySelector('.sun')

  // クラウドのドラッグ機能を初期化
  setupCloudDragging()

  // 各クラウドをドラッグ可能にする
  draggableClouds.value.forEach((cloud) => {
    cloud.addEventListener('mousedown', startCloudDrag)
    cloud.addEventListener('touchstart', startCloudTouch, { passive: false })

    cloud.style.cursor = 'grab'
    cloud.style.zIndex = '10'
    cloud.style.position = 'absolute'
    cloud.style.willChange = 'transform, left, top'

    // 初期位置は画面外（左）から
    const randomTop = Math.round(Math.random() * (window.innerHeight * 0.35)) + 60
    cloud.style.left = `${-300 - Math.round(Math.random() * 250)}px`
    cloud.style.top = `${randomTop}px`

    cloud.style.transform = 'translateZ(0)'
    cloud.style.backfaceVisibility = 'hidden'

    applyRandomCloudStyle(cloud)

    // アニメーション1周ごとに、画面外で再ランダム化
    const onIter = () => {
      if (weatherState.value === 'sunny') {
        cloud.style.left = `${-300 - Math.round(Math.random() * 250)}px`
        cloud.style.top = `${Math.round(Math.random() * (window.innerHeight * 0.4)) + 40}px`
        applyRandomCloudStyle(cloud)
      }
    }
    cloud.addEventListener('animationiteration', onIter)

    cloud.addEventListener('mouseenter', () => {
      cloud.style.cursor = 'grab'
      if (weatherState.value === 'sunny') {
        cloud.style.animationPlayState = 'paused'
      }
    })

    cloud.addEventListener('mouseleave', () => {
      if (!cloud.classList.contains('dragging')) {
        cloud.style.cursor = 'grab'
        if (weatherState.value === 'sunny' && !isCloudBeingDragged) {
          cloud.style.animationPlayState = 'running'
        }
      }
    })
  })

  // グローバルイベントを登録
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleDragEnd)
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
  window.addEventListener('touchend', handleDragEnd)
  window.addEventListener('touchcancel', handleDragEnd)
})

onUnmounted(() => {
  stopRain()
  stopStorm()

  // 個別のイベントリスナーを削除
  draggableClouds.value.forEach((cloud) => {
    cloud.removeEventListener('mousedown', startCloudDrag)
    cloud.removeEventListener('touchstart', startCloudTouch)
  })

  // グローバルイベントリスナーを削除
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleDragEnd)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('touchend', handleDragEnd)
  window.removeEventListener('touchcancel', handleDragEnd)
})

// 外部からのアクセスのためにメソッドを公開
defineExpose({
  applyWind,
  applyLightning,
})
</script>

<template>
  <div :class="['light-background', weatherState]">
    <div 
      ref="draggableSun" 
      class="sun" 
    />
    <div
      v-for="(_, index) in 3"
      :key="index"
      class="draggable-cloud"
      :class="`cloud${index + 1}`"
    />
    <div 
      v-if="showRainbow" 
      class="rainbow" 
    />
    <div 
      v-if="weatherState === 'cloudy'" 
      class="weather-info"
    >
      曇天モード - 雲を揺らして雨を降らせよう
    </div>
    <div 
      v-if="weatherState === 'rainy'" 
      class="weather-info"
    >
      雨天モード - TailwindCSSの風アイコンで晴れに
    </div>
    <div 
      v-if="weatherState === 'stormy'" 
      class="weather-info"
    >
      雷雨モード - 稲妻が落ちる
    </div>
  </div>
</template>

<style scoped>
/* 基本スタイル */
.light-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  z-index: 1;
  transition: background 1.5s ease;
  pointer-events: auto; /* 確実にポインターイベントを受け取る */
}

/* 天気に応じた背景 */
.light-background.sunny {
  background: linear-gradient(to bottom, #87ceeb, #e0f2ff);
}

.light-background.cloudy {
  background: linear-gradient(to bottom, #b4c8d9, #dbe4eb);
}

.light-background.rainy {
  background: linear-gradient(to bottom, #708090, #a9b8c7);
}

.light-background.stormy {
  background: linear-gradient(to bottom, #4a5b6c, #7b8a99);
}

/* 太陽 */
.sun {
  position: absolute;
  top: 10%;
  right: 15%;
  width: 100px;
  height: 100px;
  background-color: #ffcc00;
  border-radius: var(--border-radius-circle);
  box-shadow:
    0 0 50px #ffdd44,
    0 0 100px #ffdd44;
  transition: box-shadow 0.5s ease;
  z-index: 1;
  cursor: grab; /* カーソルをつかむ形に */
  user-select: none; /* テキスト選択防止 */
  touch-action: none; /* タッチイベントのデフォルト動作を無効化 */
}

.sunny .sun {
  box-shadow:
    0 0 50px #ffdd44,
    0 0 100px #ffdd44;
}

.cloudy .sun {
  box-shadow:
    0 0 30px rgba(255, 221, 68, 0.7),
    0 0 60px rgba(255, 221, 68, 0.4);
}

.rainy .sun,
.stormy .sun {
  box-shadow:
    0 0 10px rgba(255, 221, 68, 0.4),
    0 0 20px rgba(255, 221, 68, 0.2);
}

/* 雲 */
.draggable-cloud {
  position: absolute;
  background: white;
  border-radius: var(--border-radius-circle);
  opacity: 0.8;
  z-index: 10; /* z-indexを上げて最前面に表示 */
  cursor: grab; /* カーソルをつかむ形に */
  user-select: none; /* テキスト選択防止 */
  touch-action: none; /* タッチイベントのデフォルト動作を無効化 */
  pointer-events: auto; /* クリックイベントを確実に受け取る */
  will-change: transform, left, top; /* パフォーマンス最適化 */
  transition: filter 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease; /* トランジションを最適化 */
  -webkit-transform: translateZ(0); /* モバイル向けGPUアクセラレーション */
  transform: translateZ(0); /* GPUアクセラレーション */
}

/* ホバー時のエフェクト - transform を使わない設計に変更 */
.draggable-cloud:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  opacity: 1;
}

.draggable-cloud::before,
.draggable-cloud::after {
  content: '';
  position: absolute;
  background: white;
  border-radius: var(--border-radius-circle);
}

/* 形状をCSS変数で制御 */
.draggable-cloud::before {
  width: var(--before-w, 60px);
  height: var(--before-h, 60px);
  top: var(--before-top, -30px);
  left: var(--before-left, 20px);
}

.draggable-cloud::after {
  width: var(--after-w, 80px);
  height: var(--after-h, 80px);
  top: var(--after-top, -40px);
  right: var(--after-right, 10px);
}

/* 晴れの日は雲が自動で流れる */
.sunny .draggable-cloud {
  animation: moveCloud 60s linear infinite;
  /* トランジションはドラッグ操作パフォーマンスに影響するため、必要最小限に */
}

/* 旧cloud1/2/3のサイズ指定はインラインスタイルで上書きされるため残置可 */
.cloud1 { width: 120px; height: 40px; }
.cloud2 { width: 150px; height: 50px; }
.cloud3 { width: 100px; height: 30px; }

.cloudy .draggable-cloud,
.rainy .draggable-cloud,
.stormy .draggable-cloud {
  animation: none;
}

.cloudy .draggable-cloud {
  opacity: 0.9;
  /* 水滴のような小さな青いドットをうっすら表示 */
  background-image: radial-gradient(rgba(120, 170, 255, 0.18) 3px, transparent 3px);
  background-size: 22px 22px;
  background-position: 6px 6px;
}

.rainy .draggable-cloud,
.stormy .draggable-cloud {
  opacity: 1;
  filter: brightness(0.8);
}

/* ドラッグ可能なアイテム */
.draggable {
  cursor: grab;
  user-select: none;
  position: absolute;
}

/* 雲が揺れるアニメーション */
.shaking {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-5px);
  }
  80% {
    transform: translateX(5px);
  }
}

/* 雨のスタイル */
.raindrop {
  position: absolute;
  width: 2px;
  height: 18px;
  background: rgba(180, 210, 255, 0.9);
  top: -20px;
  animation: rain 1.2s linear forwards;
  z-index: 3;
  box-shadow: 0 0 6px rgba(180, 210, 255, 0.6);
}

@keyframes rain {
  to {
    transform: translateY(120vh);
  }
}

/* 雷のスタイル */
.lightning {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  z-index: 4;
  animation: flash 0.35s ease-out;
}

@keyframes flash {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

/* 曇天の雲は水滴風ドット、出現/消滅は画面外で */
.cloudy .draggable-cloud {
  opacity: 0.9;
  background-image: radial-gradient(rgba(120, 170, 255, 0.18) 3px, transparent 3px);
  background-size: 22px 22px;
  background-position: 6px 6px;
}

/* 天気の説明表示 */
.weather-info {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  z-index: 10;
  opacity: 0;
  animation: fadeInOut 5s ease-in-out forwards;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
