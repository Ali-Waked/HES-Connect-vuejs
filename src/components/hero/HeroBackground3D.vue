<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const canvasRef = ref(null)
let scene, camera, renderer, animationId
let particles, lines, particleVelocities

const PARTICLE_COUNT = 180
const CONNECTION_DISTANCE = 110
const ROTATION_SPEED = 0.0003

function init() {
  const container = canvasRef.value
  if (!container) return
  const w = container.clientWidth
  const h = container.clientHeight

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
  camera.position.z = 300

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(PARTICLE_COUNT * 3)
  particleVelocities = []

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 600
    pos[i * 3 + 1] = (Math.random() - 0.5) * 400
    pos[i * 3 + 2] = (Math.random() - 0.5) * 300
    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.25,
      y: (Math.random() - 0.5) * 0.25,
      z: (Math.random() - 0.5) * 0.12,
    })
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))

  const mat = new THREE.PointsMaterial({
    color: 0x06b6d4,
    size: 2.2,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  particles = new THREE.Points(geo, mat)
  scene.add(particles)

  const lineGeo = new THREE.BufferGeometry()
  const linePos = new Float32Array(PARTICLE_COUNT * 6)
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
  lineGeo.setDrawRange(0, 0)

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  lines = new THREE.LineSegments(lineGeo, lineMat)
  scene.add(lines)

  animate()
}

function updateConnections() {
  const pos = particles.geometry.attributes.position.array
  const lp = lines.geometry.attributes.position.array
  let count = 0
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const ix = i * 3
    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      const jx = j * 3
      const dx = pos[ix] - pos[jx]
      const dy = pos[ix + 1] - pos[jx + 1]
      const dz = pos[ix + 2] - pos[jx + 2]
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < CONNECTION_DISTANCE) {
        lp[count * 3] = pos[ix]
        lp[count * 3 + 1] = pos[ix + 1]
        lp[count * 3 + 2] = pos[ix + 2]
        lp[count * 3 + 3] = pos[jx]
        lp[count * 3 + 4] = pos[jx + 1]
        lp[count * 3 + 5] = pos[jx + 2]
        count += 2
      }
    }
  }
  lines.geometry.attributes.position.needsUpdate = true
  lines.geometry.setDrawRange(0, count)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  particles.rotation.x += ROTATION_SPEED * 0.5
  particles.rotation.y += ROTATION_SPEED

  const pos = particles.geometry.attributes.position.array
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i * 3] += particleVelocities[i].x
    pos[i * 3 + 1] += particleVelocities[i].y
    pos[i * 3 + 2] += particleVelocities[i].z
    if (Math.abs(pos[i * 3]) > 300) particleVelocities[i].x *= -1
    if (Math.abs(pos[i * 3 + 1]) > 200) particleVelocities[i].y *= -1
    if (Math.abs(pos[i * 3 + 2]) > 150) particleVelocities[i].z *= -1
  }
  particles.geometry.attributes.position.needsUpdate = true
  updateConnections()
  renderer.render(scene, camera)
}

function onResize() {
  if (!renderer) return
  const c = canvasRef.value
  const w = c.clientWidth
  const h = c.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

let paused = false
function onVisibility() {
  if (document.hidden) {
    paused = true
    if (animationId) cancelAnimationFrame(animationId)
  } else {
    paused = false
    animate()
  }
}

onMounted(() => {
  init()
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibility)
  if (animationId) cancelAnimationFrame(animationId)
  renderer?.dispose()
  renderer?.domElement?.remove()
  particles?.geometry?.dispose()
  particles?.material?.dispose()
  lines?.geometry?.dispose()
  lines?.material?.dispose()
})
</script>

<template>
  <div ref="canvasRef" class="absolute inset-0 z-0"></div>
</template>
